/** Three-way merge for the note wall. No network or storage side effects. */
import type { StickyFolderWire, StickyImageWire, StickyNoteWire } from './remote.ts'

export interface SyncWall {
  folders: readonly StickyFolderWire[]
  notes: readonly StickyNoteWire[]
  images: readonly StickyImageWire[]
}

export interface MergeResult {
  wall: SyncWall
  conflicts: number
}

function index<T extends { readonly id: string }>(items: readonly T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const item of items) {
    if (map.has(item.id)) throw new Error(`duplicate id: ${item.id}`)
    map.set(item.id, item)
  }
  return map
}

/** PostgreSQL jsonb can reorder object keys; order is not a data change. */
export function canonical(value: unknown): string | undefined {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return item
    const object = item as Record<string, unknown>
    return Object.fromEntries(Object.keys(object).sort().map(key => [key, object[key]]))
  })
}

function equal(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b)
}

/**
 * Merge from the last acknowledged base. Note edit/edit conflicts become two
 * notes; edit/delete keeps the edited note. Folder conflicts deliberately stop
 * before any write so folder deletion or note moves cannot silently lose data.
 * Image rows are immutable and retained even when no note currently uses them.
 */
export function mergeWalls(base: SyncWall, local: SyncWall, remote: SyncWall, newId: () => string): MergeResult {
  let conflicts = 0
  const merge = <T extends { readonly id: string }>(
    kind: 'folder' | 'note' | 'image',
    baseRows: readonly T[], localRows: readonly T[], remoteRows: readonly T[],
  ): T[] => {
    const b = index(baseRows), l = index(localRows), r = index(remoteRows)
    const result: T[] = []
    for (const id of new Set([...b.keys(), ...l.keys(), ...r.keys()])) {
      const before = b.get(id), ours = l.get(id), theirs = r.get(id)
      if (kind === 'image') {
        const candidates = [before, ours, theirs].filter((x): x is T => x !== undefined)
        if (candidates.some(x => !equal(x, candidates[0]))) throw new Error(`image conflict: ${id}`)
        if (candidates[0] !== undefined) result.push(candidates[0])
        continue
      }
      if (equal(ours, theirs)) { if (ours !== undefined) result.push(ours); continue }
      if (equal(ours, before)) { if (theirs !== undefined) result.push(theirs); continue }
      if (equal(theirs, before)) { if (ours !== undefined) result.push(ours); continue }
      if (kind === 'folder') throw new Error(`folder conflict: ${id}`)
      conflicts++
      if (ours === undefined || theirs === undefined) {
        const survivor = ours ?? theirs
        if (survivor !== undefined) result.push(survivor)
      } else {
        result.push(theirs)
        const note = ours as unknown as StickyNoteWire
        result.push({ ...note, id: newId(), text: `【同步冲突副本】${note.text}` } as unknown as T)
      }
    }
    return result
  }
  const folders = merge('folder', base.folders, local.folders, remote.folders)
  const notes = merge('note', base.notes, local.notes, remote.notes)
  const images = merge('image', base.images, local.images, remote.images)
  const folderIds = new Set(folders.map(folder => folder.id))
  const imageIds = new Set(images.map(image => image.id))
  for (const note of notes) {
    if (!folderIds.has(note.folderId)) throw new Error(`missing folder: ${note.folderId}`)
    for (const id of note.images) if (!imageIds.has(id)) throw new Error(`missing image: ${id}`)
  }
  return { wall: { folders, notes, images }, conflicts }
}
