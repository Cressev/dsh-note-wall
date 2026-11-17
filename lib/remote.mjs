import { createTypertRemoteInfo } from "@deepseek-ai/dsh-typert-protocol/remote-info";
import { z } from "zod";
// node_modules/.prebuild/remote.mjs
const STICKY_COLORS = [
	"yellow",
	"pink",
	"mint",
	"blue",
	"purple",
	"orange"
];
const colorSchema = z.enum(STICKY_COLORS);
const originSchema = z.object({
	sessionId: z.string(),
	turn: z.number().nullable(),
	snippet: z.string()
});
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
	images: z.array(z.string())
});
const imageSchema = z.object({
	id: z.string(),
	dataUrl: z.string(),
	createdAt: z.number()
});
const folderSchema = z.object({
	id: z.string(),
	name: z.string(),
	emoji: z.string(),
	color: colorSchema,
	order: z.number(),
	builtin: z.boolean()
});
const snapshotSchema = z.object({
	id: z.string(),
	savedAt: z.number(),
	kind: z.enum(["recent", "daily"]),
	notes: z.number()
});
const stateSchema = z.object({
	folders: z.array(folderSchema),
	notes: z.array(noteSchema),
	snapshots: z.array(snapshotSchema)
});
const notePatchSchema = z.object({
	text: z.string().optional(),
	color: colorSchema.optional(),
	pinned: z.boolean().optional(),
	struck: z.boolean().optional()
});
const folderPatchSchema = z.object({
	name: z.string().optional(),
	emoji: z.string().optional(),
	color: colorSchema.optional()
});
const colorJson = {
	type: "string",
	enum: [...STICKY_COLORS]
};
const originJson = {
	type: "object",
	properties: {
		sessionId: { type: "string" },
		turn: { type: ["integer", "null"] },
		snippet: { type: "string" }
	},
	required: [
		"sessionId",
		"turn",
		"snippet"
	],
	additionalProperties: false
};
const noteJson = {
	type: "object",
	properties: {
		id: { type: "string" },
		folderId: { type: "string" },
		text: { type: "string" },
		color: colorJson,
		pinned: { type: "boolean" },
		struck: { type: "boolean" },
		createdAt: { type: "number" },
		updatedAt: { type: "number" },
		deletedAt: { type: ["number", "null"] },
		origin: originJson,
		images: {
			type: "array",
			items: { type: "string" }
		}
	},
	required: [
		"id",
		"folderId",
		"text",
		"color",
		"pinned",
		"struck",
		"createdAt",
		"updatedAt",
		"deletedAt",
		"origin",
		"images"
	],
	additionalProperties: true
};
const imageJson = {
	type: "object",
	properties: {
		id: { type: "string" },
		dataUrl: { type: "string" },
		createdAt: { type: "number" }
	},
	required: [
		"id",
		"dataUrl",
		"createdAt"
	],
	additionalProperties: true
};
const folderJson = {
	type: "object",
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		emoji: { type: "string" },
		color: colorJson,
		order: { type: "number" },
		builtin: { type: "boolean" }
	},
	required: [
		"id",
		"name",
		"emoji",
		"color",
		"order",
		"builtin"
	],
	additionalProperties: true
};
const snapshotJson = {
	type: "object",
	properties: {
		id: { type: "string" },
		savedAt: { type: "number" },
		kind: {
			type: "string",
			enum: ["recent", "daily"]
		},
		notes: { type: "number" }
	},
	required: [
		"id",
		"savedAt",
		"kind",
		"notes"
	],
	additionalProperties: true
};
const stickyWallRemote = createTypertRemoteInfo({
	package: "sticky-wall-plugin",
	methods: {
		"stickyWall/state": {
			service: "stickyWall",
			description: "Load the whole sticky wall: folders, notes (including trashed), and retained snapshots.",
			invocation: { kind: "direct" },
			parameters: [],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyWallState",
				create: () => stateSchema,
				description: "Complete wall state.",
				jsonSchema: {
					type: "object",
					properties: {
						folders: {
							type: "array",
							items: folderJson
						},
						notes: {
							type: "array",
							items: noteJson
						},
						snapshots: {
							type: "array",
							items: snapshotJson
						}
					},
					required: [
						"folders",
						"notes",
						"snapshots"
					],
					additionalProperties: true
				}
			}
		},
		"stickyWall/createNote": {
			service: "stickyWall",
			description: "Create one sticky note.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note text with optional folder, color, and conversation origin.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#CreateNoteRequest",
					create: () => z.object({
						text: z.string(),
						folderId: z.string().optional(),
						color: colorSchema.optional(),
						origin: originSchema.optional()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							text: { type: "string" },
							folderId: { type: "string" },
							color: colorJson,
							origin: originJson
						},
						required: ["text"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#CreateNoteRequest",
					create: () => z.object({
						text: z.string(),
						folderId: z.string().optional(),
						color: colorSchema.optional(),
						origin: originSchema.optional()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							text: { type: "string" },
							folderId: { type: "string" },
							color: colorJson,
							origin: originJson
						},
						required: ["text"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyNoteWire",
				create: () => noteSchema,
				description: "The created note.",
				jsonSchema: noteJson
			}
		},
		"stickyWall/updateNote": {
			service: "stickyWall",
			description: "Patch one note (text, color, pin, strike-through).",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note id and the fields to change.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#UpdateNoteRequest",
					create: () => z.object({
						id: z.string(),
						patch: notePatchSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							patch: {
								type: "object",
								properties: {
									text: { type: "string" },
									color: colorJson,
									pinned: { type: "boolean" },
									struck: { type: "boolean" }
								},
								additionalProperties: false
							}
						},
						required: ["id", "patch"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#UpdateNoteRequest",
					create: () => z.object({
						id: z.string(),
						patch: notePatchSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							patch: {
								type: "object",
								properties: {
									text: { type: "string" },
									color: colorJson,
									pinned: { type: "boolean" },
									struck: { type: "boolean" }
								},
								additionalProperties: false
							}
						},
						required: ["id", "patch"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyNoteWire",
				create: () => noteSchema,
				description: "The updated note.",
				jsonSchema: noteJson
			}
		},
		"stickyWall/moveNote": {
			service: "stickyWall",
			description: "Move one note into another folder.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note id and target folder id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#MoveNoteRequest",
					create: () => z.object({
						id: z.string(),
						folderId: z.string()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							folderId: { type: "string" }
						},
						required: ["id", "folderId"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#MoveNoteRequest",
					create: () => z.object({
						id: z.string(),
						folderId: z.string()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							folderId: { type: "string" }
						},
						required: ["id", "folderId"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyNoteWire",
				create: () => noteSchema,
				description: "The moved note.",
				jsonSchema: noteJson
			}
		},
		"stickyWall/deleteNote": {
			service: "stickyWall",
			description: "Soft-delete one note into the trash.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#DeleteNoteRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#DeleteNoteRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#Void",
				create: () => z.void(),
				description: "Nothing on success.",
				jsonSchema: { type: "null" }
			}
		},
		"stickyWall/restoreNote": {
			service: "stickyWall",
			description: "Restore one trashed note back to its folder.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#RestoreNoteRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#RestoreNoteRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyNoteWire",
				create: () => noteSchema,
				description: "The restored note.",
				jsonSchema: noteJson
			}
		},
		"stickyWall/emptyTrash": {
			service: "stickyWall",
			description: "Permanently remove every trashed note.",
			invocation: { kind: "direct" },
			parameters: [],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#EmptyTrashResult",
				create: () => z.object({ removed: z.array(z.string()) }),
				description: "Ids removed by this run.",
				jsonSchema: {
					type: "object",
					properties: { removed: {
						type: "array",
						items: { type: "string" }
					} },
					required: ["removed"],
					additionalProperties: true
				}
			}
		},
		"stickyWall/createFolder": {
			service: "stickyWall",
			description: "Create one folder.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Folder name with optional emoji and color.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#CreateFolderRequest",
					create: () => z.object({
						name: z.string(),
						emoji: z.string().optional(),
						color: colorSchema.optional()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							name: { type: "string" },
							emoji: { type: "string" },
							color: colorJson
						},
						required: ["name"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#CreateFolderRequest",
					create: () => z.object({
						name: z.string(),
						emoji: z.string().optional(),
						color: colorSchema.optional()
					}),
					jsonSchema: {
						type: "object",
						properties: {
							name: { type: "string" },
							emoji: { type: "string" },
							color: colorJson
						},
						required: ["name"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyFolderWire",
				create: () => folderSchema,
				description: "The created folder.",
				jsonSchema: folderJson
			}
		},
		"stickyWall/updateFolder": {
			service: "stickyWall",
			description: "Patch one folder (name, emoji, color).",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Folder id and the fields to change.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#UpdateFolderRequest",
					create: () => z.object({
						id: z.string(),
						patch: folderPatchSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							patch: {
								type: "object",
								properties: {
									name: { type: "string" },
									emoji: { type: "string" },
									color: colorJson
								},
								additionalProperties: false
							}
						},
						required: ["id", "patch"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#UpdateFolderRequest",
					create: () => z.object({
						id: z.string(),
						patch: folderPatchSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							patch: {
								type: "object",
								properties: {
									name: { type: "string" },
									emoji: { type: "string" },
									color: colorJson
								},
								additionalProperties: false
							}
						},
						required: ["id", "patch"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyFolderWire",
				create: () => folderSchema,
				description: "The updated folder.",
				jsonSchema: folderJson
			}
		},
		"stickyWall/deleteFolder": {
			service: "stickyWall",
			description: "Delete one non-builtin folder; its notes move to the builtin inbox folder.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Folder id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#DeleteFolderRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#DeleteFolderRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#DeleteFolderResult",
				create: () => z.object({ moved: z.number() }),
				description: "How many notes moved to the inbox folder.",
				jsonSchema: {
					type: "object",
					properties: { moved: { type: "number" } },
					required: ["moved"],
					additionalProperties: true
				}
			}
		},
		"stickyWall/exportWall": {
			service: "stickyWall",
			description: "Export the whole wall as Markdown or JSON text.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Export format.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#ExportRequest",
					create: () => z.object({ format: z.enum(["markdown", "json"]) }),
					jsonSchema: {
						type: "object",
						properties: { format: {
							type: "string",
							enum: ["markdown", "json"]
						} },
						required: ["format"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#ExportRequest",
					create: () => z.object({ format: z.enum(["markdown", "json"]) }),
					jsonSchema: {
						type: "object",
						properties: { format: {
							type: "string",
							enum: ["markdown", "json"]
						} },
						required: ["format"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#ExportResult",
				create: () => z.object({
					content: z.string(),
					filename: z.string()
				}),
				description: "Exported content and a suggested filename.",
				jsonSchema: {
					type: "object",
					properties: {
						content: { type: "string" },
						filename: { type: "string" }
					},
					required: ["content", "filename"],
					additionalProperties: true
				}
			}
		},
		"stickyWall/restoreSnapshot": {
			service: "stickyWall",
			description: "Replace the live wall with one retained snapshot.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Snapshot id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#RestoreSnapshotRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#RestoreSnapshotRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyWallState",
				create: () => stateSchema,
				description: "Wall state after the restore.",
				jsonSchema: {
					type: "object",
					properties: {
						folders: {
							type: "array",
							items: folderJson
						},
						notes: {
							type: "array",
							items: noteJson
						},
						snapshots: {
							type: "array",
							items: snapshotJson
						}
					},
					required: [
						"folders",
						"notes",
						"snapshots"
					],
					additionalProperties: true
				}
			}
		},
		"stickyWall/saveImage": {
			service: "stickyWall",
			description: "Store one pasted image (data URL) and return its reference.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Image as a data:image/* URL.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#SaveImageRequest",
					create: () => z.object({ dataUrl: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { dataUrl: { type: "string" } },
						required: ["dataUrl"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#SaveImageRequest",
					create: () => z.object({ dataUrl: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { dataUrl: { type: "string" } },
						required: ["dataUrl"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyImageWire",
				create: () => imageSchema,
				description: "The stored image reference.",
				jsonSchema: imageJson
			}
		},
		"stickyWall/image": {
			service: "stickyWall",
			description: "Read one stored image by id.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Image id.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#ImageRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#ImageRequest",
					create: () => z.object({ id: z.string() }),
					jsonSchema: {
						type: "object",
						properties: { id: { type: "string" } },
						required: ["id"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyImageWire",
				create: () => imageSchema,
				description: "The stored image.",
				jsonSchema: imageJson
			}
		},
		"stickyWall/attachImages": {
			service: "stickyWall",
			description: "Append stored image ids onto one note.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Note id and image ids to append.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#AttachImagesRequest",
					create: () => z.object({
						id: z.string(),
						imageIds: z.array(z.string())
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							imageIds: {
								type: "array",
								items: { type: "string" }
							}
						},
						required: ["id", "imageIds"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#AttachImagesRequest",
					create: () => z.object({
						id: z.string(),
						imageIds: z.array(z.string())
					}),
					jsonSchema: {
						type: "object",
						properties: {
							id: { type: "string" },
							imageIds: {
								type: "array",
								items: { type: "string" }
							}
						},
						required: ["id", "imageIds"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#StickyNoteWire",
				create: () => noteSchema,
				description: "The updated note.",
				jsonSchema: noteJson
			}
		}
	}
}, z);
export { STICKY_COLORS, stickyWallRemote };
