/**
 * Sticky wall page: quick-capture row, folder pills, a candy sticky-note grid
 * or compact list (switchable), markdown notes, interactive todos, pasted
 * images, a full edit dialog, trash view, snapshots, and exports.
 *
 * @module sticky-wall-plugin/client/StickyWallPage
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import clsx from 'clsx'
import {
  Button, IconCheckOutlineRegular, IconChecklistOutlineRegular, IconCloseOutlineRegular,
  IconCodeOutlineRegular, IconEditOutlineRegular, IconEllipsisOutlineRegular,
  IconFlatListOutlineRegular, IconFolderOpenOutlineRegular, IconPinOutlineRegular,
  IconPlusOutlineRegular, IconSearchOutlineRegular, IconTrashOutlineRegular,
  Input, Modal, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { STICKY_COLORS, type StickyColor, type StickyFolderWire, type StickyNoteWire } from '../remote.ts'
import type { WallSource, WallSnapshot } from './wall-source.ts'
import {
  NoteMarkdown, applyNoteFormat, clipboardImageFiles, readImageFile, toggleTask,
} from './note-markdown.tsx'
import type { NoteFormat } from './note-markdown.tsx'
import type { StickyWallKey } from './locales.ts'
import { css } from './StickyWallPage.styles'
import { css as mdCss } from './note-markdown.styles'

/** Palette keys in display order. */
const COLOR_ORDER: readonly StickyColor[] = STICKY_COLORS

/** Selected folder: everything, one folder, or the trash. */
export type FolderFilter = 'all' | 'trash' | string

/** Wall body layout: candy cards or a compact list. */
export type WallViewMode = 'cards' | 'list'

/** localStorage key keeping the wall layout choice. */
const VIEW_MODE_KEY = 'stickyWall.viewMode'

/** Toolbar entries: icon components where the set ships one, refined letter
 * glyphs for bold/italic/strike/heading (letters are the established idiom,
 * the old raw characters were just badly styled). */
const FORMAT_BUTTONS: readonly { format: NoteFormat, label: string, title: string, glyph?: 'bold' | 'italic' | 'strike' | 'heading' }[] = [
  { format: 'bold', label: 'B', title: '粗体 **文字**', glyph: 'bold' },
  { format: 'italic', label: 'I', title: '斜体 *文字*', glyph: 'italic' },
  { format: 'strike', label: 'S', title: '删除线 ~~文字~~', glyph: 'strike' },
  { format: 'code', label: '', title: '行内代码 `文字`' },
  { format: 'h2', label: 'H', title: '标题 ## 文字', glyph: 'heading' },
  { format: 'ul', label: '', title: '无序列表 - 项目' },
  { format: 'ol', label: '', title: '有序列表 1. 项目' },
  { format: 'task', label: '', title: '待办 - [ ] 任务' },
]

/** Injected face: the wall source plus the conversation jump action. */
export interface StickyWallInjected {
  /** Direct action face of the shared wall source. */
  readonly source: WallSource
  /** Open the origin conversation and scroll to the captured text. */
  readonly jumpToOrigin: (note: StickyNoteWire) => void
  readonly hooks: { readonly wall: WallSource }
}

/** Full props of the wall page. */
export type StickyWallPageProps =
  PropsRuntime<'main'>
  & PropsLocale<'stickyWall'>
  & InjectFace<StickyWallInjected>

/** Ordered-list glyph: a "1." marker beside list lines. The shipped icon set
 * has no numbered-list art; ListPen read as generic text editing, and users
 * could not tell the button made an ordered list. */
function OlListGlyph({ size = 14 }: { size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <text x="0.4" y="10.8" fontSize="9" fontWeight="700" fill="currentColor">1.</text>
      <line x1="6.4" y1="3.2" x2="13" y2="3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6.4" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6.4" y1="10.8" x2="13" y2="10.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Render one toolbar entry: icon art for code/list/todo, styled letter for
 * bold/italic/strike/heading, custom glyph for ordered list. */
function renderFormatGlyph(btn: { format: NoteFormat, label: string, glyph?: 'bold' | 'italic' | 'strike' | 'heading' }): ReactNode {
  if (btn.format === 'code') return <IconCodeOutlineRegular size={14} />
  if (btn.format === 'ul') return <IconFlatListOutlineRegular size={14} />
  if (btn.format === 'ol') return <OlListGlyph size={14} />
  if (btn.format === 'task') return <IconChecklistOutlineRegular size={14} />
  return <span className={mdCss['glyph' + (btn.glyph === 'bold' ? 'Bold' : btn.glyph === 'italic' ? 'Italic' : btn.glyph === 'strike' ? 'Strike' : 'Heading')]}>{btn.label}</span>
}

/** Stored layout preference, defaulting to cards. */
function loadViewMode(): WallViewMode {
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_KEY)
    return stored === 'list' ? 'list' : 'cards'
  } catch {
    return 'cards'
  }
}

/** Tooltip-wrapped hover hint for one icon control (instant, styled).
 * The bubble portals to the body: cards and list rows sit inside transformed
 * (rotated/tilted) ancestors, and a CSS transform hijacks the containing
 * block of fixed-position descendants — without the portal the bubble's
 * viewport coordinates get reinterpreted in the rotated frame and it flies
 * far away from its anchor. */
function Tip(props: { label: string, side?: 'top' | 'bottom', children: ReactElement<Record<string, unknown>> }): ReactNode {
  return <Tooltip label={props.label} side={props.side ?? 'top'} portal>{props.children as ReactElement<never>}</Tooltip>
}

/** Local time "MM-DD HH:mm" for note cards. */
function noteStamp(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Deterministic per-note tilt so the wall looks hand-pinned, not gridded. */
function tiltOf(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ((hash % 7) - 3) * 0.5
}

/** Single-line preview of note source text with markdown markers stripped. */
function summaryOf(note: StickyNoteWire): string {
  const raw = note.text.split('\n').find(line => line.trim().length > 0) ?? ''
  return raw
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*]\s+\[[ xX]\]\s+/, '☑ ')
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.、]\s*/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim() || '🖼'
}

/** The wall page. */
export function StickyWallPage(props: StickyWallPageProps): ReactNode {
  const { t, useWall, source, jumpToOrigin } = props
  const wall = useWall((snapshot: WallSnapshot) => snapshot)
  const [filter, setFilter] = useState<FolderFilter>('all')
  const [viewMode, setViewMode] = useState<WallViewMode>(loadViewMode)
  const [query, setQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StickyNoteWire | null>(null)
  const [folderModal, setFolderModal] = useState<null | { mode: 'create' } | { mode: 'rename', folder: StickyFolderWire }>(null)
  const [moveTarget, setMoveTarget] = useState<StickyNoteWire | null>(null)
  const [snapshotsOpen, setSnapshotsOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<ReadonlyMap<string, string>>(new Map())

  const folders = wall.folders
  const colorNames = t('colorNames').split('|')

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, viewMode)
    } catch {
      // Layout preference is best-effort; a blocked store just forgets it.
    }
  }, [viewMode])

  // Lazily load every referenced image's data URL once.
  useEffect(() => {
    const missing: string[] = [...new Set<string>((wall.notes as { images?: string[] }[]).flatMap(note => note.images ?? []))].filter(id => !imageUrls.has(id))
    if (missing.length === 0) return
    let alive = true
    for (const id of missing) {
      void source.image(id).then(dataUrl => {
        if (alive && dataUrl !== undefined) {
          setImageUrls(prev => new Map(prev).set(id, dataUrl))
        }
      })
    }
    return () => { alive = false }
  }, [wall.notes, imageUrls, source])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const live = wall.notes.filter(note => note.deletedAt === null)
    const base = filter === 'trash'
      ? wall.notes.filter(note => note.deletedAt !== null)
      : filter === 'all' ? live : live.filter(note => note.folderId === filter)
    const matched = needle.length === 0 ? base : base.filter(note => note.text.toLowerCase().includes(needle))
    return [...matched].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      // Creation order, not edit order: editing a note must not teleport it
      // to the top of the wall — the wall is where things live, not a feed.
      return b.createdAt - a.createdAt
    })
  }, [wall.notes, filter, query])

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const note of wall.notes) {
      if (note.deletedAt !== null) continue
      counts.set(note.folderId, (counts.get(note.folderId) ?? 0) + 1)
    }
    return counts
  }, [wall.notes])

  const trashCount = wall.notes.filter(note => note.deletedAt !== null).length
  const folderById = (id: string): StickyFolderWire | undefined => folders.find(f => f.id === id)
  const liveTotal = [...folderCounts.values()].reduce((a, b) => a + b, 0)

  /** Create from the compose dialog; pending images attach once the note exists. */
  function createNote(text: string, color: StickyColor, folderId: string, imageIds: readonly string[]): void {
    const options: { folderId?: string, color: StickyColor } = { color }
    if (folderId !== '') options.folderId = folderId
    source.createNote(text, options)
    if (imageIds.length > 0) {
      window.setTimeout(() => { void attachToLatest(imageIds) }, 600)
    }
  }

  /** Attach images to the newest note (the one just created from the dialog). */
  async function attachToLatest(ids: readonly string[]): Promise<void> {
    const newest = [...source.getSnapshot().notes]
      .filter(n => n.deletedAt === null)
      .sort((a, b) => b.createdAt - a.createdAt)[0]
    if (newest !== undefined) source.attachImages(newest.id, ids)
  }

  /** Download one export body as a file. */
  async function download(format: 'markdown' | 'json'): Promise<void> {
    const exported = await source.exportWall(format)
    if (exported === undefined) return
    const blob = new Blob([exported.content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exported.filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  /** Empty the trash after a confirm. */
  function emptyTrash(): void {
    if (window.confirm(t('emptyTrashConfirm'))) source.emptyTrash()
  }

  /** Shared per-note actions for both layouts. */
  const noteActions = {
    togglePin: (note: StickyNoteWire) => { source.updateNote(note.id, { pinned: !note.pinned }) },
    toggleStrike: (note: StickyNoteWire) => { source.updateNote(note.id, { struck: !note.struck }) },
    toggleTask: (note: StickyNoteWire, taskIndex: number) => { source.updateNote(note.id, { text: toggleTask(note.text, taskIndex) }) },
    remove: (note: StickyNoteWire) => { source.deleteNote(note.id) },
    restore: (note: StickyNoteWire) => { source.restoreNote(note.id) },
  }

  return (
    <div className={css.page}>
      {wall.error !== '' && (
        <div className={css.errorBanner} role="alert">
          <span>⚠️ {t('loadFailed')} · {wall.error}</span>
          <button className={css.retryBtn} onClick={() => { source.reload() }}>↻ {t('retry')}</button>
        </div>
      )}

      <div className={css.toolbar}>
        <Button variant="primary" size="sm" icon={<IconPlusOutlineRegular size={14} />} onClick={() => { setComposeOpen(true) }}>
          {t('newNote')}
        </Button>
        <div className={css.searchWrap}>
          <IconSearchOutlineRegular className={css.searchIcon} />
          <Input
            {...(css.search === undefined ? {} : { className: css.search })}
            value={query}
            placeholder={t('searchPlaceholder')}
            onChange={e => { setQuery(e.target.value) }}
          />
          {query !== '' && (
            <button className={css.searchClear} onClick={() => { setQuery('') }} aria-label="clear">
              <IconCloseOutlineRegular size={14} />
            </button>
          )}
        </div>
        <div className={css.viewToggle} role="group" aria-label="view mode">
          <Tip label={t('viewCards')} side="bottom">
            <button
              className={clsx(css.viewBtn, viewMode === 'cards' && css.viewBtnActive)}
              onClick={() => { setViewMode('cards') }}
            >🃏</button>
          </Tip>
          <Tip label={t('viewList')} side="bottom">
            <button
              className={clsx(css.viewBtn, viewMode === 'list' && css.viewBtnActive)}
              onClick={() => { setViewMode('list') }}
            >📋</button>
          </Tip>
        </div>
        <div className={css.toolbarButtons}>
          <Tip label={t('exportMd')} side="bottom">
            <button className={css.toolBtn} onClick={() => { void download('markdown') }}>⬇ MD</button>
          </Tip>
          <Tip label={t('exportJson')} side="bottom">
            <button className={css.toolBtn} onClick={() => { void download('json') }}>⬇ JSON</button>
          </Tip>
          <Tip label={t('snapshots')} side="bottom">
            <button className={css.toolBtn} onClick={() => { setSnapshotsOpen(true) }}>🕐</button>
          </Tip>
        </div>
      </div>

      <div className={css.pills}>
        <button className={clsx(css.pill, filter === 'all' && css.pillActive)} onClick={() => { setFilter('all') }}>
          🧁 {t('all')} <span className={css.count}>{liveTotal}</span>
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            className={clsx(css.pill, filter === folder.id && css.pillActive)}
            data-color={folder.color}
            onClick={() => { setFilter(folder.id) }}
            onContextMenu={e => { e.preventDefault(); setFolderModal({ mode: 'rename', folder }) }}
          >
            {folder.emoji} {folder.name} <span className={css.count}>{folderCounts.get(folder.id) ?? 0}</span>
          </button>
        ))}
        <Tip label={t('newFolder')} side="bottom">
          <button className={clsx(css.pill, css.pillAdd)} onClick={() => { setFolderModal({ mode: 'create' }) }}>
            <IconPlusOutlineRegular size={13} />
          </button>
        </Tip>
        <button className={clsx(css.pill, filter === 'trash' && css.pillActive, trashCount > 0 && css.pillBadge)} onClick={() => { setFilter('trash') }}>
          🗑 {t('trash')} <span className={css.count}>{trashCount}</span>
        </button>
        {filter === 'trash' && trashCount > 0 && (
          <button className={clsx(css.pill, css.pillDanger)} onClick={emptyTrash}>{t('emptyTrashAction')}</button>
        )}
      </div>

      {viewMode === 'cards'
        ? (
            <div className={css.grid}>
              {visible.map((note, index) => (
                <StickyCard
                  key={note.id}
                  note={note}
                  folder={folderById(note.folderId)}
                  index={index}
                  inTrash={filter === 'trash'}
                  t={t}
                  colorNames={colorNames}
                  source={source}
                  imageUrls={imageUrls}
                  actions={noteActions}
                  onEdit={() => { setEditTarget(note) }}
                  onMove={() => { setMoveTarget(note) }}
                  onJump={() => { jumpToOrigin(note) }}
                  onImage={url => { setLightbox(url) }}
                />
              ))}
              {visible.length === 0 && (
                <div className={css.empty}>{filter === 'trash' ? t('emptyTrash') : (query !== '' ? t('noNotesMatch') : t('emptyWall'))}</div>
              )}
            </div>
          )
        : (
            <div className={css.list}>
              {visible.map(note => (
                <StickyRow
                  key={note.id}
                  note={note}
                  folder={folderById(note.folderId)}
                  inTrash={filter === 'trash'}
                  t={t}
                  source={source}
                  imageUrls={imageUrls}
                  actions={noteActions}
                  onEdit={() => { setEditTarget(note) }}
                  onJump={() => { jumpToOrigin(note) }}
                  onImage={url => { setLightbox(url) }}
                />
              ))}
              {visible.length === 0 && (
                <div className={css.empty}>{filter === 'trash' ? t('emptyTrash') : (query !== '' ? t('noNotesMatch') : t('emptyWall'))}</div>
              )}
            </div>
          )}

      {lightbox !== null && (
        <div className={mdCss.lightbox} onClick={() => { setLightbox(null) }}>
          <img src={lightbox} alt="" />
        </div>
      )}

      {composeOpen && (
        <StickyEditModal
          mode="create"
          note={null}
          folders={folders}
          imageUrls={imageUrls}
          t={t}
          onCancel={() => { setComposeOpen(false) }}
          onCreate={(text, color, folderId, imageIds) => { createNote(text, color, folderId, imageIds); setComposeOpen(false) }}
          onSave={() => { /* create mode never saves a patch */ }}
          onDelete={() => { /* create mode has no delete */ }}
          onRestore={() => { /* create mode has no restore */ }}
          onMoveFolder={() => { /* create mode keeps the folder in local state */ }}
          storeImage={dataUrl => source.saveImage(dataUrl)}
          inTrash={false}
        />
      )}

      {editTarget !== null && (
        <StickyEditModal
          key={editTarget.id}
          mode="edit"
          note={editTarget}
          folders={folders}
          imageUrls={imageUrls}
          t={t}
          onCancel={() => { setEditTarget(null) }}
          onCreate={() => { /* edit mode never creates */ }}
          onSave={(patch) => { source.updateNote(editTarget.id, patch); setEditTarget(null) }}
          onDelete={() => { source.deleteNote(editTarget.id); setEditTarget(null) }}
          onRestore={() => { source.restoreNote(editTarget.id); setEditTarget(null) }}
          onMoveFolder={folderId => { source.moveNote(editTarget.id, folderId) }}
          onPasteImage={dataUrl => { void (async () => {
            const id = await source.saveImage(dataUrl)
            if (id !== undefined) source.attachImages(editTarget.id, [id])
          })() }}
          inTrash={editTarget.deletedAt !== null}
        />
      )}

      {folderModal !== null && (
        <FolderModal
          mode={folderModal}
          t={t}
          existing={folders}
          onCancel={() => { setFolderModal(null) }}
          onSubmit={(name, emoji, color) => {
            if (folderModal.mode === 'create') {
              source.createFolder(name, emoji === undefined ? undefined : emoji, color)
            } else {
              const patch: { name: string, emoji?: string, color?: StickyColor } = { name }
              if (emoji !== undefined) patch.emoji = emoji
              if (color !== undefined) patch.color = color
              source.updateFolder(folderModal.folder.id, patch)
            }
            setFolderModal(null)
          }}
          onDelete={folderModal.mode === 'rename' && !folderModal.folder.builtin
            ? () => {
                if (window.confirm(t('deleteFolderConfirm'))) {
                  source.deleteFolder(folderModal.folder.id)
                  if (filter === folderModal.folder.id) setFilter('all')
                  setFolderModal(null)
                }
              }
            : undefined}
        />
      )}

      {moveTarget !== null && (
        <Modal open onClose={() => { setMoveTarget(null) }} title={t('moveTo')} closeLabel={t('cancel')}>
          <div className={css.moveList}>
            {folders.filter(f => f.id !== moveTarget.folderId).map(folder => (
              <button key={folder.id} className={css.moveRow} onClick={() => { source.moveNote(moveTarget.id, folder.id); setMoveTarget(null) }}>
                <span>{folder.emoji} {folder.name}</span>
                <span className={css.count}>{folderCounts.get(folder.id) ?? 0}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      <Modal open={snapshotsOpen} onClose={() => { setSnapshotsOpen(false) }} title={t('snapshots')} closeLabel={t('cancel')}>
        <div className={css.snapList}>
          {wall.snapshots.length === 0 && <div className={css.empty}>—</div>}
          {wall.snapshots.map(snap => (
            <div key={snap.id} className={css.snapRow}>
              <span className={css.snapKind}>{snap.kind === 'daily' ? `🌙 ${t('snapshotDaily')}` : `🕰 ${t('snapshotRecent')}`}</span>
              <span className={css.snapTime}>{noteStamp(snap.savedAt)} · {snap.notes} 📝</span>
              <Button size="sm" onClick={() => { source.restoreSnapshot(snap.id); setSnapshotsOpen(false) }}>{t('restoreSnapshot')}</Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

/** Per-note action bundle shared by both layouts. */
interface NoteActions {
  readonly togglePin: (note: StickyNoteWire) => void
  readonly toggleStrike: (note: StickyNoteWire) => void
  readonly toggleTask: (note: StickyNoteWire, taskIndex: number) => void
  readonly remove: (note: StickyNoteWire) => void
  readonly restore: (note: StickyNoteWire) => void
}

/** One sticky card with hover actions and a per-card menu. */
function StickyCard(props: {
  note: StickyNoteWire
  folder: StickyFolderWire | undefined
  index: number
  inTrash: boolean
  t: (key: StickyWallKey) => string
  colorNames: readonly string[]
  source: WallSource
  imageUrls: ReadonlyMap<string, string>
  actions: NoteActions
  onEdit: () => void
  onMove: () => void
  onJump: () => void
  onImage: (url: string) => void
}): ReactNode {
  const { note, folder, index, inTrash, t, colorNames, source, imageUrls, actions, onEdit, onMove, onJump, onImage } = props
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <article
      className={clsx(css.card, note.pinned && css.pinnedCard, note.struck && css.struckCard)}
      data-color={note.color}
      style={{ '--tilt': `${tiltOf(note.id)}deg`, '--drop': `${Math.min(index, 6) * 30}ms` } as React.CSSProperties}
    >
      {note.pinned && <span className={css.pin}>📌</span>}
      <div className={css.textBody} onClick={e => { if (!(e.target instanceof HTMLElement) || !e.target.closest('[data-todo]')) onEdit() }}>
        {inTrash
          ? <NoteMarkdown text={note.text} />
          : (
              <NoteMarkdown
                text={note.text}
                onToggleTask={taskIndex => { actions.toggleTask(note, taskIndex) }}
              />
            )}
        {note.images.length > 0 && (
          <div className={mdCss.imgStrip}>
            {note.images.map(id => {
              const url = imageUrls.get(id)
              return url === undefined
                ? <span key={id} className={mdCss.thumbPending}>🖼</span>
                : <img key={id} className={mdCss.thumb} src={url} alt="" onClick={e => { e.stopPropagation(); onImage(url) }} />
            })}
          </div>
        )}
      </div>
      <div className={css.cardMeta}>
        <span className={css.folderChip} data-color={folder?.color ?? 'blue'}>{folder ? `${folder.emoji} ${folder.name}` : '?'}</span>
        {note.origin !== null && !inTrash && (
          <Tip label={note.origin.snippet}>
            <button className={css.originLink} onClick={e => { e.stopPropagation(); onJump() }}>↩ {t('backToSession')}</button>
          </Tip>
        )}
        <span className={css.stamp}>
          {t('createdAt')}{noteStamp(note.createdAt)}
          {note.updatedAt > note.createdAt + 60_000 && <> · {t('editedAt')}{noteStamp(note.updatedAt)}</>}
        </span>
      </div>
      {inTrash
        ? (
            <div className={css.cardActions}>
              <button className={css.act} onClick={() => { actions.restore(note) }}>↩ {t('restore')}</button>
            </div>
          )
        : (
            <div className={css.cardActions}>
              <Tip label={note.pinned ? t('unpin') : t('pin')}>
                <button
                  className={clsx(css.act, note.pinned && css.actOn)}
                  onClick={() => { actions.togglePin(note) }}
                ><IconPinOutlineRegular size={14} /></button>
              </Tip>
              <Tip label={note.struck ? t('unstrike') : t('strike')}>
                <button
                  className={clsx(css.act, note.struck && css.actOn)}
                  onClick={() => { actions.toggleStrike(note) }}
                ><IconCheckOutlineRegular size={14} /></button>
              </Tip>
              <Tip label={t('moveTo')}>
                <button className={css.act} onClick={onMove}><IconFolderOpenOutlineRegular size={14} /></button>
              </Tip>
              <Tip label={t('moreActions')}>
                <button className={css.act} onClick={() => { setMenuOpen(v => !v) }}><IconEllipsisOutlineRegular size={14} /></button>
              </Tip>
            </div>
          )}
      {menuOpen && !inTrash && (
        <>
          <div className={css.menuMask} onClick={() => { setMenuOpen(false) }} />
          <div className={css.cardMenu}>
            <div className={css.recolorRow}>
              {COLOR_ORDER.map((color, i) => (
                <button
                  key={color}
                  className={clsx(css.dot, note.color === color && css.dotActive)}
                  data-color={color}
                  title={colorNames[i] ?? color}
                  onClick={() => { source.updateNote(note.id, { color }); setMenuOpen(false) }}
                />
              ))}
            </div>
            <button className={css.menuItem} onClick={() => { setMenuOpen(false); onEdit() }}>✏️ {t('edit')}</button>
            <button className={clsx(css.menuItem, css.menuDanger)} onClick={() => { setMenuOpen(false); actions.remove(note) }}>🗑 {t('deleteNote')}</button>
          </div>
        </>
      )}
    </article>
  )
}

/** One compact list row. */
function StickyRow(props: {
  note: StickyNoteWire
  folder: StickyFolderWire | undefined
  inTrash: boolean
  t: (key: StickyWallKey) => string
  source: WallSource
  imageUrls: ReadonlyMap<string, string>
  actions: NoteActions
  onEdit: () => void
  onJump: () => void
  onImage: (url: string) => void
}): ReactNode {
  const { note, folder, inTrash, t, imageUrls, actions, onEdit, onJump, onImage } = props
  const firstImage = note.images.length > 0 ? imageUrls.get(note.images[0]) : undefined
  const taskTotal = (note.text.match(/^[-*]\s+\[[ xX]\]/gm) ?? []).length
  const taskDone = (note.text.match(/^[-*]\s+\[[xX]\]/gm) ?? []).length
  return (
    <div
      className={clsx(css.row, note.pinned && css.rowPinned, note.struck && css.rowStruck)}
      data-color={note.color}
      onClick={onEdit}
    >
      <span className={css.rowBar} data-color={note.color} />
      {note.pinned && <span className={css.rowPin}>📌</span>}
      {firstImage !== undefined
        ? <img className={css.rowThumb} src={firstImage} alt="" onClick={e => { e.stopPropagation(); onImage(firstImage) }} />
        : <span className={css.rowEmoji} data-color={note.color}>📝</span>}
      <div className={css.rowBody}>
        <span className={clsx(css.rowText, note.struck && css.rowTextStruck)}>{summaryOf(note)}</span>
        <span className={css.rowTags}>
          {taskTotal > 0 && <span className={css.rowTask}>☑ {taskDone}/{taskTotal}</span>}
          {note.images.length > 1 && <span className={css.rowTask}>🖼 ×{note.images.length}</span>}
          {note.origin !== null && !inTrash && (
            <button className={css.originLink} onClick={e => { e.stopPropagation(); onJump() }} title={note.origin.snippet}>↩</button>
          )}
        </span>
      </div>
      <span className={css.folderChip} data-color={folder?.color ?? 'blue'}>{folder ? `${folder.emoji} ${folder.name}` : '?'}</span>
      <span className={css.stamp}>
        {t('createdAt')}{noteStamp(note.createdAt)}
        {note.updatedAt > note.createdAt + 60_000 && <> · {t('editedAt')}{noteStamp(note.updatedAt)}</>}
      </span>
      <span className={css.rowActions} onClick={e => { e.stopPropagation() }}>
        {inTrash
          ? <button className={css.act} onClick={() => { actions.restore(note) }}>↩</button>
          : (
              <>
                <Tip label={note.pinned ? t('unpin') : t('pin')}>
                  <button className={clsx(css.act, note.pinned && css.actOn)} onClick={() => { actions.togglePin(note) }}><IconPinOutlineRegular size={13} /></button>
                </Tip>
                <Tip label={note.struck ? t('unstrike') : t('strike')}>
                  <button className={clsx(css.act, note.struck && css.actOn)} onClick={() => { actions.toggleStrike(note) }}><IconCheckOutlineRegular size={13} /></button>
                </Tip>
                <Tip label={t('edit')}>
                  <button className={css.act} onClick={onEdit}><IconEditOutlineRegular size={13} /></button>
                </Tip>
                <Tip label={t('deleteNote')}>
                  <button className={css.act} onClick={() => { actions.remove(note) }}><IconTrashOutlineRegular size={13} /></button>
                </Tip>
              </>
            )}
      </span>
    </div>
  )
}

/** Full note dialog (create or edit): toolbar, editor, preview with
 * interactive todos, images, color, and folder. */
function StickyEditModal(props: {
  mode: 'create' | 'edit'
  note: StickyNoteWire | null
  folders: readonly StickyFolderWire[]
  imageUrls: ReadonlyMap<string, string>
  t: (key: StickyWallKey) => string
  inTrash: boolean
  onCancel: () => void
  onCreate: (text: string, color: StickyColor, folderId: string, imageIds: readonly string[]) => void
  onSave: (patch: { text?: string, color?: StickyColor }) => void
  onDelete: () => void
  onRestore: () => void
  onMoveFolder: (folderId: string) => void
  onPasteImage?: (dataUrl: string) => void
  storeImage?: (dataUrl: string) => Promise<string | undefined>
}): ReactNode {
  const { mode, note, folders, imageUrls, t, inTrash, onCancel, onCreate, onSave, onDelete, onRestore, onMoveFolder, onPasteImage, storeImage } = props
  const isCreate = mode === 'create'
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [text, setText] = useState(note?.text ?? '')
  const [color, setColor] = useState<StickyColor>(note?.color ?? 'yellow')
  const [folderId, setFolderId] = useState(note?.folderId ?? folders.find(f => f.builtin)?.id ?? folders[0]?.id ?? '')
  const [pendingImages, setPendingImages] = useState<readonly { id: string, dataUrl: string }[]>([])
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const dirty = isCreate ? text.trim().length > 0 || pendingImages.length > 0 : (text !== note?.text || color !== note?.color)

  /** Paste handler: images stage (create) or attach (edit); text passes through. */
  async function paste(e: React.ClipboardEvent): Promise<void> {
    const files = clipboardImageFiles(e)
    if (files.length === 0) return
    e.preventDefault()
    for (const file of files) {
      const dataUrl = await readImageFile(file)
      if (isCreate) {
        const id = storeImage !== undefined ? await storeImage(dataUrl) : undefined
        if (id !== undefined) setPendingImages(prev => [...prev, { id, dataUrl }])
      } else {
        onPasteImage?.(dataUrl)
      }
    }
  }

  /** Persist (edit) or create with the staged state. */
  function submit(): void {
    if (isCreate) {
      onCreate(text.trim().length === 0 ? '🖼' : text.trim(), color, folderId, pendingImages.map(entry => entry.id))
      return
    }
    onSave({
      text,
      ...(color !== note?.color ? { color } : {}),
    })
  }

  const title = isCreate ? t('newNote') : t('editNote') + (dirty ? ' •' : '')

  return (
    <Modal
      open
      {...(css.editDialog === undefined ? {} : { className: css.editDialog })}
      {...(css.editContent === undefined ? {} : { contentClassName: css.editContent })}
      onClose={() => { if (!dirty || isCreate || window.confirm(t('unsavedConfirm'))) onCancel() }}
      title={title}
      closeLabel={t('cancel')}
    >
      <div className={css.editModal}>
        <div className={css.editHead}>
          <div className={mdCss.fmtBar}>
            {FORMAT_BUTTONS.map(btn => (
              <Tip key={btn.format} label={btn.title} side="bottom">
                <button
                  className={mdCss.fmtBtn}
                  data-glyph={btn.glyph}
                  onMouseDown={e => { e.preventDefault() }}
                  onClick={() => { areaRef.current && setText(applyNoteFormat(areaRef.current, btn.format)) }}
                >{renderFormatGlyph(btn)}</button>
              </Tip>
            ))}
          </div>
          <div className={css.editTabs}>
            <button className={clsx(css.editTab, tab === 'edit' && css.editTabActive)} onClick={() => { setTab('edit') }}>{t('editTab')}</button>
            <button className={clsx(css.editTab, tab === 'preview' && css.editTabActive)} onClick={() => { setTab('preview') }}>{t('preview')}</button>
          </div>
        </div>
        {tab === 'edit'
          ? (
              <textarea
                ref={areaRef}
                className={css.editModalArea}
                data-color={color}
                value={text}
                autoFocus
                placeholder={t('quickPlaceholder')}
                onChange={e => { setText(e.target.value) }}
                onPaste={e => { void paste(e) }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    if (dirty) submit()
                  }
                }}
              />
            )
          : (
              <div className={css.editPreview} data-color={color}>
                {text.trim().length === 0
                  ? <span className={css.previewEmpty}>{t('previewEmpty')}</span>
                  : (
                      <NoteMarkdown
                        text={text}
                        onToggleTask={taskIndex => { setText(toggleTask(text, taskIndex)) }}
                      />
                    )}
              </div>
            )}
        {(isCreate ? pendingImages.length > 0 : (note?.images.length ?? 0) > 0) && (
          <div className={mdCss.imgStrip}>
            {isCreate
              ? pendingImages.map(img => <img key={img.id} className={mdCss.thumb} src={img.dataUrl} alt="" />)
              : note?.images.map(id => {
                  const url = imageUrls.get(id)
                  return url === undefined
                    ? <span key={id} className={mdCss.thumbPending}>🖼</span>
                    : <img key={id} className={mdCss.thumb} src={url} alt="" />
                })}
          </div>
        )}
        <div className={css.editMeta}>
          <div className={css.dots}>
            {COLOR_ORDER.map((c, i) => (
              <Tip key={c} label={t('colorNames').split('|')[i] ?? c} side="bottom">
                <button className={clsx(css.dot, color === c && css.dotActive)} data-color={c} onClick={() => { setColor(c) }} />
              </Tip>
            ))}
          </div>
          <select
            className={css.folderSelect}
            value={folderId}
            onChange={e => {
              const next = e.target.value
              setFolderId(next)
              if (!isCreate && next !== note?.folderId) onMoveFolder(next)
            }}
          >
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.emoji} {folder.name}</option>)}
          </select>
        </div>
        <div className={css.formButtons}>
          {!isCreate && (inTrash
            ? <Button variant="primary" size="sm" onClick={onRestore}>↩ {t('restore')}</Button>
            : <Button variant="ghost" size="sm" onClick={onDelete}>🗑 {t('deleteNote')}</Button>)}
          <span className={css.spacer} />
          <Button variant="ghost" size="sm" onClick={() => { if (!dirty || isCreate || window.confirm(t('unsavedConfirm'))) onCancel() }}>{t('cancel')}</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!dirty}
            onClick={submit}
          >{isCreate ? t('create') : t('save')}</Button>
        </div>
      </div>
    </Modal>
  )
}

/** Create/rename folder dialog. */
function FolderModal(props: {
  mode: { mode: 'create' } | { mode: 'rename', folder: StickyFolderWire }
  t: (key: StickyWallKey) => string
  existing: readonly StickyFolderWire[]
  onCancel: () => void
  onSubmit: (name: string, emoji?: string, color?: StickyColor) => void
  onDelete: (() => void) | undefined
}): ReactNode {
  const { mode, t, existing, onCancel, onSubmit, onDelete } = props
  const isCreate = mode.mode === 'create'
  const selfId = mode.mode === 'rename' ? mode.folder.id : ''
  const [name, setName] = useState(isCreate ? '' : mode.folder.name)
  const [emoji, setEmoji] = useState(isCreate ? '📁' : mode.folder.emoji)
  const [color, setColor] = useState<StickyColor>(isCreate ? 'pink' : mode.folder.color)
  const colorNames = t('colorNames').split('|')
  const nameTaken = name.trim().length > 0 && existing.some(f => f.name === name.trim() && f.id !== selfId)
  return (
    <Modal open onClose={onCancel} title={isCreate ? t('newFolder') : t('rename')} closeLabel={t('cancel')}>
      <div className={css.folderForm}>
        <div className={css.folderFormRow}>
          <input className={css.emojiInput} value={emoji} maxLength={4} onChange={e => { setEmoji(e.target.value) }} />
          <Input value={name} placeholder={t('newFolderName')} onChange={e => { setName(e.target.value) }} />
        </div>
        <div className={css.dots}>
          {COLOR_ORDER.map((c, i) => (
            <Tip key={c} label={colorNames[i] ?? c} side="bottom">
              <button className={clsx(css.dot, color === c && css.dotActive)} data-color={c} onClick={() => { setColor(c) }} />
            </Tip>
          ))}
        </div>
        {nameTaken && <div className={css.formError}>{t('folderExists')}</div>}
        <div className={css.formButtons}>
          {onDelete !== undefined && <Button variant="ghost" size="sm" onClick={onDelete}>🗑 {t('deleteFolder')}</Button>}
          <span className={css.spacer} />
          <Button variant="ghost" size="sm" onClick={onCancel}>{t('cancel')}</Button>
          <Button variant="primary" size="sm" disabled={name.trim().length === 0 || nameTaken} onClick={() => { onSubmit(name.trim(), emoji, color) }}>
            {isCreate ? t('create') : t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
