/**
 * Storage-domain definition for the sticky wall.
 *
 * @module sticky-wall-plugin/storage
 */
import { defineDomain, domainTable, type Domain } from '@deepseek-ai/dsh-storage-domain'
import { z as zod } from 'zod'
import { STICKY_COLORS, type StickyFolderWire, type StickyNoteWire } from './remote.ts'

/** Retained snapshot row: one serialized whole-wall payload. */
export interface StickySnapshotRecord {
  readonly id: string
  readonly savedAt: number
  readonly kind: 'recent' | 'daily'
  readonly payload: string
}

/** Storage-domain image row: pasted image bytes as a data URL. */
export interface StickyImageRecord {
  readonly id: string
  readonly dataUrl: string
  readonly createdAt: number
}

const noteRecordSchema = zod.object({
  id: zod.string(),
  folderId: zod.string(),
  text: zod.string(),
  color: zod.enum(STICKY_COLORS),
  pinned: zod.boolean(),
  struck: zod.boolean(),
  createdAt: zod.number(),
  updatedAt: zod.number(),
  deletedAt: zod.number().nullable(),
  origin: zod.object({ sessionId: zod.string(), turn: zod.number().nullable(), snippet: zod.string() }).nullable(),
  images: zod.array(zod.string()).default([]),
})

const folderRecordSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  emoji: zod.string(),
  color: zod.enum(STICKY_COLORS),
  order: zod.number(),
  builtin: zod.boolean(),
})

const snapshotRecordSchema = zod.object({
  id: zod.string(),
  savedAt: zod.number(),
  kind: zod.enum(['recent', 'daily']),
  payload: zod.string(),
})

const imageRecordSchema = zod.object({
  id: zod.string(),
  dataUrl: zod.string(),
  createdAt: zod.number(),
})

/** Storage-domain spec: folders, notes, images, and retained snapshots. */
export const stickyWallDomain = defineDomain({
  name: 'sticky_wall',
  version: 1,
  global: {
    schema: zod.object({ seededAt: zod.number() }),
    initial: { seededAt: 0 },
  },
  tables: {
    folders: domainTable<string, StickyFolderWire>(folderRecordSchema),
    notes: domainTable<string, StickyNoteWire>(noteRecordSchema),
    images: domainTable<string, StickyImageRecord>(imageRecordSchema),
    snapshots: domainTable<string, StickySnapshotRecord>(snapshotRecordSchema),
  },
})

/** Opened-domain convenience alias. */
export type WallDomain = Domain<typeof stickyWallDomain>

/** Crash-recovery journal kept separately from the existing wall schema. */
export const stickySyncJournalDomain = defineDomain({
  name: 'sticky_wall_sync_journal',
  version: 1,
  global: { schema: zod.object({ pending: zod.string() }), initial: { pending: '' } },
  tables: {},
})
