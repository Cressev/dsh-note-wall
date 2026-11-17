/**
 * Observable wall snapshot: loads through the mounted `stickyWall` remote
 * namespace and reloads after every mutation. One reference-stable snapshot
 * per state change keeps React subscribers quiet.
 *
 * @module sticky-wall-plugin/client/wall-source
 */

import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  StickyColor, StickyFolderWire, StickyImageWire, StickyNoteWire, StickyOrigin, StickySnapshotWire,
} from '../remote.ts'

/** Wall read state. */
export type WallStatus = 'loading' | 'ready' | 'error'

/** One snapshot of the whole wall, reference-stable between changes. */
export interface WallSnapshot {
  readonly status: WallStatus
  readonly folders: readonly StickyFolderWire[]
  readonly notes: readonly StickyNoteWire[]
  readonly snapshots: readonly StickySnapshotWire[]
  /** Human-readable last failure; empty when healthy. */
  readonly error: string
}

/** Remote namespace face consumed by the source. */
export interface StickyWallApi {
  state(): Promise<{ ok: boolean, value?: WallData, error?: unknown }>
  createNote(request: { text: string, folderId?: string, color?: StickyColor, origin?: StickyOrigin }): Promise<{ ok: boolean, value?: StickyNoteWire, error?: unknown }>
  updateNote(request: { id: string, patch: { text?: string, color?: StickyColor, pinned?: boolean, struck?: boolean } }): Promise<{ ok: boolean, value?: StickyNoteWire, error?: unknown }>
  moveNote(request: { id: string, folderId: string }): Promise<{ ok: boolean, value?: StickyNoteWire, error?: unknown }>
  deleteNote(request: { id: string }): Promise<{ ok: boolean, error?: unknown }>
  restoreNote(request: { id: string }): Promise<{ ok: boolean, value?: StickyNoteWire, error?: unknown }>
  emptyTrash(): Promise<{ ok: boolean, value?: { removed: string[] }, error?: unknown }>
  createFolder(request: { name: string, emoji?: string, color?: StickyColor }): Promise<{ ok: boolean, value?: StickyFolderWire, error?: unknown }>
  updateFolder(request: { id: string, patch: { name?: string, emoji?: string, color?: StickyColor } }): Promise<{ ok: boolean, value?: StickyFolderWire, error?: unknown }>
  deleteFolder(request: { id: string }): Promise<{ ok: boolean, value?: { moved: number }, error?: unknown }>
  exportWall(request: { format: 'markdown' | 'json' }): Promise<{ ok: boolean, value?: { content: string, filename: string }, error?: unknown }>
  restoreSnapshot(request: { id: string }): Promise<{ ok: boolean, value?: WallData, error?: unknown }>
  saveImage(request: { dataUrl: string }): Promise<{ ok: boolean, value?: StickyImageWire, error?: unknown }>
  image(request: { id: string }): Promise<{ ok: boolean, value?: StickyImageWire, error?: unknown }>
  attachImages(request: { id: string, imageIds: readonly string[] }): Promise<{ ok: boolean, value?: StickyNoteWire, error?: unknown }>
}

/** Wire value of `stickyWall/state`. */
export interface WallData {
  readonly folders: readonly StickyFolderWire[]
  readonly notes: readonly StickyNoteWire[]
  readonly snapshots: readonly StickySnapshotWire[]
}

const EMPTY: WallSnapshot = { status: 'loading', folders: [], notes: [], snapshots: [], error: '' }

/**
 * Own the wall snapshot lifetime; every mutation funnels through here and
 * ends in one reload so subscribers always see a coherent wall.
 */
export class WallSource implements HostObservable<WallSnapshot> {
  private snapshot: WallSnapshot = EMPTY
  private readonly listeners = new Set<() => void>()
  private pending: Promise<void> = Promise.resolve()

  /**
   * @param api - mounted `remote.stickyWall` namespace.
   */
  constructor(private readonly api: StickyWallApi) {}

  getSnapshot(): WallSnapshot { return this.snapshot }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    if (this.listeners.size === 1) this.reload()
    return () => { this.listeners.delete(listener) }
  }

  /** Read the whole wall again; failures keep the previous data with an error status. */
  reload(): void {
    this.enqueue(async () => {
      await this.readState()
    })
  }

  /** Create one note from the quick bar, the panel, or the selection pill. */
  createNote(text: string, options: { folderId?: string, color?: StickyColor, origin?: StickyOrigin } = {}): void {
    this.call(this.api.createNote({ text, ...options }))
  }

  /** Patch one note (edit, pin, strike, recolor). */
  updateNote(id: string, patch: { text?: string, color?: StickyColor, pinned?: boolean, struck?: boolean }): void {
    this.call(this.api.updateNote({ id, patch }))
  }

  /** Move one note into another folder. */
  moveNote(id: string, folderId: string): void {
    this.call(this.api.moveNote({ id, folderId }))
  }

  /** Soft-delete one note into the trash. */
  deleteNote(id: string): void {
    this.call(this.api.deleteNote({ id }))
  }

  /** Restore one trashed note. */
  restoreNote(id: string): void {
    this.call(this.api.restoreNote({ id }))
  }

  /** Permanently remove every trashed note. */
  emptyTrash(): void {
    this.call(this.api.emptyTrash())
  }

  /** Create one folder. */
  createFolder(name: string, emoji?: string, color?: StickyColor): void {
    const request: { name: string, emoji?: string, color?: StickyColor } = { name }
    if (emoji !== undefined) request.emoji = emoji
    if (color !== undefined) request.color = color
    this.call(this.api.createFolder(request))
  }

  /** Patch one folder. */
  updateFolder(id: string, patch: { name?: string, emoji?: string, color?: StickyColor }): void {
    this.call(this.api.updateFolder({ id, patch }))
  }

  /** Delete one folder; its notes move to the inbox. */
  deleteFolder(id: string): void {
    this.call(this.api.deleteFolder({ id }))
  }

  /** Roll the wall back to one retained snapshot. */
  restoreSnapshot(id: string): void {
    this.call(this.api.restoreSnapshot({ id }))
  }

  /**
   * Store one pasted image.
   * @returns the image id, or undefined when the store rejected it.
   */
  async saveImage(dataUrl: string): Promise<string | undefined> {
    try {
      const result = await this.api.saveImage({ dataUrl })
      return result.ok && result.value !== undefined ? result.value.id : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Read one stored image's data URL.
   * @returns the data URL, or undefined when unavailable.
   */
  async image(id: string): Promise<string | undefined> {
    try {
      const result = await this.api.image({ id })
      return result.ok && result.value !== undefined ? result.value.dataUrl : undefined
    } catch {
      return undefined
    }
  }

  /** Append stored image ids onto one note. */
  attachImages(id: string, imageIds: readonly string[]): void {
    this.call(this.api.attachImages({ id, imageIds }))
  }

  /** Export the wall; resolves with the file body, or undefined on failure. */
  async exportWall(format: 'markdown' | 'json'): Promise<{ content: string, filename: string } | undefined> {
    try {
      const result = await this.api.exportWall({ format })
      return result.ok && result.value !== undefined ? result.value : undefined
    } catch {
      return undefined
    }
  }

  /** Serialize mutations through one queue; each ends in a reload. */
  private call(pending: Promise<{ ok: boolean, error?: unknown }>): void {
    this.enqueue(async () => {
      let failure = ''
      try {
        const result = await pending
        if (!result.ok) failure = describeFailure(result.error)
      } catch (reason) {
        failure = describeFailure(reason)
      }
      await this.readState(failure)
    })
  }

  /** One state read used to finish every mutation. */
  private async readState(presetError = ''): Promise<void> {
    let failure = presetError
    let value: WallData | undefined
    try {
      const result = await this.api.state()
      if (!result.ok || result.value === undefined) {
        if (failure === '') failure = describeFailure(result.error)
      } else {
        value = result.value
      }
    } catch (reason) {
      if (failure === '') failure = describeFailure(reason)
    }
    this.set(value === undefined
      ? { ...this.snapshot, status: 'error', error: failure === '' ? 'unknown error' : failure }
      : { status: failure === '' ? 'ready' : 'error', error: failure, folders: value.folders, notes: value.notes, snapshots: value.snapshots })
  }

  /** Chain work so a mutation's reload cannot race the next mutation's write. */
  private enqueue(run: () => Promise<void>): void {
    this.pending = this.pending.then(run).catch(reason => {
      this.set({ ...this.snapshot, status: 'error', error: describeFailure(reason) })
    })
  }

  private set(next: WallSnapshot): void {
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }
}

/** Render one unknown remote failure as a short human-readable line. */
function describeFailure(reason: unknown): string {
  if (reason === undefined || reason === null) return 'remote call failed'
  const text = String(typeof reason === 'object' && 'message' in (reason as Record<string, unknown>) ? (reason as { message: unknown }).message : reason)
  return text.slice(0, 160)
}
