/**
 * Host+client shared remote declaration for the `stickyWall` namespace.
 *
 * @module sticky-wall-plugin/remote
 */
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info'
import { z } from 'zod'
import type { SyncWall } from './sync-merge.ts'

/** Sticky-note palette keys; the client maps them to candy colors. */
export const STICKY_COLORS = ['yellow', 'pink', 'mint', 'blue', 'purple', 'orange'] as const

/** One palette key. */
export type StickyColor = typeof STICKY_COLORS[number]

/** Where a note captured from selected conversation text came from. */
export interface StickyOrigin {
  readonly sessionId: string
  readonly turn: number | null
  readonly snippet: string
}

/** Wire record for one sticky note. */
export interface StickyNoteWire {
  readonly id: string
  readonly folderId: string
  readonly text: string
  readonly color: StickyColor
  readonly pinned: boolean
  readonly struck: boolean
  readonly createdAt: number
  readonly updatedAt: number
  readonly deletedAt: number | null
  readonly origin: StickyOrigin | null
  /** Attachment ids of pasted images, in paste order. */
  readonly images: readonly string[]
}

/** Wire record for one stored image. */
export interface StickyImageWire {
  readonly id: string
  readonly dataUrl: string
  readonly createdAt: number
}

/** Wire record for one folder. */
export interface StickyFolderWire {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly color: StickyColor
  readonly order: number
  readonly builtin: boolean
}

/** Wire record for one retained snapshot of the whole wall. */
export interface StickySnapshotWire {
  readonly id: string
  readonly savedAt: number
  readonly kind: 'recent' | 'daily'
  readonly notes: number
}

/** Whole-wall state the panel loads. */
export interface StickyWallState {
  readonly folders: readonly StickyFolderWire[]
  readonly notes: readonly StickyNoteWire[]
  readonly snapshots: readonly StickySnapshotWire[]
}

/** Patchable note fields. */
export interface StickyNotePatch {
  readonly text?: string
  readonly color?: StickyColor
  readonly pinned?: boolean
  readonly struck?: boolean
}

/** Patchable folder fields. */
export interface StickyFolderPatch {
  readonly name?: string
  readonly emoji?: string
  readonly color?: StickyColor
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespaceMap {
    /** Sticky-wall management namespace mounted by this plugin. */
    stickyWall: {
      state(): Promise<RemoteResult<StickyWallState>>
      createNote(request: {
        text: string
        folderId?: string
        color?: StickyColor
        origin?: StickyOrigin
      }): Promise<RemoteResult<StickyNoteWire>>
      updateNote(request: { id: string, patch: StickyNotePatch }): Promise<RemoteResult<StickyNoteWire>>
      moveNote(request: { id: string, folderId: string }): Promise<RemoteResult<StickyNoteWire>>
      deleteNote(request: { id: string }): Promise<RemoteResult<void>>
      restoreNote(request: { id: string }): Promise<RemoteResult<StickyNoteWire>>
      emptyTrash(): Promise<RemoteResult<{ removed: string[] }>>
      createFolder(request: { name: string, emoji?: string, color?: StickyColor }): Promise<RemoteResult<StickyFolderWire>>
      updateFolder(request: { id: string, patch: StickyFolderPatch }): Promise<RemoteResult<StickyFolderWire>>
      deleteFolder(request: { id: string }): Promise<RemoteResult<{ moved: number }>>
      exportWall(request: { format: 'markdown' | 'json' }): Promise<RemoteResult<{ content: string, filename: string }>>
      restoreSnapshot(request: { id: string }): Promise<RemoteResult<StickyWallState>>
      saveImage(request: { dataUrl: string }): Promise<RemoteResult<StickyImageWire>>
      image(request: { id: string }): Promise<RemoteResult<StickyImageWire>>
      attachImages(request: { id: string, imageIds: readonly string[] }): Promise<RemoteResult<StickyNoteWire>>
      syncRead(): Promise<RemoteResult<SyncWall>>
      syncApply(request: { expected: SyncWall, next: SyncWall }): Promise<RemoteResult<boolean>>
    }
  }
}

const colorSchema = z.enum(STICKY_COLORS)
const originSchema = z.object({
  sessionId: z.string(),
  turn: z.number().nullable(),
  snippet: z.string(),
})
const noteSchema = z.object({
  id: z.string(),
  folderId: z.string(),
  text: z.string(),
  color: colorSchema,
  pinned: z.boolean(),
  struck: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
  origin: originSchema.nullable(),
  images: z.array(z.string()),
})
const imageSchema = z.object({
  id: z.string(),
  dataUrl: z.string(),
  createdAt: z.number(),
})
const folderSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: colorSchema,
  order: z.number(),
  builtin: z.boolean(),
})
const snapshotSchema = z.object({
  id: z.string(),
  savedAt: z.number(),
  kind: z.enum(['recent', 'daily']),
  notes: z.number(),
})
const stateSchema = z.object({ folders: z.array(folderSchema), notes: z.array(noteSchema), snapshots: z.array(snapshotSchema) })
const syncWallSchema = z.object({ folders: z.array(folderSchema), notes: z.array(noteSchema), images: z.array(imageSchema) })

const notePatchSchema = z.object({
  text: z.string().optional(),
  color: colorSchema.optional(),
  pinned: z.boolean().optional(),
  struck: z.boolean().optional(),
})
const folderPatchSchema = z.object({
  name: z.string().optional(),
  emoji: z.string().optional(),
  color: colorSchema.optional(),
})

const colorJson = { type: 'string', enum: [...STICKY_COLORS] } as const
const originJson = {
  type: 'object',
  properties: {
    sessionId: { type: 'string' },
    turn: { type: ['integer', 'null'] },
    snippet: { type: 'string' },
  },
  required: ['sessionId', 'turn', 'snippet'],
  additionalProperties: false,
} as const
const noteJson = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    folderId: { type: 'string' },
    text: { type: 'string' },
    color: colorJson,
    pinned: { type: 'boolean' },
    struck: { type: 'boolean' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    deletedAt: { type: ['number', 'null'] },
    origin: originJson,
    images: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'folderId', 'text', 'color', 'pinned', 'struck', 'createdAt', 'updatedAt', 'deletedAt', 'origin', 'images'],
  additionalProperties: true,
} as const
const imageJson = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    dataUrl: { type: 'string' },
    createdAt: { type: 'number' },
  },
  required: ['id', 'dataUrl', 'createdAt'],
  additionalProperties: true,
} as const
const folderJson = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    emoji: { type: 'string' },
    color: colorJson,
    order: { type: 'number' },
    builtin: { type: 'boolean' },
  },
  required: ['id', 'name', 'emoji', 'color', 'order', 'builtin'],
  additionalProperties: true,
} as const
const syncWallJson = {
  type: 'object',
  properties: { folders: { type: 'array', items: folderJson }, notes: { type: 'array', items: noteJson }, images: { type: 'array', items: imageJson } },
  required: ['folders', 'notes', 'images'], additionalProperties: false,
} as const
const snapshotJson = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    savedAt: { type: 'number' },
    kind: { type: 'string', enum: ['recent', 'daily'] },
    notes: { type: 'number' },
  },
  required: ['id', 'savedAt', 'kind', 'notes'],
  additionalProperties: true,
} as const

const voidJson = { type: 'null' } as const

/** Hand-written remote contribution mirroring the generated clients' shape. */
export const stickyWallRemote = createTypertRemoteInfo({
  package: 'sticky-wall-plugin',
  methods: {
    'stickyWall/state': {
      service: 'stickyWall',
      description: 'Load the whole sticky wall: folders, notes (including trashed), and retained snapshots.',
      invocation: { kind: 'direct' },
      parameters: [],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyWallState', create: () => stateSchema,
        description: 'Complete wall state.', jsonSchema: {
          type: 'object',
          properties: { folders: { type: 'array', items: folderJson }, notes: { type: 'array', items: noteJson }, snapshots: { type: 'array', items: snapshotJson } },
          required: ['folders', 'notes', 'snapshots'], additionalProperties: true,
        } as const,
      },
    },
    'stickyWall/createNote': {
      service: 'stickyWall',
      description: 'Create one sticky note.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note text with optional folder, color, and conversation origin.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#CreateNoteRequest',
          create: () => z.object({ text: z.string(), folderId: z.string().optional(), color: colorSchema.optional(), origin: originSchema.optional() }),
          jsonSchema: {
            type: 'object', properties: { text: { type: 'string' }, folderId: { type: 'string' }, color: colorJson, origin: originJson },
            required: ['text'], additionalProperties: false,
          } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#CreateNoteRequest',
          create: () => z.object({ text: z.string(), folderId: z.string().optional(), color: colorSchema.optional(), origin: originSchema.optional() }),
          jsonSchema: {
            type: 'object', properties: { text: { type: 'string' }, folderId: { type: 'string' }, color: colorJson, origin: originJson },
            required: ['text'], additionalProperties: false,
          } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyNoteWire', create: () => noteSchema,
        description: 'The created note.', jsonSchema: noteJson,
      },
    },
    'stickyWall/updateNote': {
      service: 'stickyWall',
      description: 'Patch one note (text, color, pin, strike-through).',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note id and the fields to change.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#UpdateNoteRequest',
          create: () => z.object({ id: z.string(), patch: notePatchSchema }),
          jsonSchema: {
            type: 'object', properties: { id: { type: 'string' }, patch: { type: 'object', properties: { text: { type: 'string' }, color: colorJson, pinned: { type: 'boolean' }, struck: { type: 'boolean' } }, additionalProperties: false } },
            required: ['id', 'patch'], additionalProperties: false,
          } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#UpdateNoteRequest',
          create: () => z.object({ id: z.string(), patch: notePatchSchema }),
          jsonSchema: {
            type: 'object', properties: { id: { type: 'string' }, patch: { type: 'object', properties: { text: { type: 'string' }, color: colorJson, pinned: { type: 'boolean' }, struck: { type: 'boolean' } }, additionalProperties: false } },
            required: ['id', 'patch'], additionalProperties: false,
          } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyNoteWire', create: () => noteSchema,
        description: 'The updated note.', jsonSchema: noteJson,
      },
    },
    'stickyWall/moveNote': {
      service: 'stickyWall',
      description: 'Move one note into another folder.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note id and target folder id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#MoveNoteRequest',
          create: () => z.object({ id: z.string(), folderId: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' }, folderId: { type: 'string' } }, required: ['id', 'folderId'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#MoveNoteRequest',
          create: () => z.object({ id: z.string(), folderId: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' }, folderId: { type: 'string' } }, required: ['id', 'folderId'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyNoteWire', create: () => noteSchema,
        description: 'The moved note.', jsonSchema: noteJson,
      },
    },
    'stickyWall/deleteNote': {
      service: 'stickyWall',
      description: 'Soft-delete one note into the trash.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#DeleteNoteRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#DeleteNoteRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
      }],
      result: { mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#Void', create: () => z.void(), description: 'Nothing on success.', jsonSchema: voidJson },
    },
    'stickyWall/restoreNote': {
      service: 'stickyWall',
      description: 'Restore one trashed note back to its folder.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#RestoreNoteRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#RestoreNoteRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyNoteWire', create: () => noteSchema,
        description: 'The restored note.', jsonSchema: noteJson,
      },
    },
    'stickyWall/emptyTrash': {
      service: 'stickyWall',
      description: 'Permanently remove every trashed note.',
      invocation: { kind: 'direct' },
      parameters: [],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#EmptyTrashResult', create: () => z.object({ removed: z.array(z.string()) }),
        description: 'Ids removed by this run.', jsonSchema: { type: 'object', properties: { removed: { type: 'array', items: { type: 'string' } } }, required: ['removed'], additionalProperties: true } as const,
      },
    },
    'stickyWall/createFolder': {
      service: 'stickyWall',
      description: 'Create one folder.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Folder name with optional emoji and color.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#CreateFolderRequest',
          create: () => z.object({ name: z.string(), emoji: z.string().optional(), color: colorSchema.optional() }),
          jsonSchema: { type: 'object', properties: { name: { type: 'string' }, emoji: { type: 'string' }, color: colorJson }, required: ['name'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#CreateFolderRequest',
          create: () => z.object({ name: z.string(), emoji: z.string().optional(), color: colorSchema.optional() }),
          jsonSchema: { type: 'object', properties: { name: { type: 'string' }, emoji: { type: 'string' }, color: colorJson }, required: ['name'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyFolderWire', create: () => folderSchema,
        description: 'The created folder.', jsonSchema: folderJson,
      },
    },
    'stickyWall/updateFolder': {
      service: 'stickyWall',
      description: 'Patch one folder (name, emoji, color).',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Folder id and the fields to change.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#UpdateFolderRequest',
          create: () => z.object({ id: z.string(), patch: folderPatchSchema }),
          jsonSchema: {
            type: 'object', properties: { id: { type: 'string' }, patch: { type: 'object', properties: { name: { type: 'string' }, emoji: { type: 'string' }, color: colorJson }, additionalProperties: false } },
            required: ['id', 'patch'], additionalProperties: false,
          } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#UpdateFolderRequest',
          create: () => z.object({ id: z.string(), patch: folderPatchSchema }),
          jsonSchema: {
            type: 'object', properties: { id: { type: 'string' }, patch: { type: 'object', properties: { name: { type: 'string' }, emoji: { type: 'string' }, color: colorJson }, additionalProperties: false } },
            required: ['id', 'patch'], additionalProperties: false,
          } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyFolderWire', create: () => folderSchema,
        description: 'The updated folder.', jsonSchema: folderJson,
      },
    },
    'stickyWall/deleteFolder': {
      service: 'stickyWall',
      description: 'Delete one non-builtin folder; its notes move to the builtin inbox folder.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Folder id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#DeleteFolderRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#DeleteFolderRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#DeleteFolderResult', create: () => z.object({ moved: z.number() }),
        description: 'How many notes moved to the inbox folder.', jsonSchema: { type: 'object', properties: { moved: { type: 'number' } }, required: ['moved'], additionalProperties: true } as const,
      },
    },
    'stickyWall/exportWall': {
      service: 'stickyWall',
      description: 'Export the whole wall as Markdown or JSON text.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Export format.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#ExportRequest',
          create: () => z.object({ format: z.enum(['markdown', 'json']) }),
          jsonSchema: { type: 'object', properties: { format: { type: 'string', enum: ['markdown', 'json'] } }, required: ['format'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#ExportRequest',
          create: () => z.object({ format: z.enum(['markdown', 'json']) }),
          jsonSchema: { type: 'object', properties: { format: { type: 'string', enum: ['markdown', 'json'] } }, required: ['format'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#ExportResult', create: () => z.object({ content: z.string(), filename: z.string() }),
        description: 'Exported content and a suggested filename.', jsonSchema: { type: 'object', properties: { content: { type: 'string' }, filename: { type: 'string' } }, required: ['content', 'filename'], additionalProperties: true } as const,
      },
    },
    'stickyWall/restoreSnapshot': {
      service: 'stickyWall',
      description: 'Replace the live wall with one retained snapshot.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Snapshot id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#RestoreSnapshotRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#RestoreSnapshotRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyWallState', create: () => stateSchema,
        description: 'Wall state after the restore.', jsonSchema: {
          type: 'object',
          properties: { folders: { type: 'array', items: folderJson }, notes: { type: 'array', items: noteJson }, snapshots: { type: 'array', items: snapshotJson } },
          required: ['folders', 'notes', 'snapshots'], additionalProperties: true,
        } as const,
      },
    },
    'stickyWall/saveImage': {
      service: 'stickyWall',
      description: 'Store one pasted image (data URL) and return its reference.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Image as a data:image/* URL.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SaveImageRequest',
          create: () => z.object({ dataUrl: z.string() }),
          jsonSchema: { type: 'object', properties: { dataUrl: { type: 'string' } }, required: ['dataUrl'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SaveImageRequest',
          create: () => z.object({ dataUrl: z.string() }),
          jsonSchema: { type: 'object', properties: { dataUrl: { type: 'string' } }, required: ['dataUrl'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyImageWire', create: () => imageSchema,
        description: 'The stored image reference.', jsonSchema: imageJson,
      },
    },
    'stickyWall/image': {
      service: 'stickyWall',
      description: 'Read one stored image by id.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Image id.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#ImageRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#ImageRequest',
          create: () => z.object({ id: z.string() }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyImageWire', create: () => imageSchema,
        description: 'The stored image.', jsonSchema: imageJson,
      },
    },
    'stickyWall/attachImages': {
      service: 'stickyWall',
      description: 'Append stored image ids onto one note.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Note id and image ids to append.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#AttachImagesRequest',
          create: () => z.object({ id: z.string(), imageIds: z.array(z.string()) }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' }, imageIds: { type: 'array', items: { type: 'string' } } }, required: ['id', 'imageIds'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#AttachImagesRequest',
          create: () => z.object({ id: z.string(), imageIds: z.array(z.string()) }),
          jsonSchema: { type: 'object', properties: { id: { type: 'string' }, imageIds: { type: 'array', items: { type: 'string' } } }, required: ['id', 'imageIds'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#StickyNoteWire', create: () => noteSchema,
        description: 'The updated note.', jsonSchema: noteJson,
      },
    },
    'stickyWall/syncRead': {
      service: 'stickyWall',
      description: 'Read the local wall for synchronization.',
      invocation: { kind: 'direct' },
      parameters: [],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SyncWall', create: () => syncWallSchema,
        description: 'Complete local wall.', jsonSchema: syncWallJson,
      },
    },
    'stickyWall/syncApply': {
      service: 'stickyWall',
      description: 'Apply a synchronized wall if the local wall is unchanged.',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        description: 'Expected local wall and its replacement.',
        source: 'json',
        codec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SyncApplyRequest',
          create: () => z.object({ expected: syncWallSchema, next: syncWallSchema }),
          jsonSchema: { type: 'object', properties: { expected: syncWallJson, next: syncWallJson }, required: ['expected', 'next'], additionalProperties: false } as const,
        },
        strictCodec: {
          mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SyncApplyRequest',
          create: () => z.object({ expected: syncWallSchema, next: syncWallSchema }),
          jsonSchema: { type: 'object', properties: { expected: syncWallJson, next: syncWallJson }, required: ['expected', 'next'], additionalProperties: false } as const,
        },
      }],
      result: {
        mode: 'strict', typeSymbol: 'sticky-wall-plugin/remote#SyncApplied', create: () => z.boolean(),
        description: 'Whether the local wall was updated.', jsonSchema: { type: 'boolean' } as const,
      },
    },
  },
}, z)
