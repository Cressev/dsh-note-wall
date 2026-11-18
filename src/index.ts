/**
 * Sticky wall: a persistent personal note wall with folders, trash, snapshots,
 * and model-facing add/list/search tools.
 *
 * The service is a TypertRemoteService exposing the gateway namespace
 * `stickyWall`. It owns the storage domain `sticky_wall` (folders, notes,
 * rolling snapshots). Notes land in the trash on delete (`deletedAt` set, row
 * kept); every mutating call first retains a snapshot — a `recent` ring
 * deduplicated to one per quiet window plus a `daily` ring — so any change can
 * be rolled back from the panel.
 *
 * Three model tools (`sticky_note_add`, `sticky_note_list`,
 * `sticky_note_search`) let the agent pin and retrieve notes on request; they
 * write through the same domain, so tool-written notes are indistinguishable
 * from hand-written ones.
 *
 * @module sticky-wall-plugin
 */

import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import z from '@deepseek-ai/schemastery'
import { z as zod } from 'zod'
import {
  STICKY_COLORS,
  type StickyColor, type StickyFolderWire, type StickyImageWire, type StickyNoteWire, type StickyWallState,
} from './remote.ts'
import { stickyWallDomain, stickySyncJournalDomain, type WallDomain } from './storage.ts'
import { canonical, type SyncWall } from './sync-merge.ts'

export { stickyWallRemote } from './remote.ts'
export type {
  StickyColor, StickyFolderWire, StickyNoteWire, StickyOrigin, StickySnapshotWire, StickyWallState,
} from './remote.ts'
export { stickyWallDomain } from './storage.ts'

/** Folders seeded on first open; the builtin row can never be deleted. */
const SEED_FOLDERS: readonly { readonly name: string, readonly emoji: string, readonly color: StickyColor, readonly builtin: boolean }[] = [
  { name: '收纳盒', emoji: '🗂️', color: 'blue', builtin: true },
  { name: '工作', emoji: '💼', color: 'yellow', builtin: false },
  { name: '备忘', emoji: '📝', color: 'mint', builtin: false },
  { name: '灵感', emoji: '💡', color: 'orange', builtin: false },
]

/** Hard caps keeping one note/folder small and the export readable. */
const MAX_NOTE_TEXT = 10_000
const MAX_SNIPPET = 200
const MAX_FOLDER_NAME = 60
/** One stored image's data-URL ceiling (~3 MB of base64). */
const MAX_IMAGE_DATA_URL = 4_000_000
/** Image attachments per note. */
const MAX_NOTE_IMAGES = 9
/** Snapshots closer than this share one `recent` snapshot. */
const SNAPSHOT_QUIET_MS = 10 * 60 * 1000
/** Tool listing/search result ceiling. */
const TOOL_RESULT_LIMIT = 20

/**
 * Deterministic id order for sync comparison.
 *
 * `localeCompare` collates by language rules, and the browser and the host
 * disagree: a folder id like 「收纳盒」 sorts before 「灵感」 under the host's
 * en-US collation but after it under the browser's zh-CN collation. The client
 * normalizes the wall it reads and hands that order back as the expected value,
 * so a locale-sensitive sort made the compare-and-swap reject every write —
 * "本机有新变化" forever. Compare UTF-16 code units instead; both sides agree.
 * @param a - first row.
 * @param b - second row.
 * @returns negative, zero, or positive.
 */
function bySyncId(a: { readonly id: string }, b: { readonly id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * Id-sorted copy of a sync wall, in the one order both faces compare with.
 * @param wall - unsorted wall.
 * @returns a new wall with every table sorted by {@link bySyncId}.
 */
function sortWallBy(wall: SyncWall): SyncWall {
  return {
    folders: [...wall.folders].sort(bySyncId),
    notes: [...wall.notes].sort(bySyncId),
    images: [...wall.images].sort(bySyncId),
  }
}

/** Clamp an optional integer tool argument into [1, max] with a default. */
function clampInt(value: number | undefined, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback
  return Math.min(Math.max(n, 1), max)
}

/** Coerced and validated note color, or the default. */
function normalizeColor(value: string | undefined): StickyColor {
  return value !== undefined && STICKY_COLORS.includes(value as StickyColor) ? value as StickyColor : 'yellow'
}

/** Stamp for display and exports: local YYYY-MM-DD HH:mm. */
function formatStamp(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Tool-path summary line for one note. */
function summarizeNote(note: StickyNoteWire): string {
  const flags = [note.pinned ? '📌' : '', note.struck ? '✅(已划掉)' : ''].filter(Boolean).join(' ')
  const text = note.text.replace(/\s+/g, ' ').slice(0, 120)
  return `${formatStamp(note.updatedAt)} ${flags} ${text}`.trim()
}

const TEXT_OUTPUT = {
  schema: { type: 'string' as const },
  render: (_args: unknown, value: string) => [{ type: 'text' as const, text: value }],
}

const toolColorParameter = { type: 'string' as const, enum: [...STICKY_COLORS], description: 'Optional palette key: yellow, pink, mint, blue, purple, orange.' }

/** Host service for the sticky wall: storage, snapshots, remote namespace, model tools. */
export class StickyWallService extends TypertRemoteService {
  static inject = ['storageDomain', 'tools']

  static Config = z.object({
    /** Retained recent-snapshot ceiling; the ring prunes oldest-first. */
    recentSnapshots: z.number().step(1).min(1).max(100).default(20),
    /** Retained daily-snapshot ceiling; one per local day, oldest-first pruning. */
    dailySnapshots: z.number().step(1).min(1).max(31).default(7),
  })

  private readonly limits: { recent: number, daily: number }
  private readonly domain: Promise<WallDomain>
  private readonly journal: Promise<Domain<typeof stickySyncJournalDomain>>
  /** Serializes every wall mutation against syncApply so a sync write can
   * never interleave with a user edit (CAS would otherwise silently fail). */
  private syncLock: Promise<void> = Promise.resolve()
  /** Set while a journaled sync write is in flight; blocks new mutations
   * so a crash during the write cannot be half-applied by later edits. */
  private syncBroken = false
  private readonly initialized: PromiseLike<unknown>

  /**
   * @param ctx - Host context carrying storage-domain and tool services.
   * @param config - Validated snapshot-retention configuration.
   */
  constructor(ctx: Context, config: InstanceType<typeof StickyWallService.Config>) {
    super(ctx, 'stickyWall')
    this.limits = { recent: config.recentSnapshots, daily: config.dailySnapshots }
    this.domain = ctx.storageDomain.open(stickyWallDomain)
    this.journal = ctx.storageDomain.open(stickySyncJournalDomain)
    ctx.effect(() => () => { void this.domain.then(domain => domain.close()) }, 'stickyWall: storage')
    ctx.effect(() => () => { void this.journal.then(domain => domain.close()) }, 'stickyWall: sync journal')
    this.initialized = this.seed().then(() => this.recoverSync())
    this.registerTools()
  }

  /** Create the seed folders when the wall has never been opened. */
  private async seed(): Promise<void> {
    const domain = await this.domain
    if (domain.global.get().seededAt > 0) return
    const folders = domain.table('folders')
    if (folders.size === 0) {
      let order = 0
      for (const seed of SEED_FOLDERS) {
        await folders.put(seed.name, {
          id: seed.name, name: seed.name, emoji: seed.emoji, color: seed.color, order: order++, builtin: seed.builtin,
        })
      }
    }
    await domain.global.set({ seededAt: Date.now() })
  }

  /** Register the three model tools routed to this service. */
  private registerTools(): void {
    this.ctx.effect(() => this.ctx.tools.register(defineTool({
      name: 'sticky_note_add',
      description: 'Pin one note onto the user\'s sticky wall. Use when the user asks to record, remember, or memo something (工作/备忘/灵感).',
      parameters: {
        text: { type: 'string', required: true, description: 'Note text to pin, verbatim from what the user wants recorded.' },
        folder: { type: 'string', description: 'Target folder name (工作, 备忘, 灵感, or 收纳盒). Defaults to 收纳盒.' },
        color: toolColorParameter,
      },
      output: TEXT_OUTPUT,
      execute: async (args) => {
        await this.initialized
        const domain = await this.domain
        const folder = folderByName(domain, String(args.folder ?? '')) ?? inboxFolder(domain)
        const record = await this.mutate(async () => {
          const id = randomUUID()
          const now = Date.now()
          const note: StickyNoteWire = {
            id,
            folderId: folder.id,
            text: String(args.text).trim().slice(0, MAX_NOTE_TEXT),
            color: normalizeColor(args.color === undefined ? undefined : String(args.color)),
            pinned: false,
            struck: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            origin: null,
            images: [],
          }
          if (note.text.length === 0) throw new Error('便签内容不能为空')
          await domain.table('notes').put(id, note)
          return note
        })
        return `已贴到便签墙 [${folder.emoji} ${folder.name}]：${summarizeNote(record)}`
      },
    })), 'stickyWall: tool add')

    this.ctx.effect(() => this.ctx.tools.register(defineTool({
      name: 'sticky_note_list',
      description: 'List sticky-wall notes, newest first. Optional folder filter; trashed notes excluded.',
      parameters: {
        folder: { type: 'string', description: 'Optional folder name filter.' },
        limit: { type: 'integer', description: `Optional result ceiling, 1-${TOOL_RESULT_LIMIT}.` },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => true,
      execute: async (args) => {
        await this.initialized
        const domain = await this.domain
        const folder = args.folder === undefined ? undefined : folderByName(domain, String(args.folder))
        if (args.folder !== undefined && folder === undefined) return `没有名为「${String(args.folder)}」的文件夹`
        const limit = clampInt(args.limit, TOOL_RESULT_LIMIT, 10)
        const notes = liveNotes(domain)
          .filter(note => folder === undefined || note.folderId === folder.id)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, limit)
        if (notes.length === 0) return folder === undefined ? '便签墙还是空的' : `文件夹 [${folder.emoji} ${folder.name}] 里没有便签`
        return notes.map(note => `- [${folderById(domain, note.folderId)?.name ?? '?'}] ${summarizeNote(note)}`).join('\n')
      },
    })), 'stickyWall: tool list')

    this.ctx.effect(() => this.ctx.tools.register(defineTool({
      name: 'sticky_note_search',
      description: 'Search sticky-wall notes by keyword (case-insensitive substring over text), newest first.',
      parameters: {
        query: { type: 'string', required: true, description: 'Keyword to look for inside note text.' },
        limit: { type: 'integer', description: `Optional result ceiling, 1-${TOOL_RESULT_LIMIT}.` },
      },
      output: TEXT_OUTPUT,
      isConcurrencySafe: () => true,
      execute: async (args) => {
        await this.initialized
        const domain = await this.domain
        const needle = String(args.query).toLowerCase()
        const limit = clampInt(args.limit, TOOL_RESULT_LIMIT, 10)
        const notes = liveNotes(domain)
          .filter(note => note.text.toLowerCase().includes(needle))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, limit)
        if (notes.length === 0) return `没有找到包含「${String(args.query)}」的便签`
        return notes.map(note => `- [${folderById(domain, note.folderId)?.name ?? '?'}] ${summarizeNote(note)}`).join('\n')
      },
    })), 'stickyWall: tool search')
  }

  /** Retain a pre-mutation snapshot, then apply the write body under the sync lock. */
  private async mutate<T>(body: (domain: WallDomain) => Promise<T>): Promise<T> {
    return this.exclusive(async () => {
      const domain = await this.domain
      await this.snapshotBeforeChange(domain)
      return body(domain)
    })
  }

  /** Run a wall-touching operation while holding the sync lock. */
  private async exclusive<T>(body: () => Promise<T>): Promise<T> {
    const previous = this.syncLock
    let release!: () => void
    this.syncLock = new Promise<void>(resolve => { release = resolve })
    await previous
    try {
      if (this.syncBroken) throw new Error('Sync recovery is required; restart the application（同步数据恢复中，请重启应用）')
      return await body()
    } finally { release() }
  }

  /** Read the wall in a stable, id-sorted order for CAS comparisons. */
  private syncValue(domain: WallDomain): SyncWall {
    return sortWallBy({
      folders: [...domain.table('folders').entries()].map(([, row]) => row),
      notes: [...domain.table('notes').entries()].map(([, row]) => row),
      images: [...domain.table('images').entries()].map(([, row]) => row),
    })
  }

  /** Replace the whole wall with a synced value (used by syncApply and recovery). */
  private async writeSyncValue(domain: WallDomain, wall: SyncWall): Promise<void> {
    for (const row of wall.images) await domain.table('images').put(row.id, row)
    for (const row of wall.folders) await domain.table('folders').put(row.id, row)
    for (const row of wall.notes) await domain.table('notes').put(row.id, row)
    for (const id of [...domain.table('notes').keys()]) if (!wall.notes.some(row => row.id === id)) await domain.table('notes').delete(id)
    for (const id of [...domain.table('folders').keys()]) if (!wall.folders.some(row => row.id === id)) await domain.table('folders').delete(id)
    for (const id of [...domain.table('images').keys()]) if (!wall.images.some(row => row.id === id)) await domain.table('images').delete(id)
  }

  /** Replay a sync write that was interrupted by a crash on a previous boot. */
  private async recoverSync(): Promise<void> {
    const journal = await this.journal
    const pending = journal.global.get().pending
    if (pending === '') return
    await this.writeSyncValue(await this.domain, JSON.parse(pending) as SyncWall)
    await journal.global.set({ pending: '' })
  }

  /** Read the whole local wall (folders/notes/images) for cloud sync. */
  @Remote('syncRead')
  async syncRead(): Promise<SyncWall> {
    await this.initialized
    return this.exclusive(async () => this.syncValue(await this.domain))
  }

  /** Apply a merged wall only when the local wall still matches `expected`.
   * Returns false so the caller can retry the merge when a local edit raced. */
  @Remote('syncApply')
  async syncApply(request: { expected: SyncWall, next: SyncWall }): Promise<boolean> {
    await this.initialized
    return this.exclusive(async () => {
      const domain = await this.domain
      const current = this.syncValue(domain)
      // Sort the caller's wall the same way before comparing: the browser and
      // the host collate differently, so trusting the incoming order would
      // reject every write (see bySyncId).
      if (canonical(current) !== canonical(sortWallBy(request.expected))) return false
      const journal = await this.journal
      await journal.global.set({ pending: JSON.stringify(current) })
      this.syncBroken = true
      try {
        await this.snapshotBeforeChange(domain)
        await this.writeSyncValue(domain, request.next)
        await journal.global.set({ pending: '' })
        this.syncBroken = false
      } catch (error) {
        await this.writeSyncValue(domain, current)
        await journal.global.set({ pending: '' })
        this.syncBroken = false
        throw error
      }
      return true
    })
  }

  /** Retain one snapshot: `recent` per quiet window, `daily` per local day. */
  private async snapshotBeforeChange(domain: WallDomain): Promise<void> {
    const table = domain.table('snapshots')
    const now = Date.now()
    const rows = [...table.entries()].map(([, row]) => row)
    const payload = JSON.stringify({
      folders: [...domain.table('folders').entries()].map(([, row]) => row),
      notes: [...domain.table('notes').entries()].map(([, row]) => row),
    })
    const recent = rows.filter(row => row.kind === 'recent').sort((a, b) => b.savedAt - a.savedAt)
    const daily = rows.filter(row => row.kind === 'daily').sort((a, b) => b.savedAt - a.savedAt)
    const sameLocalDay = (a: number, b: number): boolean => {
      const da = new Date(a), db = new Date(b)
      return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
    }
    const writes: Promise<unknown>[] = []
    if (recent[0] === undefined || now - recent[0].savedAt > SNAPSHOT_QUIET_MS) {
      const id = `recent-${now}-${randomUUID().slice(0, 8)}`
      writes.push(table.put(id, { id, savedAt: now, kind: 'recent', payload }))
      for (const stale of recent.slice(this.limits.recent - 1)) writes.push(table.delete(stale.id))
    }
    if (daily[0] === undefined || !sameLocalDay(daily[0].savedAt, now)) {
      const id = `daily-${now}-${randomUUID().slice(0, 8)}`
      writes.push(table.put(id, { id, savedAt: now, kind: 'daily', payload }))
      for (const stale of daily.slice(this.limits.daily - 1)) writes.push(table.delete(stale.id))
    }
    await Promise.all(writes)
  }

  /** Whole-wall state for the panel: folders ordered, notes raw, snapshots newest-first. */
  private stateValue(domain: WallDomain): StickyWallState {
    const folders = [...domain.table('folders').entries()].map(([, row]) => row)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    const notes = [...domain.table('notes').entries()].map(([, row]) => row)
    const snapshots = [...domain.table('snapshots').entries()].map(([, row]) => row)
      .sort((a, b) => b.savedAt - a.savedAt)
      .map(row => {
        const parsed = JSON.parse(row.payload) as { notes: unknown[] }
        return { id: row.id, savedAt: row.savedAt, kind: row.kind, notes: parsed.notes.length }
      })
    return { folders, notes, snapshots }
  }

  /** @returns the note row, or throws the shared id-miss error. */
  private noteOrThrow(domain: WallDomain, id: string): StickyNoteWire {
    const note = domain.table('notes').get(id)
    if (note === undefined) throw new Error(`便签 ${id} 不存在`)
    return note
  }

  /** Load the whole wall. */
  @Remote('state')
  async state(): Promise<StickyWallState> {
    await this.initialized
    const domain = await this.domain
    return this.stateValue(domain)
  }

  /** Create one note. */
  @Remote('createNote')
  async createNote(request: { text: string, folderId?: string, color?: StickyColor, origin?: {
    sessionId: string, turn: number | null, snippet: string
  } }): Promise<StickyNoteWire> {
    await this.initialized
    const text = request.text.trim()
    if (text.length === 0) throw new Error('便签内容不能为空')
    const domain = await this.domain
    const folderId = request.folderId ?? inboxFolder(domain).id
    if (folderById(domain, folderId) === undefined) throw new Error(`文件夹 ${folderId} 不存在`)
    return this.mutate(async () => {
      const id = randomUUID()
      const now = Date.now()
      const record: StickyNoteWire = {
        id,
        folderId,
        text: text.slice(0, MAX_NOTE_TEXT),
        color: normalizeColor(request.color),
        pinned: false,
        struck: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        origin: request.origin === undefined ? null : {
          sessionId: request.origin.sessionId,
          turn: request.origin.turn,
          snippet: request.origin.snippet.slice(0, MAX_SNIPPET),
        },
        images: [],
      }
      await domain.table('notes').put(id, record)
      return record
    })
  }

  /** Patch one note. */
  @Remote('updateNote')
  async updateNote(request: { id: string, patch: { text?: string, color?: StickyColor, pinned?: boolean, struck?: boolean } }): Promise<StickyNoteWire> {
    await this.initialized
    const domain = await this.domain
    const note = this.noteOrThrow(domain, request.id)
    const patch = request.patch
    if (patch.text !== undefined && patch.text.trim().length === 0) throw new Error('便签内容不能为空')
    return this.mutate(async () => {
      const next: StickyNoteWire = {
        ...note,
        text: patch.text === undefined ? note.text : patch.text.trim().slice(0, MAX_NOTE_TEXT),
        color: patch.color === undefined ? note.color : normalizeColor(patch.color),
        pinned: patch.pinned ?? note.pinned,
        struck: patch.struck ?? note.struck,
        updatedAt: Date.now(),
      }
      await domain.table('notes').put(note.id, next)
      return next
    })
  }

  /** Move one note into another folder. */
  @Remote('moveNote')
  async moveNote(request: { id: string, folderId: string }): Promise<StickyNoteWire> {
    await this.initialized
    const domain = await this.domain
    const note = this.noteOrThrow(domain, request.id)
    if (folderById(domain, request.folderId) === undefined) throw new Error(`文件夹 ${request.folderId} 不存在`)
    return this.mutate(async () => {
      const next: StickyNoteWire = { ...note, folderId: request.folderId, updatedAt: Date.now() }
      await domain.table('notes').put(note.id, next)
      return next
    })
  }

  /** Soft-delete one note into the trash. */
  @Remote('deleteNote')
  async deleteNote(request: { id: string }): Promise<void> {
    await this.initialized
    const domain = await this.domain
    const note = this.noteOrThrow(domain, request.id)
    await this.mutate(async () => {
      await domain.table('notes').put(note.id, { ...note, deletedAt: Date.now() })
    })
  }

  /** Restore one trashed note. */
  @Remote('restoreNote')
  async restoreNote(request: { id: string }): Promise<StickyNoteWire> {
    await this.initialized
    const domain = await this.domain
    const note = this.noteOrThrow(domain, request.id)
    return this.mutate(async () => {
      const next: StickyNoteWire = { ...note, deletedAt: null, updatedAt: Date.now() }
      await domain.table('notes').put(note.id, next)
      return next
    })
  }

  /** Permanently remove every trashed note. */
  @Remote('emptyTrash')
  async emptyTrash(): Promise<{ removed: string[] }> {
    await this.initialized
    const domain = await this.domain
    return this.mutate(async () => {
      const removed = [...domain.table('notes').entries()]
        .filter(([, note]) => note.deletedAt !== null)
        .map(([id]) => id)
      if (removed.length > 0) await domain.table('notes').deleteMany(removed)
      return { removed }
    })
  }

  /** Create one folder. */
  @Remote('createFolder')
  async createFolder(request: { name: string, emoji?: string, color?: StickyColor }): Promise<StickyFolderWire> {
    await this.initialized
    const name = request.name.trim().slice(0, MAX_FOLDER_NAME)
    if (name.length === 0) throw new Error('文件夹名称不能为空')
    const domain = await this.domain
    if (folderByName(domain, name) !== undefined) throw new Error(`文件夹「${name}」已存在`)
    return this.mutate(async () => {
      let order = 0
      for (const [, folder] of domain.table('folders').entries()) order = Math.max(order, folder.order + 1)
      const record: StickyFolderWire = {
        id: randomUUID(),
        name,
        emoji: (request.emoji ?? '📁').slice(0, 8),
        color: normalizeColor(request.color),
        order,
        builtin: false,
      }
      await domain.table('folders').put(record.id, record)
      return record
    })
  }

  /** Patch one folder. */
  @Remote('updateFolder')
  async updateFolder(request: { id: string, patch: { name?: string, emoji?: string, color?: StickyColor } }): Promise<StickyFolderWire> {
    await this.initialized
    const domain = await this.domain
    const folder = domain.table('folders').get(request.id)
    if (folder === undefined) throw new Error(`文件夹 ${request.id} 不存在`)
    const patch = request.patch
    if (patch.name !== undefined) {
      const name = patch.name.trim().slice(0, MAX_FOLDER_NAME)
      if (name.length === 0) throw new Error('文件夹名称不能为空')
      const clash = folderByName(domain, name)
      if (clash !== undefined && clash.id !== folder.id) throw new Error(`文件夹「${name}」已存在`)
    }
    return this.mutate(async () => {
      const next: StickyFolderWire = {
        ...folder,
        name: patch.name === undefined ? folder.name : patch.name.trim().slice(0, MAX_FOLDER_NAME),
        emoji: patch.emoji === undefined ? folder.emoji : patch.emoji.slice(0, 8),
        color: patch.color === undefined ? folder.color : normalizeColor(patch.color),
      }
      await domain.table('folders').put(folder.id, next)
      return next
    })
  }

  /** Delete one non-builtin folder; its notes move to the inbox folder. */
  @Remote('deleteFolder')
  async deleteFolder(request: { id: string }): Promise<{ moved: number }> {
    await this.initialized
    const domain = await this.domain
    const folder = domain.table('folders').get(request.id)
    if (folder === undefined) throw new Error(`文件夹 ${request.id} 不存在`)
    if (folder.builtin) throw new Error('内置文件夹不能删除')
    return this.mutate(async () => {
      const inbox = inboxFolder(domain)
      let moved = 0
      for (const [id, note] of domain.table('notes').entries()) {
        if (note.folderId === folder.id) {
          await domain.table('notes').put(id, { ...note, folderId: inbox.id })
          moved += 1
        }
      }
      await domain.table('folders').delete(folder.id)
      return { moved }
    })
  }

  /** Export the live wall (trash excluded) as Markdown or JSON text. */
  @Remote('exportWall')
  async exportWall(request: { format: 'markdown' | 'json' }): Promise<{ content: string, filename: string }> {
    await this.initialized
    const domain = await this.domain
    const folders = [...domain.table('folders').entries()].map(([, row]) => row).sort((a, b) => a.order - b.order)
    const live = liveNotes(domain).sort((a, b) => a.updatedAt - b.updatedAt)
    const stamp = formatStamp(Date.now()).replace(/[- :]/g, '')
    if (request.format === 'json') {
      return {
        content: JSON.stringify({ exportedAt: Date.now(), folders, notes: live }, null, 2),
        filename: `sticky-wall-${stamp}.json`,
      }
    }
    const lines: string[] = ['# 便签墙导出', '']
    for (const folder of folders) {
      const notes = live.filter(note => note.folderId === folder.id)
      if (notes.length === 0) continue
      lines.push(`## ${folder.emoji} ${folder.name}`, '')
      for (const note of notes) {
        const flags = [note.pinned ? '📌' : '', note.struck ? '✅' : ''].filter(Boolean).join(' ')
        const suffix = flags.length > 0 ? ` ${flags}` : ''
        lines.push(`- **${formatStamp(note.updatedAt)}**${suffix} ${note.text.replace(/\n/g, ' ')}`)
      }
      lines.push('')
    }
    return { content: lines.join('\n'), filename: `sticky-wall-${stamp}.md` }
  }

  /** Replace the live folders and notes with one retained snapshot. */
  @Remote('restoreSnapshot')
  async restoreSnapshot(request: { id: string }): Promise<StickyWallState> {
    await this.initialized
    const domain = await this.domain
    const snapshot = domain.table('snapshots').get(request.id)
    if (snapshot === undefined) throw new Error(`快照 ${request.id} 不存在`)
    await this.mutate(async () => {
      const payload = JSON.parse(snapshot.payload) as { folders: StickyFolderWire[], notes: StickyNoteWire[] }
      await domain.table('folders').deleteMany([...domain.table('folders').keys()])
      await domain.table('notes').deleteMany([...domain.table('notes').keys()])
      const writes: Promise<unknown>[] = []
      for (const folder of payload.folders) writes.push(domain.table('folders').put(folder.id, folder))
      for (const note of payload.notes) writes.push(domain.table('notes').put(note.id, note))
      await Promise.all(writes)
    })
    return this.stateValue(domain)
  }

  /** Store one pasted image (data URL) and return its reference. */
  @Remote('saveImage')
  async saveImage(request: { dataUrl: string }): Promise<StickyImageWire> {
    await this.initialized
    const dataUrl = request.dataUrl
    if (!dataUrl.startsWith('data:image/')) throw new Error('只接受 data:image/* 图片')
    if (dataUrl.length > MAX_IMAGE_DATA_URL) throw new Error('图片过大（上限约 3MB）')
    const domain = await this.domain
    const id = randomUUID()
    const record: StickyImageWire = { id, dataUrl, createdAt: Date.now() }
    await this.exclusive(async () => { await domain.table('images').put(id, record) })
    return record
  }

  /** Read one stored image by id. */
  @Remote('image')
  async image(request: { id: string }): Promise<StickyImageWire> {
    await this.initialized
    const domain = await this.domain
    const record = domain.table('images').get(request.id)
    if (record === undefined) throw new Error(`图片 ${request.id} 不存在`)
    return record
  }

  /** Append stored image ids onto one note. */
  @Remote('attachImages')
  async attachImages(request: { id: string, imageIds: readonly string[] }): Promise<StickyNoteWire> {
    await this.initialized
    const domain = await this.domain
    const note = this.noteOrThrow(domain, request.id)
    const images = domain.table('images')
    const additions = request.imageIds.filter(imageId => images.get(imageId) !== undefined)
    return this.mutate(async () => {
      const next: StickyNoteWire = {
        ...note,
        images: [...note.images, ...additions].slice(0, MAX_NOTE_IMAGES),
        updatedAt: Date.now(),
      }
      await domain.table('notes').put(note.id, next)
      return next
    })
  }
}

/** Folder row by id. */
function folderById(domain: WallDomain, id: string): StickyFolderWire | undefined {
  return domain.table('folders').get(id)
}

/** Folder row by exact name. */
function folderByName(domain: WallDomain, name: string): StickyFolderWire | undefined {
  for (const [, folder] of domain.table('folders').entries()) {
    if (folder.name === name) return folder
  }
  return undefined
}

/** The undeletable fallback folder every orphaned note moves into. */
function inboxFolder(domain: WallDomain): StickyFolderWire {
  for (const [, folder] of domain.table('folders').entries()) {
    if (folder.builtin) return folder
  }
  return { id: '收纳盒', name: '收纳盒', emoji: '🗂️', color: 'blue', order: -1, builtin: true }
}

/** Live (non-trashed) notes. */
function liveNotes(domain: WallDomain): StickyNoteWire[] {
  return [...domain.table('notes').entries()].map(([, row]) => row).filter(note => note.deletedAt === null)
}

export default StickyWallService
