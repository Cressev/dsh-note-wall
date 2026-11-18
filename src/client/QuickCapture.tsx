/**
 * Frame-wide capture surfaces: the ⌘/Ctrl+Shift+N quick bar, the
 * "pin selection to wall" pill that floats beside selected conversation text,
 * a save toast, and the jump-back-to-origin scroll.
 *
 * @module sticky-wall-plugin/client/QuickCapture
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { STICKY_COLORS, type StickyColor, type StickyNoteWire } from '../remote.ts'
import type { WallSource, WallSnapshot } from './wall-source.ts'
import { clipboardImageFiles, readImageFile } from './note-markdown.tsx'
import type { StickyWallKey } from './locales.ts'
import { css } from './QuickCapture.styles.ts'

/** Injected face for the overlay host. */
export interface QuickCaptureInjected {
  /** Shared wall action face. */
  readonly source: WallSource
  readonly hooks: { readonly wall: WallSource }
}

/** Full props of the overlay host. */
export type QuickCaptureProps =
  PropsRuntime<'shell.overlay'>
  & PropsLocale<'stickyWall'>
  & InjectFace<QuickCaptureInjected>

/** One live selection capture candidate. */
interface SelectionCandidate {
  readonly text: string
  readonly turn: number | null
  readonly x: number
  readonly y: number
}

const QUICK_SHORTCUT = 'sticky-wall-quick'

/** True when the keyboard event is the ⌘/Ctrl+Shift+N toggle. */
function isQuickToggle(e: KeyboardEvent): boolean {
  return e.key.toLowerCase() === 'n' && e.shiftKey && (e.metaKey || e.ctrlKey)
}

/** Turn index from a conversation DOM position, when the chat view marks one. */
function turnAt(node: Node | null): number | null {
  let cursor: Node | null = node
  while (cursor !== null && cursor instanceof Element) {
    for (const attr of ['data-turn-process', 'data-turn-tail', 'data-turn-trigger']) {
      const value = cursor.getAttribute(attr)
      if (value !== null) {
        const parsed = Number.parseInt(value, 10)
        if (Number.isInteger(parsed)) return parsed
      }
    }
    cursor = cursor.parentElement
  }
  return null
}

/** True when the node sits inside the user's own authored text — an
 * editable, our own overlay, a user message bubble, or the composer.
 * Selection capture targets AI replies only: text the user wrote (history
 * or draft) never raises the pin pill.
 *
 * The walk starts from the raw node, which for a live selection is usually
 * a Text node — `instanceof HTMLElement` alone would skip the loop entirely
 * and defeat every check below. */
function inUserAuthoredText(node: Node | null): boolean {
  let cursor: Node | null = node
  while (cursor !== null && cursor !== document.body) {
    if (cursor instanceof HTMLElement) {
      if (cursor.hasAttribute('data-sticky-overlay')) return true
      if (cursor.hasAttribute('data-message-bubble')) return true
      if (cursor.hasAttribute('data-composer-card') || cursor.hasAttribute('data-composer-input')) return true
      const tag = cursor.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || cursor.isContentEditable) return true
    }
    cursor = cursor.parentElement
  }
  return false
}

/**
 * Scroll the conversation to the element containing the captured snippet and
 * flash it. Polls briefly: the session view may still be mounting after
 * `openSession`.
 * @param snippet - captured text to locate.
 * @returns completion; unresolved polls flash nothing.
 */
export async function scrollToSnippet(snippet: string): Promise<void> {
  const needle = snippet.replace(/\s+/g, ' ').trim().slice(0, 48)
  if (needle.length === 0) return
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    const hit = findSnippetHost(needle)
    if (hit !== undefined) {
      hit.scrollIntoView({ behavior: 'smooth', block: 'center' })
      hit.setAttribute('data-sticky-flash', '')
      window.setTimeout(() => { hit.removeAttribute('data-sticky-flash') }, 2400)
      return
    }
    await new Promise(resolve => { window.setTimeout(resolve, 250) })
  }
}

/** Innermost element whose own text contains the needle. */
function findSnippetHost(needle: string): HTMLElement | undefined {
  let best: HTMLElement | undefined
  for (const el of document.querySelectorAll<HTMLElement>('p, li, pre, code, span, div')) {
    if (el.closest('[data-sticky-overlay]') !== null) continue
    const text = (el.textContent ?? '').replace(/\s+/g, ' ')
    if (!text.includes(needle)) continue
    if (best === undefined || best.contains(el)) best = el
  }
  return best
}

/** The overlay host: quick bar, selection pill, and toast. */
export function QuickCapture(props: QuickCaptureProps): ReactNode {
  const { t, useWall, source } = props
  const wall = useWall((snapshot: WallSnapshot) => snapshot)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState<StickyColor>('yellow')
  const [folderId, setFolderId] = useState('')
  const [candidate, setCandidate] = useState<SelectionCandidate | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<readonly { id: string, dataUrl: string }[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const toastTimer = useRef<number>(0)

  /** Flash one toast line for two seconds. */
  function showToast(line: string): void {
    setToast(line)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => { setToast(null) }, 2000)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (isQuickToggle(e)) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey) }
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onSelect(): void {
      const selection = window.getSelection()
      if (selection === null || selection.isCollapsed || selection.rangeCount === 0) {
        setCandidate(null)
        return
      }
      const anchor = selection.anchorNode
      if (anchor === null || inUserAuthoredText(anchor)) {
        setCandidate(null)
        return
      }
      const text = selection.toString().trim()
      if (text.length < 2) {
        setCandidate(null)
        return
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setCandidate(null)
        return
      }
      setCandidate({ text, turn: turnAt(anchor), x: rect.left + rect.width / 2, y: rect.bottom + 8 })
    }
    document.addEventListener('mouseup', onSelect)
    document.addEventListener('keyup', onSelect)
    return () => {
      document.removeEventListener('mouseup', onSelect)
      document.removeEventListener('keyup', onSelect)
    }
  }, [])

  /** Pin the current selection as a note with its conversation origin. */
  function captureSelection(): void {
    if (candidate === null) return
    const sessionId = currentStickySessionId()
    source.createNote(candidate.text, {
      color,
      origin: {
        sessionId,
        turn: candidate.turn,
        snippet: candidate.text,
      },
    })
    window.getSelection()?.removeAllRanges()
    setCandidate(null)
    showToast(t('captured'))
  }

  /** Pin the quick-bar draft; pasted images attach to the created note. */
  function submitQuick(): void {
    const text = draft.trim()
    if (text.length === 0 && pendingImages.length === 0) return
    const sessionId = currentStickySessionId()
    const options: { folderId?: string, color: StickyColor, origin?: { sessionId: string, turn: null, snippet: string } } = { color }
    if (folderId !== '') options.folderId = folderId
    if (sessionId !== '') options.origin = { sessionId, turn: null, snippet: text.slice(0, 120) }
    source.createNote(text.length === 0 ? '🖼' : text, options)
    if (pendingImages.length > 0) {
      const ids = pendingImages.map(entry => entry.id)
      window.setTimeout(() => {
        const newest = [...source.getSnapshot().notes]
          .filter(n => n.deletedAt === null)
          .sort((a, b) => b.createdAt - a.createdAt)[0]
        if (newest !== undefined) source.attachImages(newest.id, ids)
      }, 600)
    }
    setDraft('')
    setPendingImages([])
    showToast(t('captured'))
    inputRef.current?.focus()
  }

  /** Upload pasted image files into the pending strip. */
  async function handlePaste(e: React.ClipboardEvent): Promise<void> {
    const files = clipboardImageFiles(e)
    if (files.length === 0) return
    e.preventDefault()
    for (const file of files) {
      const dataUrl = await readImageFile(file)
      const id = await source.saveImage(dataUrl)
      if (id !== undefined) setPendingImages(prev => [...prev, { id, dataUrl }])
    }
  }

  if (!open && candidate === null && toast === null) return null

  return (
    <div className={css.root} data-sticky-overlay>
      {open && (
        <div className={clsx(css.quick, css.quickOpen)} data-color={color}>
          <div className={css.quickHead}>
            <span className={css.quickTitle}> ✏️ {t('quickTitle')}</span>
            <Tooltip label={t('cancel')} side="bottom" portal>
              <button className={css.quickClose} onClick={() => { setOpen(false) }}>✕</button>
            </Tooltip>
          </div>
          <textarea
            ref={inputRef}
            className={css.quickArea}
            value={draft}
            placeholder={t('quickPlaceholder')}
            rows={3}
            onChange={e => { setDraft(e.target.value) }}
            onPaste={e => { void handlePaste(e) }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submitQuick()
              }
            }}
          />
          {pendingImages.length > 0 && (
            <div className={css.pasteStrip}>
              {pendingImages.map(img => <img key={img.id} className={css.pasteThumb} src={img.dataUrl} alt="" />)}
            </div>
          )}
          <div className={css.quickFoot}>
            <div className={css.dots}>
              {STICKY_COLORS.map((c, i) => (
                <Tooltip key={c} label={t('colorNames').split('|')[i] ?? c} side="bottom" portal>
                  <button className={clsx(css.dot, color === c && css.dotActive)} data-color={c} onClick={() => { setColor(c) }} />
                </Tooltip>
              ))}
            </div>
            <select className={css.select} value={folderId} onChange={e => { setFolderId(e.target.value) }}>
              <option value="">{wall.folders.find(f => f.builtin === true)?.emoji ?? '🗂️'} {wall.folders.find(f => f.builtin === true)?.name ?? '…'}</option>
              {wall.folders.filter(f => f.builtin !== true).map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
            </select>
          </div>
          <div className={css.quickHint}>{t('quickHint')}</div>
        </div>
      )}
      {candidate !== null && !open && (
        <button
          className={css.pill}
          style={{ left: candidate.x, top: candidate.y }}
          onMouseDown={e => { e.preventDefault() }}
          onClick={captureSelection}
        >{t('capturePill')}</button>
      )}
      {toast !== null && <div className={css.toast}>{toast}</div>}
    </div>
  )
}

/** Session id of the conversation the session tracker last mounted in. */
let stickySessionId = ''

/** Record the session id the conversation view is currently showing. */
export function setStickySessionId(sessionId: string): void {
  stickySessionId = sessionId
}

/** @returns the tracked session id, or '' when no conversation is mounted. */
export function currentStickySessionId(): string {
  return stickySessionId
}

/** Shared jump: open the origin session, then scroll to the snippet. */
export function makeJump(openSession: (sessionId: string) => void): (note: StickyNoteWire) => void {
  return (note) => {
    if (note.origin === null) return
    openSession(note.origin.sessionId)
    void scrollToSnippet(note.origin.snippet)
  }
}
