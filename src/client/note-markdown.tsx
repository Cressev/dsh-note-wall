/**
 * Compact note-Markdown: the subset a sticky note needs — headings, bold,
 * italic, strikethrough, inline code, unordered/ordered lists, and
 * interactive task items — rendered with candy-card styling. Plus the
 * textarea formatting helpers behind the edit toolbar.
 *
 * Grammar (line-based blocks, inline spans):
 *   # / ## / ###            headings
 *   - item / * item         unordered list
 *   1. item                 ordered list
 *   - [ ] item / - [x] item task item (click to toggle)
 *   **bold** ~~strike~~ *italic* `code`
 *
 * @module sticky-wall-plugin/client/note-markdown
 */

import type { ReactNode } from 'react'
import { css } from './note-markdown.styles'

/** One parsed block line. */
interface BlockLine {
  readonly kind: 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'task' | 'p' | 'blank'
  readonly text: string
  readonly checked?: boolean
  /** Index of this task item among all task items in the note. */
  readonly taskIndex?: number
}

/** Parse note text into display blocks. */
export function parseNoteBlocks(text: string): BlockLine[] {
  const taskCounter = { current: 0 }
  return text.split('\n').map(line => parseLine(line, taskCounter))
}

function parseLine(line: string, tasks: { current: number }): BlockLine {
  if (line.trim().length === 0) return { kind: 'blank', text: '' }
  let match = /^###\s+(.*)$/.exec(line)
  if (match !== null) return { kind: 'h3', text: match[1] }
  match = /^##\s+(.*)$/.exec(line)
  if (match !== null) return { kind: 'h2', text: match[1] }
  match = /^#\s+(.*)$/.exec(line)
  if (match !== null) return { kind: 'h1', text: match[1] }
  match = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(line)
  if (match !== null) {
    const index = tasks.current
    tasks.current += 1
    return { kind: 'task', text: match[2], checked: match[1].toLowerCase() === 'x', taskIndex: index }
  }
  match = /^[-*]\s+(.*)$/.exec(line)
  if (match !== null) return { kind: 'ul', text: match[1] }
  match = /^\d+[.、]\s*(.*)$/.exec(line)
  if (match !== null) return { kind: 'ol', text: match[1] }
  return { kind: 'p', text: line }
}

/**
 * Toggle the Nth task marker between `[ ]` and `[x]`.
 * @param text - note source.
 * @param taskIndex - zero-based task-item index.
 * @returns the updated source.
 */
export function toggleTask(text: string, taskIndex: number): string {
  let seen = -1
  return text.split('\n').map(line => {
    const match = /^([-*]\s+\[)( |x|X)(\]\s+.*)$/.exec(line)
    if (match === null) return line
    seen += 1
    if (seen !== taskIndex) return line
    return match[1] + (match[2] === ' ' ? 'x' : ' ') + match[3]
  }).join('\n')
}

/** Render inline bold/italic/strike/code spans of one line. */
function Inline({ text }: { text: string }): ReactNode {
  const parts = splitInline(text)
  return <>
    {parts.map((part, i) => {
      if (part.kind === 'text') return <span key={i}>{part.text}</span>
      if (part.kind === 'bold') return <strong key={i}>{part.text}</strong>
      if (part.kind === 'italic') return <em key={i}>{part.text}</em>
      if (part.kind === 'strike') return <s key={i}>{part.text}</s>
      return <code key={i} className={css.inlineCode}>{part.text}</code>
    })}
  </>
}

/** One inline span; the tokenizer keeps the leftmost-longest match rule simple. */
type InlinePart = { kind: 'text' | 'bold' | 'italic' | 'strike' | 'code', text: string }

const INLINE_RULES: readonly { marker: string, kind: InlinePart['kind'] }[] = [
  { marker: '**', kind: 'bold' },
  { marker: '~~', kind: 'strike' },
  { marker: '`', kind: 'code' },
  { marker: '*', kind: 'italic' },
]

function splitInline(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  let buffer = ''
  let i = 0
  while (i < text.length) {
    const rule = INLINE_RULES.find(r => text.startsWith(r.marker, i))
    if (rule === undefined) {
      buffer += text[i]
      i += 1
      continue
    }
    const end = text.indexOf(rule.marker, i + rule.marker.length)
    if (end === -1) {
      buffer += text[i]
      i += 1
      continue
    }
    if (buffer.length > 0) {
      parts.push({ kind: 'text', text: buffer })
      buffer = ''
    }
    parts.push({ kind: rule.kind, text: text.slice(i + rule.marker.length, end) })
    i = end + rule.marker.length
  }
  if (buffer.length > 0) parts.push({ kind: 'text', text: buffer })
  return parts
}

/** Rendered note body: blocks with interactive task checkboxes. */
export function NoteMarkdown(props: { text: string, onToggleTask?: (taskIndex: number) => void }): ReactNode {
  const { text, onToggleTask } = props
  const blocks = parseNoteBlocks(text)
  let ordered = 0
  return (
    <div className={css.body}>
      {blocks.map((block, i) => {
        if (block.kind === 'blank') return <div key={i} className={css.gap} />
        if (block.kind === 'h1') return <h3 key={i} className={css.h1}><Inline text={block.text} /></h3>
        if (block.kind === 'h2') return <h4 key={i} className={css.h2}><Inline text={block.text} /></h4>
        if (block.kind === 'h3') return <h5 key={i} className={css.h3}><Inline text={block.text} /></h5>
        if (block.kind === 'ul') {
          return (
            <div key={i} className={css.li}>
              <span className={css.bullet}>•</span>
              <span><Inline text={block.text} /></span>
            </div>
          )
        }
        if (block.kind === 'ol') {
          ordered += 1
          return (
            <div key={i} className={css.li}>
              <span className={css.bullet}>{ordered}.</span>
              <span><Inline text={block.text} /></span>
            </div>
          )
        }
        if (block.kind === 'task') {
          const index = block.taskIndex ?? 0
          return (
            <div
              key={i}
              className={css.task}
              data-todo={index}
              onClick={() => { onToggleTask?.(index) }}
            >
              <span className={css.checkbox} data-checked={block.checked === true}>{block.checked === true ? '✓' : ''}</span>
              <span className={block.checked === true ? css.taskDone : undefined}><Inline text={block.text} /></span>
            </div>
          )
        }
        return <p key={i} className={css.p}><Inline text={block.text} /></p>
      })}
    </div>
  )
}

/** Toolbar format kinds the textarea helper understands. */
export type NoteFormat = 'bold' | 'italic' | 'strike' | 'code' | 'h2' | 'ul' | 'ol' | 'task'

const WRAPS: Partial<Record<NoteFormat, readonly [string, string]>> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  strike: ['~~', '~~'],
  code: ['`', '`'],
}

const LINE_PREFIXES: Partial<Record<NoteFormat, string>> = {
  h2: '## ',
  ul: '- ',
  ol: '1. ',
  task: '- [ ] ',
}

/** Per-format test for "this line already carries the prefix" — drives the
 * toggle: clicking a line-format button on already-formatted lines strips
 * the prefix instead of re-applying it. */
const PREFIX_TESTS: Partial<Record<NoteFormat, RegExp>> = {
  h2: /^#{1,3}\s+/,
  ul: /^[-*]\s+(?!\[[ xX]\])/,
  ol: /^\d+[.、]\s*/,
  task: /^[-*]\s+\[[ xX]\]\s+/,
}

/** Any block prefix, stripped before a different one is applied. */
const ANY_PREFIX = /^(#{1,3}\s+|[-*]\s+\[[ xX]\]\s+|[-*]\s+|\d+[.、]\s*)/

/**
 * Apply one toolbar format to a textarea's current selection, updating its
 * value and selection through React-compatible synthetic events.
 * @param area - the textarea being formatted.
 * @param format - toolbar action.
 * @returns the next text value (also dispatched as an input event).
 */
export function applyNoteFormat(area: HTMLTextAreaElement, format: NoteFormat): string {
  const start = area.selectionStart
  const end = area.selectionEnd
  const value = area.value
  const wrap = WRAPS[format]
  if (wrap !== undefined) {
    const selected = value.slice(start, end)
    const already = value.slice(start - wrap[0].length, start) === wrap[0] && value.slice(end, end + wrap[1].length) === wrap[1]
    let next: string
    let cursor: number
    if (already) {
      next = value.slice(0, start - wrap[0].length) + selected + value.slice(end + wrap[1].length)
      cursor = start - wrap[0].length + selected.length
    } else {
      next = value.slice(0, start) + wrap[0] + selected + wrap[1] + value.slice(end)
      cursor = start + wrap[0].length + selected.length
    }
    setAreaValue(area, next, cursor, cursor)
    return next
  }
  const prefix = LINE_PREFIXES[format] ?? ''
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEndRaw = value.indexOf('\n', end)
  const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw
  const lines = value.slice(lineStart, lineEnd).split('\n')
  // Toggle over the selected lines: already-formatted (judged by the first
  // line) strips the prefix back to plain text; otherwise any old prefix is
  // replaced by this button's prefix.
  const already = PREFIX_TESTS[format]?.test(lines[0] ?? '') === true
  const rewritten = already
    ? lines.map(line => line.replace(ANY_PREFIX, ''))
    : lines.map(line => prefix + line.replace(ANY_PREFIX, ''))
  const next = value.slice(0, lineStart) + rewritten.join('\n') + value.slice(lineEnd)
  setAreaValue(area, next, lineStart, lineStart + next.length - (value.length - lineEnd))
  return next
}

/** Write a new value into a textarea the way React expects, then select a range. */
function setAreaValue(area: HTMLTextAreaElement, next: string, selStart: number, selEnd: number): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  setter?.call(area, next)
  area.dispatchEvent(new Event('input', { bubbles: true }))
  requestAnimationFrame(() => { area.setSelectionRange(selStart, selEnd) })
}

/** Extract pasted image files from a clipboard event. */
export function clipboardImageFiles(e: ClipboardEvent | React.ClipboardEvent): readonly File[] {
  const items = e.clipboardData?.items
  if (items === undefined) return []
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file !== null) files.push(file)
    }
  }
  return files
}

/** Read one image file as a data URL. */
export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { resolve(String(reader.result)) }
    reader.onerror = () => { reject(reader.error) }
    reader.readAsDataURL(file)
  })
}
