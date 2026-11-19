window.__ModuleLoader__.load({
	id: "dsh-note-wall",
	factory: (require) => {
	var module = { exports: {} };
	var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let zod = require("zod");
let react_jsx_runtime = require("react/jsx-runtime");
let react = require("react");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
// node_modules/.pnpm/@deepseek-ai+dsh-typert-pro_333a1d9eab58194263665daac5bf4786/node_modules/@deepseek-ai/dsh-typert-protocol/lib/types/remote-info.js
/** Lazy assembly of generated Remote definitions using caller-supplied Zod; no runtime imports. */
/**
* Retain one generated definition per endpoint without constructing parsers or projections.
* The class instance builds its shared descriptor/method index on first access;
* input schemas and JSON Schema projections are cached only when requested.
* @param spec - compiler-produced method facts and Zod factories.
* @param zod - the generated artifact's Zod runtime for named-input parsers.
* @returns a lazy, mountable info instance with no registration or transport effects.
*/
function createTypertRemoteInfo(spec, zod) {
	return new RemoteInfo(spec, zod);
}
var RemoteInfo = class {
	spec;
	zod;
	index;
	constructor(spec, zod) {
		this.spec = spec;
		this.zod = zod;
	}
	get package() {
		return this.spec.package;
	}
	get descriptors() {
		return this.resolve().descriptors;
	}
	get methods() {
		return this.resolve().methods;
	}
	resolve() {
		if (this.index !== void 0) return this.index;
		const zod = this.zod;
		const descriptors = [];
		const methods = Object.create(null);
		for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
			const separator = endpoint.indexOf("/");
			const namespace = endpoint.slice(0, separator);
			const method = endpoint.slice(separator + 1);
			const parameters = definition.parameters.map((parameter) => ({
				...parameter,
				wire: parameter.wire ?? parameter.name
			}));
			const descriptor = {
				...definition,
				id: `${this.spec.package}#${endpoint}`,
				namespace,
				method,
				parameters,
				result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
			};
			if (definition.invocation.kind === "direct") {
				const inputs = [];
				methods[endpoint] = Object.assign(descriptor, {
					input(options) {
						const strict = options?.strict === true;
						return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
					},
					invoke(remote, input, signal) {
						const named = input;
						const values = parameters.map((parameter) => named[parameter.wire]);
						if (definition.cancellation !== void 0) values.push(signal);
						const receiver = Reflect.get(remote, namespace);
						return Reflect.get(receiver, method).apply(receiver, values);
					}
				});
			}
			descriptors.push(descriptor);
		}
		return this.index = {
			descriptors,
			methods
		};
	}
};
function optional(parameter) {
	return parameter.source === "json" && parameter.acceptsUndefined === true;
}
var NamedInput = class {
	parameters;
	strict;
	zod;
	schema;
	projection;
	constructor(parameters, strict, zod) {
		this.parameters = parameters;
		this.strict = strict;
		this.zod = zod;
	}
	codec(parameter) {
		return this.strict ? parameter.strictCodec : parameter.codec;
	}
	create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
		const value = this.codec(parameter).create();
		return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
	})));
	get jsonSchema() {
		return this.project().jsonSchema;
	}
	get jsonSchemaError() {
		return this.project().jsonSchemaError;
	}
	project() {
		if (this.projection !== void 0) return this.projection;
		const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
		if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
		return this.projection = { jsonSchema: {
			type: "object",
			properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
				...this.codec(parameter).jsonSchema,
				...parameter.description === void 0 ? {} : { description: parameter.description }
			}])),
			required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
			additionalProperties: false
		} };
	}
};
var ResultValue = class {
	spec;
	projection;
	constructor(spec) {
		this.spec = spec;
	}
	get mode() {
		return this.spec.mode;
	}
	get typeSymbol() {
		return this.spec.typeSymbol;
	}
	get create() {
		return this.spec.create;
	}
	get decode() {
		return this.spec.decode;
	}
	get encode() {
		return this.spec.encode;
	}
	get description() {
		return this.spec.description;
	}
	get jsonSchemaError() {
		return this.spec.jsonSchemaError;
	}
	get jsonSchema() {
		if (this.projection === void 0) {
			const schema = this.spec.jsonSchema;
			this.projection = { value: schema === void 0 ? void 0 : {
				...schema,
				description: this.spec.description
			} };
		}
		return this.projection.value;
	}
};
// node_modules/.prebuild/remote.mjs
const STICKY_COLORS = [
	"yellow",
	"pink",
	"mint",
	"blue",
	"purple",
	"orange"
];
const colorSchema = zod.z.enum(STICKY_COLORS);
const originSchema = zod.z.object({
	sessionId: zod.z.string(),
	turn: zod.z.number().nullable(),
	snippet: zod.z.string()
});
const noteSchema = zod.z.object({
	id: zod.z.string(),
	folderId: zod.z.string(),
	text: zod.z.string(),
	color: colorSchema,
	pinned: zod.z.boolean(),
	struck: zod.z.boolean(),
	createdAt: zod.z.number(),
	updatedAt: zod.z.number(),
	deletedAt: zod.z.number().nullable(),
	origin: originSchema.nullable(),
	images: zod.z.array(zod.z.string())
});
const imageSchema = zod.z.object({
	id: zod.z.string(),
	dataUrl: zod.z.string(),
	createdAt: zod.z.number()
});
const folderSchema = zod.z.object({
	id: zod.z.string(),
	name: zod.z.string(),
	emoji: zod.z.string(),
	color: colorSchema,
	order: zod.z.number(),
	builtin: zod.z.boolean()
});
const snapshotSchema = zod.z.object({
	id: zod.z.string(),
	savedAt: zod.z.number(),
	kind: zod.z.enum(["recent", "daily"]),
	notes: zod.z.number()
});
const stateSchema = zod.z.object({
	folders: zod.z.array(folderSchema),
	notes: zod.z.array(noteSchema),
	snapshots: zod.z.array(snapshotSchema)
});
const syncWallSchema = zod.z.object({
	folders: zod.z.array(folderSchema),
	notes: zod.z.array(noteSchema),
	images: zod.z.array(imageSchema)
});
const notePatchSchema = zod.z.object({
	text: zod.z.string().optional(),
	color: colorSchema.optional(),
	pinned: zod.z.boolean().optional(),
	struck: zod.z.boolean().optional()
});
const folderPatchSchema = zod.z.object({
	name: zod.z.string().optional(),
	emoji: zod.z.string().optional(),
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
const voidJson = { type: "null" };
const syncWallJson = {
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
		images: {
			type: "array",
			items: imageJson
		}
	},
	required: [
		"folders",
		"notes",
		"images"
	],
	additionalProperties: false
};
const stickyWallRemote = createTypertRemoteInfo({
	package: "sticky-wall-plugin",
	methods: {
		"stickyWall/syncRead": {
			service: "stickyWall",
			description: "Read the local wall for synchronization.",
			invocation: { kind: "direct" },
			parameters: [],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#SyncWall",
				create: () => syncWallSchema,
				description: "Complete local wall.",
				jsonSchema: syncWallJson
			}
		},
		"stickyWall/syncApply": {
			service: "stickyWall",
			description: "Apply a synchronized wall if the local wall is unchanged.",
			invocation: { kind: "direct" },
			parameters: [{
				name: "request",
				description: "Expected local wall and its replacement.",
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#SyncApplyRequest",
					create: () => zod.z.object({
						expected: syncWallSchema,
						next: syncWallSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							expected: syncWallJson,
							next: syncWallJson
						},
						required: ["expected", "next"],
						additionalProperties: false
					}
				},
				strictCodec: {
					mode: "strict",
					typeSymbol: "sticky-wall-plugin/remote#SyncApplyRequest",
					create: () => zod.z.object({
						expected: syncWallSchema,
						next: syncWallSchema
					}),
					jsonSchema: {
						type: "object",
						properties: {
							expected: syncWallJson,
							next: syncWallJson
						},
						required: ["expected", "next"],
						additionalProperties: false
					}
				}
			}],
			result: {
				mode: "strict",
				typeSymbol: "sticky-wall-plugin/remote#SyncApplied",
				create: () => zod.z.boolean(),
				description: "Whether the local wall was updated.",
				jsonSchema: { type: "boolean" }
			}
		},
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
					create: () => zod.z.object({
						text: zod.z.string(),
						folderId: zod.z.string().optional(),
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
					create: () => zod.z.object({
						text: zod.z.string(),
						folderId: zod.z.string().optional(),
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
					create: () => zod.z.object({
						id: zod.z.string(),
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
					create: () => zod.z.object({
						id: zod.z.string(),
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
					create: () => zod.z.object({
						id: zod.z.string(),
						folderId: zod.z.string()
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
					create: () => zod.z.object({
						id: zod.z.string(),
						folderId: zod.z.string()
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
				create: () => zod.z.void(),
				description: "Nothing on success.",
				jsonSchema: voidJson
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
				create: () => zod.z.object({ removed: zod.z.array(zod.z.string()) }),
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
					create: () => zod.z.object({
						name: zod.z.string(),
						emoji: zod.z.string().optional(),
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
					create: () => zod.z.object({
						name: zod.z.string(),
						emoji: zod.z.string().optional(),
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
					create: () => zod.z.object({
						id: zod.z.string(),
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
					create: () => zod.z.object({
						id: zod.z.string(),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
				create: () => zod.z.object({ moved: zod.z.number() }),
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
					create: () => zod.z.object({ format: zod.z.enum(["markdown", "json"]) }),
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
					create: () => zod.z.object({ format: zod.z.enum(["markdown", "json"]) }),
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
				create: () => zod.z.object({
					content: zod.z.string(),
					filename: zod.z.string()
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ dataUrl: zod.z.string() }),
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
					create: () => zod.z.object({ dataUrl: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({ id: zod.z.string() }),
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
					create: () => zod.z.object({
						id: zod.z.string(),
						imageIds: zod.z.array(zod.z.string())
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
					create: () => zod.z.object({
						id: zod.z.string(),
						imageIds: zod.z.array(zod.z.string())
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
}, zod.z);
// node_modules/.prebuild/client/locales.mjs
const NS = "stickyWall";
const zh = {
	panel: "便签墙",
	searchPlaceholder: "搜索便签…",
	quickPlaceholder: "随手贴一张，回车上墙（Shift+回车换行）",
	all: "全部",
	trash: "回收站",
	newFolder: "新建文件夹",
	emptyWall: "这里还空空的，贴一张试试 ✨",
	emptyTrash: "回收站是空的",
	emptyTrashAction: "清空回收站",
	emptyTrashConfirm: "确定清空回收站吗？这些便签将被永久删除。",
	restore: "恢复",
	deleteForever: "彻底删除",
	backToSession: "回到会话",
	pin: "置顶",
	unpin: "取消置顶",
	strike: "划掉",
	unstrike: "取消划掉",
	moveTo: "移动到…",
	recolor: "换色",
	deleteNote: "删除",
	rename: "重命名",
	deleteFolder: "删除文件夹",
	deleteFolderConfirm: "删除这个文件夹？里面的便签会移到收纳盒。",
	newFolderName: "文件夹名称",
	folderExists: "文件夹已存在",
	create: "创建",
	cancel: "取消",
	save: "保存",
	exportMd: "导出 Markdown",
	exportJson: "导出 JSON",
	snapshots: "历史快照",
	restoreSnapshot: "恢复此快照",
	snapshotRecent: "变更前",
	snapshotDaily: "每日",
	quickTitle: "快速便签",
	quickHint: "Esc 收起 · ⌘/Ctrl+Shift+N 呼出",
	capturePill: "📌 贴到便签",
	captured: "已贴到便签墙 ✅",
	captureFailed: "贴便签失败",
	loadFailed: "便签墙加载失败",
	retry: "重试",
	edit: "编辑",
	editNote: "编辑便签",
	newNote: "新便签",
	createdAt: "建 ",
	editedAt: "改 ",
	viewCards: "卡片视图",
	viewList: "列表视图",
	preview: "预览",
	editTab: "编辑",
	previewEmpty: "（空）",
	deleteImage: "移除图片",
	noNotesMatch: "没有匹配的便签",
	unsavedConfirm: "有未保存的修改，确定关闭吗？",
	editingPlaceholder: "编辑便签…",
	moreActions: "更多操作",
	colorNames: "黄|粉|绿|蓝|紫|橙"
};
const en = {
	panel: "Sticky wall",
	searchPlaceholder: "Search notes…",
	quickPlaceholder: "Jot a note, Enter to pin (Shift+Enter for newline)",
	all: "All",
	trash: "Trash",
	newFolder: "New folder",
	emptyWall: "Nothing here yet — pin your first note ✨",
	emptyTrash: "Trash is empty",
	emptyTrashAction: "Empty trash",
	emptyTrashConfirm: "Empty the trash? These notes will be permanently removed.",
	restore: "Restore",
	deleteForever: "Delete forever",
	backToSession: "Back to session",
	pin: "Pin",
	unpin: "Unpin",
	strike: "Strike through",
	unstrike: "Unstrike",
	moveTo: "Move to…",
	recolor: "Recolor",
	deleteNote: "Delete",
	rename: "Rename",
	deleteFolder: "Delete folder",
	deleteFolderConfirm: "Delete this folder? Its notes move to the inbox.",
	newFolderName: "Folder name",
	folderExists: "A folder with this name exists",
	create: "Create",
	cancel: "Cancel",
	save: "Save",
	exportMd: "Export Markdown",
	exportJson: "Export JSON",
	snapshots: "Snapshots",
	restoreSnapshot: "Restore this snapshot",
	snapshotRecent: "Before change",
	snapshotDaily: "Daily",
	quickTitle: "Quick note",
	quickHint: "Esc to dismiss · ⌘/Ctrl+Shift+N to open",
	capturePill: "📌 Pin to wall",
	captured: "Pinned to the wall ✅",
	captureFailed: "Failed to pin",
	loadFailed: "Failed to load the wall",
	retry: "Retry",
	edit: "Edit",
	editNote: "Edit note",
	newNote: "New note",
	createdAt: "Created ",
	editedAt: "Edited ",
	viewCards: "Card view",
	viewList: "List view",
	preview: "Preview",
	editTab: "Edit",
	previewEmpty: "(empty)",
	deleteImage: "Remove image",
	noNotesMatch: "No matching notes",
	unsavedConfirm: "Discard unsaved changes?",
	editingPlaceholder: "Edit note…",
	moreActions: "More actions",
	colorNames: "Yellow|Pink|Mint|Blue|Purple|Orange"
};
// node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
// node_modules/.prebuild/client/note-markdown.styles.mjs
const css$2 = {
	"body": "sw-note-markdown-body",
	"bullet": "sw-note-markdown-bullet",
	"checkbox": "sw-note-markdown-checkbox",
	"fmtBar": "sw-note-markdown-fmtBar",
	"fmtBtn": "sw-note-markdown-fmtBtn",
	"gap": "sw-note-markdown-gap",
	"glyphBold": "sw-note-markdown-glyphBold",
	"glyphHeading": "sw-note-markdown-glyphHeading",
	"glyphItalic": "sw-note-markdown-glyphItalic",
	"glyphStrike": "sw-note-markdown-glyphStrike",
	"h1": "sw-note-markdown-h1",
	"h2": "sw-note-markdown-h2",
	"h3": "sw-note-markdown-h3",
	"imgStrip": "sw-note-markdown-imgStrip",
	"inlineCode": "sw-note-markdown-inlineCode",
	"li": "sw-note-markdown-li",
	"lightbox": "sw-note-markdown-lightbox",
	"p": "sw-note-markdown-p",
	"task": "sw-note-markdown-task",
	"taskDone": "sw-note-markdown-taskDone",
	"thumb": "sw-note-markdown-thumb",
	"thumbPending": "sw-note-markdown-thumbPending"
};
const cssText$2 = `/* Note-Markdown inside candy cards. */

.sw-note-markdown-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.sw-note-markdown-gap {
  height: 7px;
}

.sw-note-markdown-h1 {
  margin: 2px 0 1px;
  font-size: 16.5px;
  font-weight: 800;
  line-height: 1.3;
}

.sw-note-markdown-h2 {
  margin: 2px 0 1px;
  font-size: 14.5px;
  font-weight: 800;
  line-height: 1.3;
}

.sw-note-markdown-h3 {
  margin: 1px 0;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
}

.sw-note-markdown-p {
  margin: 0;
  white-space: pre-wrap;
}

.sw-note-markdown-li {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-left: 3px;
}

.sw-note-markdown-bullet {
  flex: none;
  min-width: 14px;
  font-weight: 700;
  opacity: 0.65;
  text-align: center;
}

.sw-note-markdown-task {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 3px;
  margin: 0 -3px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.sw-note-markdown-task:hover {
  background: rgb(255 255 255 / 35%);
}

.sw-note-markdown-checkbox {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border: 1.8px solid currentColor;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.75;
}

.sw-note-markdown-checkbox[data-checked='true'] {
  background: currentColor;
  opacity: 0.92;
}

/* The check glyph inverts against the filled box for contrast. */
.sw-note-markdown-checkbox[data-checked='true']::after {
  content: '';
  position: absolute;
  left: 3.5px;
  top: 1px;
  width: 4.5px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(42deg);
}

.sw-note-markdown-task .sw-note-markdown-checkbox[data-checked='true'] {
  color: inherit;
}

.sw-note-markdown-taskDone {
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  opacity: 0.55;
}

.sw-note-markdown-inlineCode {
  padding: 0.5px 5px;
  border-radius: 6px;
  background: rgb(255 255 255 / 50%);
  font-family: var(--dsw-mono-font, ui-monospace, 'SF Mono', Menlo, Consolas, monospace);
  font-size: 12px;
}

/* ---------- edit toolbar ---------- */

.sw-note-markdown-fmtBar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 0;
}

.sw-note-markdown-fmtBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 26px;
  padding: 0 6px;
  border: none;
  border-radius: 8px;
  background: rgb(255 255 255 / 40%);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.sw-note-markdown-fmtBtn:hover {
  background: rgb(255 255 255 / 85%);
}

/* Letter glyphs for bold/italic/strike/heading \u2014 the typographic idiom; the
   previous raw characters (S\u0336, \u2022, 1., \u2611) rendered as mismatched system
   glyphs and emoji. */
.sw-note-markdown-glyphBold,
.sw-note-markdown-glyphItalic,
.sw-note-markdown-glyphStrike,
.sw-note-markdown-glyphHeading {
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  font-family: var(--dsw-ui-font, -apple-system, 'SF Pro Text', 'PingFang SC', sans-serif);
}

.sw-note-markdown-glyphBold {
  font-weight: 800;
}

.sw-note-markdown-glyphItalic {
  font-style: italic;
  font-weight: 600;
  padding-right: 1px;
}

.sw-note-markdown-glyphStrike {
  font-weight: 650;
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.sw-note-markdown-glyphHeading {
  font-weight: 750;
  font-size: 13px;
}

/* ---------- image strip ---------- */

.sw-note-markdown-imgStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sw-note-markdown-thumb {
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: rgb(255 255 255 / 40%);
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.14s ease;
}

.sw-note-markdown-thumb:hover {
  transform: scale(1.06);
}

.sw-note-markdown-thumbPending {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: rgb(255 255 255 / 40%);
  font-size: 20px;
}

/* ---------- lightbox ---------- */

.sw-note-markdown-lightbox {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgb(0 0 0 / 72%);
  cursor: zoom-out;
  animation: fade-in 0.15s ease both;
}

.sw-note-markdown-lightbox img {
  max-width: min(92vw, 1100px);
  max-height: 86vh;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgb(0 0 0 / 50%);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;
// node_modules/.prebuild/client/note-markdown.mjs
function parseNoteBlocks(text) {
	const taskCounter = { current: 0 };
	return text.split("\n").map((line) => parseLine(line, taskCounter));
}
function parseLine(line, tasks) {
	if (line.trim().length === 0) return {
		kind: "blank",
		text: ""
	};
	let match = /^###\s+(.*)$/.exec(line);
	if (match !== null) return {
		kind: "h3",
		text: match[1]
	};
	match = /^##\s+(.*)$/.exec(line);
	if (match !== null) return {
		kind: "h2",
		text: match[1]
	};
	match = /^#\s+(.*)$/.exec(line);
	if (match !== null) return {
		kind: "h1",
		text: match[1]
	};
	match = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(line);
	if (match !== null) {
		const index = tasks.current;
		tasks.current += 1;
		return {
			kind: "task",
			text: match[2],
			checked: match[1].toLowerCase() === "x",
			taskIndex: index
		};
	}
	match = /^[-*]\s+(.*)$/.exec(line);
	if (match !== null) return {
		kind: "ul",
		text: match[1]
	};
	match = /^\d+[.、]\s*(.*)$/.exec(line);
	if (match !== null) return {
		kind: "ol",
		text: match[1]
	};
	return {
		kind: "p",
		text: line
	};
}
function toggleTask(text, taskIndex) {
	let seen = -1;
	return text.split("\n").map((line) => {
		const match = /^([-*]\s+\[)( |x|X)(\]\s+.*)$/.exec(line);
		if (match === null) return line;
		seen += 1;
		if (seen !== taskIndex) return line;
		return match[1] + (match[2] === " " ? "x" : " ") + match[3];
	}).join("\n");
}
function Inline({ text }) {
	const parts = splitInline(text);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: parts.map((part, i) => {
		if (part.kind === "text") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: part.text }, i);
		if (part.kind === "bold") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: part.text }, i);
		if (part.kind === "italic") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: part.text }, i);
		if (part.kind === "strike") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("s", { children: part.text }, i);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
			className: css$2.inlineCode,
			children: part.text
		}, i);
	}) });
}
const INLINE_RULES = [
	{
		marker: "**",
		kind: "bold"
	},
	{
		marker: "~~",
		kind: "strike"
	},
	{
		marker: "`",
		kind: "code"
	},
	{
		marker: "*",
		kind: "italic"
	}
];
function splitInline(text) {
	const parts = [];
	let buffer = "";
	let i = 0;
	while (i < text.length) {
		const rule = INLINE_RULES.find((r) => text.startsWith(r.marker, i));
		if (rule === void 0) {
			buffer += text[i];
			i += 1;
			continue;
		}
		const end = text.indexOf(rule.marker, i + rule.marker.length);
		if (end === -1) {
			buffer += text[i];
			i += 1;
			continue;
		}
		if (buffer.length > 0) {
			parts.push({
				kind: "text",
				text: buffer
			});
			buffer = "";
		}
		parts.push({
			kind: rule.kind,
			text: text.slice(i + rule.marker.length, end)
		});
		i = end + rule.marker.length;
	}
	if (buffer.length > 0) parts.push({
		kind: "text",
		text: buffer
	});
	return parts;
}
function NoteMarkdown(props) {
	const { text, onToggleTask } = props;
	const blocks = parseNoteBlocks(text);
	let ordered = 0;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: css$2.body,
		children: blocks.map((block, i) => {
			if (block.kind === "blank") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: css$2.gap }, i);
			if (block.kind === "h1") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: css$2.h1,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text })
			}, i);
			if (block.kind === "h2") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
				className: css$2.h2,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text })
			}, i);
			if (block.kind === "h3") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h5", {
				className: css$2.h3,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text })
			}, i);
			if (block.kind === "ul") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css$2.li,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css$2.bullet,
					children: "•"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text }) })]
			}, i);
			if (block.kind === "ol") {
				ordered += 1;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css$2.li,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: css$2.bullet,
						children: [ordered, "."]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text }) })]
				}, i);
			}
			if (block.kind === "task") {
				const index = block.taskIndex ?? 0;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css$2.task,
					"data-todo": index,
					onClick: () => {
						onToggleTask?.(index);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: css$2.checkbox,
						"data-checked": block.checked === true,
						children: block.checked === true ? "✓" : ""
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: block.checked === true ? css$2.taskDone : void 0,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text })
					})]
				}, i);
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: css$2.p,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inline, { text: block.text })
			}, i);
		})
	});
}
const WRAPS = {
	bold: ["**", "**"],
	italic: ["*", "*"],
	strike: ["~~", "~~"],
	code: ["`", "`"]
};
const LINE_PREFIXES = {
	h2: "## ",
	ul: "- ",
	ol: "1. ",
	task: "- [ ] "
};
const PREFIX_TESTS = {
	h2: /^#{1,3}\s+/,
	ul: /^[-*]\s+(?!\[[ xX]\])/,
	ol: /^\d+[.、]\s*/,
	task: /^[-*]\s+\[[ xX]\]\s+/
};
const ANY_PREFIX = /^(#{1,3}\s+|[-*]\s+\[[ xX]\]\s+|[-*]\s+|\d+[.、]\s*)/;
function applyNoteFormat(area, format) {
	const start = area.selectionStart;
	const end = area.selectionEnd;
	const value = area.value;
	const wrap = WRAPS[format];
	if (wrap !== void 0) {
		const selected = value.slice(start, end);
		const already2 = value.slice(start - wrap[0].length, start) === wrap[0] && value.slice(end, end + wrap[1].length) === wrap[1];
		let next2;
		let cursor;
		if (already2) {
			next2 = value.slice(0, start - wrap[0].length) + selected + value.slice(end + wrap[1].length);
			cursor = start - wrap[0].length + selected.length;
		} else {
			next2 = value.slice(0, start) + wrap[0] + selected + wrap[1] + value.slice(end);
			cursor = start + wrap[0].length + selected.length;
		}
		setAreaValue(area, next2, cursor, cursor);
		return next2;
	}
	const prefix = LINE_PREFIXES[format] ?? "";
	const lineStart = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
	const lineEndRaw = value.indexOf("\n", end > start ? end - 1 : end);
	const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
	const lines = value.slice(lineStart, lineEnd).split("\n");
	const already = PREFIX_TESTS[format]?.test(lines[0] ?? "") === true;
	const rewritten = already ? lines.map((line) => line.replace(ANY_PREFIX, "")) : lines.map((line) => prefix + line.replace(ANY_PREFIX, ""));
	const replacement = rewritten.join("\n");
	const next = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
	const mapPosition = (position) => {
		if (position > lineEnd) return lineStart + replacement.length + position - lineEnd;
		let oldOffset = lineStart;
		let newOffset = lineStart;
		for (let i = 0; i < lines.length; i++) {
			const original = lines[i] ?? "";
			const updated = rewritten[i] ?? "";
			if (position <= oldOffset + original.length) {
				const oldPrefixLength = original.match(ANY_PREFIX)?.[0].length ?? 0;
				const newPrefixLength = already ? 0 : prefix.length;
				const contentOffset = Math.max(0, position - oldOffset - oldPrefixLength);
				return newOffset + Math.min(updated.length, newPrefixLength + contentOffset);
			}
			oldOffset += original.length + 1;
			newOffset += updated.length + 1;
		}
		return lineStart + replacement.length;
	};
	setAreaValue(area, next, mapPosition(start), mapPosition(end));
	return next;
}
function setAreaValue(area, next, selStart, selEnd) {
	(Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set)?.call(area, next);
	area.dispatchEvent(new Event("input", { bubbles: true }));
	area.setSelectionRange(selStart, selEnd);
}
function clipboardImageFiles(e) {
	const items = e.clipboardData?.items;
	if (items === void 0) return [];
	const files = [];
	for (const item of Array.from(items)) if (item.kind === "file" && item.type.startsWith("image/")) {
		const file = item.getAsFile();
		if (file !== null) files.push(file);
	}
	return files;
}
function readImageFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(String(reader.result));
		};
		reader.onerror = () => {
			reject(reader.error);
		};
		reader.readAsDataURL(file);
	});
}
// node_modules/.prebuild/client/QuickCapture.styles.mjs
const css$1 = {
	"dot": "sw-quickcapture-dot",
	"dotActive": "sw-quickcapture-dotActive",
	"dots": "sw-quickcapture-dots",
	"pasteStrip": "sw-quickcapture-pasteStrip",
	"pasteThumb": "sw-quickcapture-pasteThumb",
	"pill": "sw-quickcapture-pill",
	"quick": "sw-quickcapture-quick",
	"quickArea": "sw-quickcapture-quickArea",
	"quickClose": "sw-quickcapture-quickClose",
	"quickFoot": "sw-quickcapture-quickFoot",
	"quickHead": "sw-quickcapture-quickHead",
	"quickHint": "sw-quickcapture-quickHint",
	"quickTitle": "sw-quickcapture-quickTitle",
	"root": "sw-quickcapture-root",
	"select": "sw-quickcapture-select",
	"toast": "sw-quickcapture-toast"
};
const cssText$1 = `/* Frame-wide capture surfaces: quick bar, selection pill, toast. */

.sw-quickcapture-root {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
}

/* ---------- quick bar ---------- */

.sw-quickcapture-quick {
  position: absolute;
  top: 18px;
  left: 50%;
  width: min(440px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
  border-radius: 20px;
  border: 1.5px solid color-mix(in srgb, var(--qc-color, #ffd94d) 75%, transparent);
  background: var(--dsw-alias-bg-elevated, #fff);
  box-shadow: 0 18px 46px rgb(0 0 0 / 22%), 0 0 0 4px color-mix(in srgb, var(--qc-color, #ffd94d) 18%, transparent);
  pointer-events: auto;
  transform: translateX(-50%);
  animation: quick-drop 0.26s cubic-bezier(0.2, 1.3, 0.5, 1) both;
}

.sw-quickcapture-quick[data-color='yellow'] { --qc-color: #ffd94d; }
.sw-quickcapture-quick[data-color='pink'] { --qc-color: #ff9ec4; }
.sw-quickcapture-quick[data-color='mint'] { --qc-color: #7fe6b0; }
.sw-quickcapture-quick[data-color='blue'] { --qc-color: #7dc8ff; }
.sw-quickcapture-quick[data-color='purple'] { --qc-color: #c9a7ff; }
.sw-quickcapture-quick[data-color='orange'] { --qc-color: #ffb366; }

.sw-quickcapture-quickHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sw-quickcapture-quickTitle {
  font-size: 12.5px;
  font-weight: 700;
}

.sw-quickcapture-quickClose {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
}

.sw-quickcapture-quickClose:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.sw-quickcapture-quickArea {
  border: 1.5px dashed color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 12px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--qc-color, #ffd94d) 10%, transparent);
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
  resize: none;
  outline: none;
}

.sw-quickcapture-quickArea:focus {
  border-color: color-mix(in srgb, var(--qc-color, #ffd94d) 80%, transparent);
  border-style: solid;
}

.sw-quickcapture-quickFoot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sw-quickcapture-dots {
  display: flex;
  gap: 5px;
}

.sw-quickcapture-dot {
  width: 17px;
  height: 17px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sw-quickcapture-dot:hover {
  transform: scale(1.25);
}

.sw-quickcapture-dotActive {
  box-shadow:
    0 0 0 2px var(--dsw-alias-bg-elevated, #fff),
    0 0 0 4px color-mix(in srgb, currentColor 70%, transparent);
}

.sw-quickcapture-dot[data-color='yellow'] { background: #ffdb4d; color: #e6a800; }
.sw-quickcapture-dot[data-color='pink'] { background: #ff8fbe; color: #ef4f86; }
.sw-quickcapture-dot[data-color='mint'] { background: #4ee39a; color: #17a06a; }
.sw-quickcapture-dot[data-color='blue'] { background: #66bfff; color: #2f8fdc; }
.sw-quickcapture-dot[data-color='purple'] { background: #b48cff; color: #8349e6; }
.sw-quickcapture-dot[data-color='orange'] { background: #ffab52; color: #dd7a15; }

.sw-quickcapture-select {
  height: 28px;
  max-width: 150px;
  padding: 0 8px;
  border: none;
  border-radius: 9px;
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.sw-quickcapture-quickHint {
  font-size: 10.5px;
  opacity: 0.45;
  text-align: center;
}

/* ---------- pasted image strip ---------- */

.sw-quickcapture-pasteStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sw-quickcapture-pasteThumb {
  width: 54px;
  height: 54px;
  border-radius: 9px;
  border: 2px solid rgb(255 255 255 / 70%);
  object-fit: cover;
}

/* ---------- selection pill ---------- */

.sw-quickcapture-pill {
  position: absolute;
  transform: translate(-50%, 0);
  height: 30px;
  padding: 0 13px;
  border: none;
  border-radius: 999px;
  background: #ff9ec4;
  color: #4d2436;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 6px 18px rgb(240 96 143 / 40%);
  animation: pill-pop 0.18s ease both;
}

.sw-quickcapture-pill:hover {
  background: #ff8ab8;
  transform: translate(-50%, 0) scale(1.05);
}

/* ---------- toast ---------- */

.sw-quickcapture-toast {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 18px;
  border-radius: 999px;
  background: color-mix(in srgb, #7fe6b0 88%, #fff);
  color: #14442f;
  font-size: 12.5px;
  font-weight: 700;
  box-shadow: 0 8px 22px rgb(47 174 119 / 35%);
  animation: pill-pop 0.2s ease both;
}

/* ---------- animations ---------- */

@keyframes quick-drop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes pill-pop {
  from {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
`;
// node_modules/.prebuild/client/QuickCapture.mjs
function isQuickToggle(e) {
	return e.key.toLowerCase() === "n" && e.shiftKey && (e.metaKey || e.ctrlKey);
}
function turnAt(node) {
	let cursor = node;
	while (cursor !== null && cursor instanceof Element) {
		for (const attr of [
			"data-turn-process",
			"data-turn-tail",
			"data-turn-trigger"
		]) {
			const value = cursor.getAttribute(attr);
			if (value !== null) {
				const parsed = Number.parseInt(value, 10);
				if (Number.isInteger(parsed)) return parsed;
			}
		}
		cursor = cursor.parentElement;
	}
	return null;
}
function inUserAuthoredText(node) {
	let cursor = node;
	while (cursor !== null && cursor !== document.body) {
		if (cursor instanceof HTMLElement) {
			if (cursor.hasAttribute("data-sticky-overlay")) return true;
			if (cursor.hasAttribute("data-message-bubble")) return true;
			if (cursor.hasAttribute("data-composer-card") || cursor.hasAttribute("data-composer-input")) return true;
			const tag = cursor.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || cursor.isContentEditable) return true;
		}
		cursor = cursor.parentElement;
	}
	return false;
}
async function scrollToSnippet(snippet) {
	const needle = snippet.replace(/\s+/g, " ").trim().slice(0, 48);
	if (needle.length === 0) return;
	const deadline = Date.now() + 8e3;
	while (Date.now() < deadline) {
		const hit = findSnippetHost(needle);
		if (hit !== void 0) {
			hit.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
			hit.setAttribute("data-sticky-flash", "");
			window.setTimeout(() => {
				hit.removeAttribute("data-sticky-flash");
			}, 2400);
			return;
		}
		await new Promise((resolve) => {
			window.setTimeout(resolve, 250);
		});
	}
}
function findSnippetHost(needle) {
	let best;
	for (const el of document.querySelectorAll("p, li, pre, code, span, div")) {
		if (el.closest("[data-sticky-overlay]") !== null) continue;
		if (!(el.textContent ?? "").replace(/\s+/g, " ").includes(needle)) continue;
		if (best === void 0 || best.contains(el)) best = el;
	}
	return best;
}
function QuickCapture(props) {
	const { t, useWall, source } = props;
	const wall = useWall((snapshot) => snapshot);
	const [open, setOpen] = (0, react.useState)(false);
	const [draft, setDraft] = (0, react.useState)("");
	const [color, setColor] = (0, react.useState)("yellow");
	const [folderId, setFolderId] = (0, react.useState)("");
	const [candidate, setCandidate] = (0, react.useState)(null);
	const [toast, setToast] = (0, react.useState)(null);
	const [pendingImages, setPendingImages] = (0, react.useState)([]);
	const inputRef = (0, react.useRef)(null);
	const toastTimer = (0, react.useRef)(0);
	function showToast(line) {
		setToast(line);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => {
			setToast(null);
		}, 2e3);
	}
	(0, react.useEffect)(() => {
		function onKey(e) {
			if (isQuickToggle(e)) {
				e.preventDefault();
				setOpen((v) => !v);
			}
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
		};
	}, []);
	(0, react.useEffect)(() => {
		if (open) inputRef.current?.focus();
	}, [open]);
	(0, react.useEffect)(() => {
		function onSelect() {
			const selection = window.getSelection();
			if (selection === null || selection.isCollapsed || selection.rangeCount === 0) {
				setCandidate(null);
				return;
			}
			const anchor = selection.anchorNode;
			if (anchor === null || inUserAuthoredText(anchor)) {
				setCandidate(null);
				return;
			}
			const text = selection.toString().trim();
			if (text.length < 2) {
				setCandidate(null);
				return;
			}
			const rect = selection.getRangeAt(0).getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) {
				setCandidate(null);
				return;
			}
			setCandidate({
				text,
				turn: turnAt(anchor),
				x: rect.left + rect.width / 2,
				y: rect.bottom + 8
			});
		}
		document.addEventListener("mouseup", onSelect);
		document.addEventListener("keyup", onSelect);
		return () => {
			document.removeEventListener("mouseup", onSelect);
			document.removeEventListener("keyup", onSelect);
		};
	}, []);
	function captureSelection() {
		if (candidate === null) return;
		const sessionId = currentStickySessionId();
		source.createNote(candidate.text, {
			color,
			origin: {
				sessionId,
				turn: candidate.turn,
				snippet: candidate.text
			}
		});
		window.getSelection()?.removeAllRanges();
		setCandidate(null);
		showToast(t("captured"));
	}
	function submitQuick() {
		const text = draft.trim();
		if (text.length === 0 && pendingImages.length === 0) return;
		const sessionId = currentStickySessionId();
		const options = { color };
		if (folderId !== "") options.folderId = folderId;
		if (sessionId !== "") options.origin = {
			sessionId,
			turn: null,
			snippet: text.slice(0, 120)
		};
		source.createNote(text.length === 0 ? "🖼" : text, options);
		if (pendingImages.length > 0) {
			const ids = pendingImages.map((entry) => entry.id);
			window.setTimeout(() => {
				const newest = [...source.getSnapshot().notes].filter((n) => n.deletedAt === null).sort((a, b) => b.createdAt - a.createdAt)[0];
				if (newest !== void 0) source.attachImages(newest.id, ids);
			}, 600);
		}
		setDraft("");
		setPendingImages([]);
		showToast(t("captured"));
		inputRef.current?.focus();
	}
	async function handlePaste(e) {
		const files = clipboardImageFiles(e);
		if (files.length === 0) return;
		e.preventDefault();
		for (const file of files) {
			const dataUrl = await readImageFile(file);
			const id = await source.saveImage(dataUrl);
			if (id !== void 0) setPendingImages((prev) => [...prev, {
				id,
				dataUrl
			}]);
		}
	}
	if (!open && candidate === null && toast === null) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: css$1.root,
		"data-sticky-overlay": true,
		children: [
			open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(css$1.quick, css$1.quickOpen),
				"data-color": color,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css$1.quickHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: css$1.quickTitle,
							children: [" ✏️ ", t("quickTitle")]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("cancel"),
							side: "bottom",
							portal: true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: css$1.quickClose,
								onClick: () => {
									setOpen(false);
								},
								children: "✕"
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						ref: inputRef,
						className: css$1.quickArea,
						value: draft,
						placeholder: t("quickPlaceholder"),
						rows: 3,
						onChange: (e) => {
							setDraft(e.target.value);
						},
						onPaste: (e) => {
							handlePaste(e);
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
								e.preventDefault();
								submitQuick();
							}
						}
					}),
					pendingImages.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css$1.pasteStrip,
						children: pendingImages.map((img) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: css$1.pasteThumb,
							src: img.dataUrl,
							alt: ""
						}, img.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css$1.quickFoot,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css$1.dots,
							children: STICKY_COLORS.map((c, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("colorNames").split("|")[i] ?? c,
								side: "bottom",
								portal: true,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: clsx(css$1.dot, color === c && css$1.dotActive),
									"data-color": c,
									onClick: () => {
										setColor(c);
									}
								})
							}, c))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: css$1.select,
							value: folderId,
							onChange: (e) => {
								setFolderId(e.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
								value: "",
								children: [
									wall.folders.find((f) => f.builtin === true)?.emoji ?? "🗂️",
									" ",
									wall.folders.find((f) => f.builtin === true)?.name ?? "…"
								]
							}), wall.folders.filter((f) => f.builtin !== true).map((f) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
								value: f.id,
								children: [
									f.emoji,
									" ",
									f.name
								]
							}, f.id))]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css$1.quickHint,
						children: t("quickHint")
					})
				]
			}),
			candidate !== null && !open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: css$1.pill,
				style: {
					left: candidate.x,
					top: candidate.y
				},
				onMouseDown: (e) => {
					e.preventDefault();
				},
				onClick: captureSelection,
				children: t("capturePill")
			}),
			toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: css$1.toast,
				children: toast
			})
		]
	});
}
let stickySessionId = "";
function setStickySessionId(sessionId) {
	stickySessionId = sessionId;
}
function currentStickySessionId() {
	return stickySessionId;
}
function makeJump(openSession) {
	return (note) => {
		if (note.origin === null) return;
		openSession(note.origin.sessionId);
		scrollToSnippet(note.origin.snippet);
	};
}
// node_modules/.prebuild/client/StickyPanelIcon.mjs
function StickyPanelIcon({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M5 4.5A2.5 2.5 0 0 1 7.5 2h9A2.5 2.5 0 0 1 19 4.5v9.8a2.5 2.5 0 0 1-.733 1.768l-4.2 4.2a2.5 2.5 0 0 1-1.767.732H7.5A2.5 2.5 0 0 1 5 18.5v-14Z",
				fill: "currentColor",
				opacity: "0.22"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M5 4.5A2.5 2.5 0 0 1 7.5 2h9A2.5 2.5 0 0 1 19 4.5v9.8a2.5 2.5 0 0 1-.733 1.768l-4.2 4.2a2.5 2.5 0 0 1-1.767.732H7.5A2.5 2.5 0 0 1 5 18.5v-14Z",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M13.5 21v-3.5a2 2 0 0 1 2-2H19",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M8.5 7.5h7M8.5 11h5",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			})
		]
	});
}
// node_modules/.prebuild/client/SyncControl.mjs
function SyncControl({ sync }) {
	const status = (0, react.useSyncExternalStore)(sync.subscribe, sync.getSnapshot, sync.getSnapshot);
	const [open, setOpen] = (0, react.useState)(false);
	const [email, setEmail] = (0, react.useState)("");
	const [password, setPassword] = (0, react.useState)("");
	const [message, setMessage] = (0, react.useState)("");
	const [pending, setPending] = (0, react.useState)(false);
	const submit = async (register) => {
		setPending(true);
		setMessage("");
		try {
			if (register) {
				const signedIn = await sync.signUp(email.trim(), password);
				setMessage(signedIn ? "注册并登录成功" : "请先查收邮件并完成验证，然后返回这里登录。");
			} else {
				await sync.signIn(email.trim(), password);
				setMessage("登录成功");
			}
			setPassword("");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "登录失败");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
		size: "sm",
		onClick: () => {
			setOpen(true);
		},
		children: ["☁ ", status.text]
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open,
		onClose: () => {
			setOpen(false);
			setPassword("");
		},
		title: "便签云同步",
		closeLabel: "关闭",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "grid",
				gap: 12,
				minWidth: 300
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [status.text, status.email ? ` \xB7 ${status.email}` : ""] }),
				status.state === "signed-out" || !status.email ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: "创建一个便签同步账号，两台电脑使用同一个账号登录。" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
						value: email,
						type: "email",
						placeholder: "邮箱",
						onChange: (event) => {
							setEmail(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
						value: password,
						type: "password",
						placeholder: "密码",
						onChange: (event) => {
							setPassword(event.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							disabled: pending || !email || !password,
							onClick: () => {
								submit(false);
							},
							children: "登录"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							disabled: pending || !email || !password,
							onClick: () => {
								submit(true);
							},
							children: "注册账号"
						})]
					})
				] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: () => {
						sync.signOut();
						setMessage("已退出登录");
					},
					children: "退出登录"
				}),
				message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					role: "status",
					children: message
				})
			]
		})
	})] });
}
// node_modules/.prebuild/client/StickyWallPage.styles.mjs
const css = {
	"act": "sw-stickywallpage-act",
	"actOn": "sw-stickywallpage-actOn",
	"card": "sw-stickywallpage-card",
	"cardActions": "sw-stickywallpage-cardActions",
	"cardMenu": "sw-stickywallpage-cardMenu",
	"cardMeta": "sw-stickywallpage-cardMeta",
	"cardSlot": "sw-stickywallpage-cardSlot",
	"count": "sw-stickywallpage-count",
	"dot": "sw-stickywallpage-dot",
	"dotActive": "sw-stickywallpage-dotActive",
	"dots": "sw-stickywallpage-dots",
	"editArea": "sw-stickywallpage-editArea",
	"editContent": "sw-stickywallpage-editContent",
	"editDialog": "sw-stickywallpage-editDialog",
	"editHead": "sw-stickywallpage-editHead",
	"editMeta": "sw-stickywallpage-editMeta",
	"editModal": "sw-stickywallpage-editModal",
	"editModalArea": "sw-stickywallpage-editModalArea",
	"editPreview": "sw-stickywallpage-editPreview",
	"editTab": "sw-stickywallpage-editTab",
	"editTabActive": "sw-stickywallpage-editTabActive",
	"editTabs": "sw-stickywallpage-editTabs",
	"emojiInput": "sw-stickywallpage-emojiInput",
	"empty": "sw-stickywallpage-empty",
	"errorBanner": "sw-stickywallpage-errorBanner",
	"folderChip": "sw-stickywallpage-folderChip",
	"folderForm": "sw-stickywallpage-folderForm",
	"folderFormRow": "sw-stickywallpage-folderFormRow",
	"folderSelect": "sw-stickywallpage-folderSelect",
	"formButtons": "sw-stickywallpage-formButtons",
	"formError": "sw-stickywallpage-formError",
	"grid": "sw-stickywallpage-grid",
	"list": "sw-stickywallpage-list",
	"loading": "sw-stickywallpage-loading",
	"menuDanger": "sw-stickywallpage-menuDanger",
	"menuItem": "sw-stickywallpage-menuItem",
	"menuMask": "sw-stickywallpage-menuMask",
	"moveList": "sw-stickywallpage-moveList",
	"moveRow": "sw-stickywallpage-moveRow",
	"originLink": "sw-stickywallpage-originLink",
	"page": "sw-stickywallpage-page",
	"pill": "sw-stickywallpage-pill",
	"pillActive": "sw-stickywallpage-pillActive",
	"pillAdd": "sw-stickywallpage-pillAdd",
	"pillBadge": "sw-stickywallpage-pillBadge",
	"pillDanger": "sw-stickywallpage-pillDanger",
	"pills": "sw-stickywallpage-pills",
	"pin": "sw-stickywallpage-pin",
	"pinnedCard": "sw-stickywallpage-pinnedCard",
	"previewEmpty": "sw-stickywallpage-previewEmpty",
	"recolorRow": "sw-stickywallpage-recolorRow",
	"retryBtn": "sw-stickywallpage-retryBtn",
	"row": "sw-stickywallpage-row",
	"rowActions": "sw-stickywallpage-rowActions",
	"rowBar": "sw-stickywallpage-rowBar",
	"rowBody": "sw-stickywallpage-rowBody",
	"rowEmoji": "sw-stickywallpage-rowEmoji",
	"rowPin": "sw-stickywallpage-rowPin",
	"rowTags": "sw-stickywallpage-rowTags",
	"rowTask": "sw-stickywallpage-rowTask",
	"rowText": "sw-stickywallpage-rowText",
	"rowTextStruck": "sw-stickywallpage-rowTextStruck",
	"rowThumb": "sw-stickywallpage-rowThumb",
	"search": "sw-stickywallpage-search",
	"searchClear": "sw-stickywallpage-searchClear",
	"searchIcon": "sw-stickywallpage-searchIcon",
	"searchWrap": "sw-stickywallpage-searchWrap",
	"snapKind": "sw-stickywallpage-snapKind",
	"snapList": "sw-stickywallpage-snapList",
	"snapRow": "sw-stickywallpage-snapRow",
	"snapTime": "sw-stickywallpage-snapTime",
	"spacer": "sw-stickywallpage-spacer",
	"srOnly": "sw-stickywallpage-srOnly",
	"stamp": "sw-stickywallpage-stamp",
	"struckCard": "sw-stickywallpage-struckCard",
	"textBody": "sw-stickywallpage-textBody",
	"toolBtn": "sw-stickywallpage-toolBtn",
	"toolbar": "sw-stickywallpage-toolbar",
	"toolbarButtons": "sw-stickywallpage-toolbarButtons",
	"viewBtn": "sw-stickywallpage-viewBtn",
	"viewBtnActive": "sw-stickywallpage-viewBtnActive",
	"viewToggle": "sw-stickywallpage-viewToggle"
};
const cssText = `/* Sticky wall: candy-colored, rounded, playful but organized. */

.sw-stickywallpage-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 18px 20px 24px;
  overflow-y: auto;
}

/* ---------- error banner ---------- */

.sw-stickywallpage-errorBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, #ffe2e2 82%, #fff);
  border: 1.5px solid color-mix(in srgb, #e05555 45%, transparent);
  color: #a03434;
  font-size: 12.5px;
}

.sw-stickywallpage-retryBtn {
  flex: none;
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: #e05555;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* ---------- toolbar ---------- */

.sw-stickywallpage-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.sw-stickywallpage-searchWrap {
  position: relative;
  flex: 1;
  min-width: 160px;
  display: flex;
  align-items: center;
}

.sw-stickywallpage-searchIcon {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  opacity: 0.5;
  pointer-events: none;
}

.sw-stickywallpage-search {
  width: 100%;
  padding-left: 32px;
  padding-right: 28px;
  border-radius: 999px;
  color: inherit;
}

.sw-stickywallpage-search::placeholder {
  color: currentColor;
  opacity: 0.65;
}

.sw-stickywallpage-searchClear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  opacity: 0.55;
}

.sw-stickywallpage-searchClear:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.sw-stickywallpage-toolbarButtons {
  display: flex;
  gap: 6px;
}

/* ---------- view toggle ---------- */

.sw-stickywallpage-viewToggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-stickywallpage-viewBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  opacity: 0.75;
  transition: all 0.15s ease;
}

.sw-stickywallpage-viewBtn:hover {
  opacity: 0.85;
}

.sw-stickywallpage-viewBtnActive {
  background: #f2f2f2;
  color: #26282c;
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-stickywallpage-toolBtn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, currentColor 32%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  color: inherit;
  font-size: 13px;
  opacity: 0.86;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sw-stickywallpage-toolBtn:hover {
  opacity: 1;
  border-color: color-mix(in srgb, currentColor 55%, transparent);
  transform: translateY(-1px);
}

/* ---------- folder select ---------- */

.sw-stickywallpage-folderSelect {
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  color-scheme: light;
  font-size: 12px;
  cursor: pointer;
}

/* Native select popups can stay light even when the app uses a dark theme. */
.sw-stickywallpage-folderSelect option {
  color: #202329;
  background: #fff;
}

/* ---------- palette dots ---------- */

.sw-stickywallpage-dots {
  display: flex;
  gap: 5px;
}

.sw-stickywallpage-dot {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sw-stickywallpage-dot:hover {
  transform: scale(1.25);
}

.sw-stickywallpage-dotActive {
  box-shadow:
    0 0 0 2px var(--dsw-alias-bg-elevated, #fff),
    0 0 0 4px color-mix(in srgb, currentColor 70%, transparent);
}

.sw-stickywallpage-dot[data-color='yellow'] { background: #ffdb4d; color: #e6a800; }
.sw-stickywallpage-dot[data-color='pink'] { background: #ff8fbe; color: #ef4f86; }
.sw-stickywallpage-dot[data-color='mint'] { background: #4ee39a; color: #17a06a; }
.sw-stickywallpage-dot[data-color='blue'] { background: #66bfff; color: #2f8fdc; }
.sw-stickywallpage-dot[data-color='purple'] { background: #b48cff; color: #8349e6; }
.sw-stickywallpage-dot[data-color='orange'] { background: #ffab52; color: #dd7a15; }

.sw-stickywallpage-srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---------- folder pills ---------- */

.sw-stickywallpage-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.sw-stickywallpage-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sw-stickywallpage-pill:hover {
  transform: translateY(-1px);
}

.sw-stickywallpage-pillActive {
  background: var(--pill-color, #e8e9eb);
  border-color: color-mix(in srgb, var(--pill-color, #e8e9eb) 80%, transparent);
  font-weight: 600;
}

.sw-stickywallpage-pill[data-color='yellow'] { --pill-color: #ffdb4d; }
.sw-stickywallpage-pill[data-color='pink'] { --pill-color: #ff8fbe; }
.sw-stickywallpage-pill[data-color='mint'] { --pill-color: #4ee39a; }
.sw-stickywallpage-pill[data-color='blue'] { --pill-color: #66bfff; }
.sw-stickywallpage-pill[data-color='purple'] { --pill-color: #b48cff; }
.sw-stickywallpage-pill[data-color='orange'] { --pill-color: #ffab52; }

.sw-stickywallpage-pillActive,
.sw-stickywallpage-pill[data-color].sw-stickywallpage-pillActive {
  color: #2b2320;
}

.sw-stickywallpage-pillAdd {
  padding: 0 9px;
}

.sw-stickywallpage-pillBadge {
  box-shadow: 0 0 0 2px color-mix(in srgb, #ff7a7a 55%, transparent);
}

.sw-stickywallpage-pillDanger {
  color: #e05555;
  border-color: color-mix(in srgb, #e05555 45%, transparent);
}

/* Count: quiet tabular numeral, no chip background \u2014 the old translucent
   dark pill read as a dirty shadow on the light capsules. */
.sw-stickywallpage-count {
  min-width: 14px;
  padding: 0 1px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
  opacity: 0.55;
}

.sw-stickywallpage-pillActive .sw-stickywallpage-count {
  opacity: 0.75;
}

/* ---------- note grid & cards ---------- */

/* Fill the available width before wrapping to another row. */
.sw-stickywallpage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(210px, 100%), 1fr));
  align-items: start;
  gap: 14px;
  padding-bottom: 30px;
}

/* Leave room for the tape above each card without letting it overlap a row. */
.sw-stickywallpage-cardSlot {
  padding-top: 7px;
  min-width: 0;
}

.sw-stickywallpage-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  margin: 0;
  padding: 14px 13px 10px;
  border-radius: 16px;
  background: var(--card-color, #ffdb4d);
  color: #33291f;
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--card-color, #ffd94d) 45%, rgb(0 0 0 / 14%)),
    0 1px 3px rgb(0 0 0 / 10%);
  transform: rotate(var(--tilt, 0deg));
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  animation: stick-drop 0.32s cubic-bezier(0.2, 1.4, 0.5, 1) both;
  animation-delay: var(--drop, 0ms);
  overflow: visible;
}

.sw-stickywallpage-card::before {
  /* washi tape strip */
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  width: 46px;
  height: 15px;
  background: rgb(255 255 255 / 45%);
  border-radius: 3px;
  transform: translateX(-50%) rotate(calc(var(--tilt, 0deg) * -1.6));
  backdrop-filter: blur(1px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

.sw-stickywallpage-card:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.02);
  box-shadow:
    0 12px 26px color-mix(in srgb, var(--card-color, #ffd94d) 55%, rgb(0 0 0 / 18%)),
    0 2px 6px rgb(0 0 0 / 12%);
  z-index: 3;
}

.sw-stickywallpage-card[data-color='yellow'] { --card-color: #ffdb4d; }
.sw-stickywallpage-card[data-color='pink'] { --card-color: #ff8fbe; }
.sw-stickywallpage-card[data-color='mint'] { --card-color: #4ee39a; }
.sw-stickywallpage-card[data-color='blue'] { --card-color: #66bfff; }
.sw-stickywallpage-card[data-color='purple'] { --card-color: #b48cff; }
.sw-stickywallpage-card[data-color='orange'] { --card-color: #ffab52; }

.sw-stickywallpage-pinnedCard {
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--card-color, #ffd94d) 45%, rgb(0 0 0 / 14%)),
    0 0 0 2px color-mix(in srgb, var(--card-color, #ffd94d) 80%, #fff);
}

.sw-stickywallpage-pin {
  position: absolute;
  top: -10px;
  right: 10px;
  font-size: 17px;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 25%));
  transform: rotate(12deg);
  z-index: 2;
}

.sw-stickywallpage-struckCard .sw-stickywallpage-textBody {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgb(0 0 0 / 35%);
  opacity: 0.55;
}

.sw-stickywallpage-textBody {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: default;
}

.sw-stickywallpage-editArea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  background: rgb(255 255 255 / 45%);
  border-radius: 10px;
  padding: 7px 9px;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
}

.sw-stickywallpage-cardMeta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sw-stickywallpage-folderChip {
  padding: 1.5px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.sw-stickywallpage-originLink {
  border: none;
  background: rgb(255 255 255 / 40%);
  padding: 1.5px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.sw-stickywallpage-originLink:hover {
  background: rgb(255 255 255 / 80%);
}

.sw-stickywallpage-stamp {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.55;
}

.sw-stickywallpage-cardActions {
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-stickywallpage-card:hover .sw-stickywallpage-cardActions,
.sw-stickywallpage-card:focus-within .sw-stickywallpage-cardActions {
  opacity: 1;
}

.sw-stickywallpage-act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 5px;
  border: none;
  border-radius: 8px;
  background: rgb(255 255 255 / 40%);
  font-size: 12px;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.sw-stickywallpage-act:hover {
  background: rgb(255 255 255 / 85%);
  transform: scale(1.08);
}

.sw-stickywallpage-actOn {
  background: rgb(255 255 255 / 95%);
  box-shadow: inset 0 0 0 1.5px rgb(0 0 0 / 20%);
}

/* ---------- list view ---------- */

.sw-stickywallpage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 30px;
}

.sw-stickywallpage-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px 9px 16px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-elevated, #fff) 96%, var(--row-color, #ffd94d));
  border: 1px solid color-mix(in srgb, var(--row-color, #ffd94d) 30%, transparent);
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease;
  animation: row-in 0.22s ease both;
}

.sw-stickywallpage-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px color-mix(in srgb, var(--row-color, #ffd94d) 30%, rgb(0 0 0 / 8%));
}

.sw-stickywallpage-row[data-color='yellow'] { --row-color: #ffdb4d; }
.sw-stickywallpage-row[data-color='pink'] { --row-color: #ff8fbe; }
.sw-stickywallpage-row[data-color='mint'] { --row-color: #4ee39a; }
.sw-stickywallpage-row[data-color='blue'] { --row-color: #66bfff; }
.sw-stickywallpage-row[data-color='purple'] { --row-color: #b48cff; }
.sw-stickywallpage-row[data-color='orange'] { --row-color: #ffab52; }

.sw-stickywallpage-rowBar {
  position: absolute;
  left: 5px;
  top: 7px;
  bottom: 7px;
  width: 4px;
  border-radius: 999px;
  background: var(--row-color, #ffd94d);
}

.sw-stickywallpage-rowPin {
  font-size: 13px;
  transform: rotate(12deg);
}

.sw-stickywallpage-rowEmoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--row-color, #ffd94d) 30%, transparent);
  font-size: 14px;
  flex: none;
}

.sw-stickywallpage-rowThumb {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  object-fit: cover;
  flex: none;
}

.sw-stickywallpage-rowBody {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.sw-stickywallpage-rowText {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-stickywallpage-rowTextStruck {
  text-decoration: line-through;
  opacity: 0.55;
}

.sw-stickywallpage-rowTags {
  display: inline-flex;
  gap: 6px;
  flex: none;
  font-size: 10.5px;
  opacity: 0.75;
}

.sw-stickywallpage-rowTask {
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--row-color, #ffd94d) 22%, transparent);
  white-space: nowrap;
}

.sw-stickywallpage-rowActions {
  display: inline-flex;
  gap: 3px;
  flex: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-stickywallpage-row:hover .sw-stickywallpage-rowActions {
  opacity: 1;
}

@keyframes row-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- edit modal ---------- */

/* Applied through Modal's \`className\`: widen the dialog itself (the shipped
   default is 380px) and let the body fill it. */
.sw-stickywallpage-editDialog {
  width: min(640px, calc(100vw - 48px));
}

/* Applied through Modal's \`contentClassName\`: the body block's default
   margin-top (20px) plus the header's own bottom padding reads as a hole
   under the title; collapse it so the toolbar sits close under the header. */
.sw-stickywallpage-editContent > :last-child {
  margin-top: 0;
}

.sw-stickywallpage-editModal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.sw-stickywallpage-editHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-stickywallpage-editTabs {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-stickywallpage-editTab {
  height: 24px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.55;
}

.sw-stickywallpage-editTabActive {
  background: #f2f2f2;
  color: #26282c;
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-stickywallpage-viewBtn:focus-visible,
.sw-stickywallpage-toolBtn:focus-visible,
.sw-stickywallpage-pill:focus-visible,
.sw-stickywallpage-editTab:focus-visible,
.sw-stickywallpage-folderSelect:focus-visible {
  outline: 2px solid #668fff;
  outline-offset: 2px;
}

.sw-stickywallpage-editModalArea {
  min-height: 240px;
  padding: 12px 14px;
  border: 1.5px solid color-mix(in srgb, var(--edit-color, #ffd94d) 45%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--edit-color, #ffd94d) 7%, transparent);
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.sw-stickywallpage-editModalArea[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-stickywallpage-editModalArea[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-stickywallpage-editModalArea[data-color='mint'] { --edit-color: #4ee39a; }
.sw-stickywallpage-editModalArea[data-color='blue'] { --edit-color: #66bfff; }
.sw-stickywallpage-editModalArea[data-color='purple'] { --edit-color: #b48cff; }
.sw-stickywallpage-editModalArea[data-color='orange'] { --edit-color: #ffab52; }

.sw-stickywallpage-editModalArea:focus {
  border-color: var(--edit-color, #ffd94d);
}

.sw-stickywallpage-editPreview {
  min-height: 240px;
  max-height: 46vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--edit-color, #ffd94d);
  color: #33291f;
  min-width: 0;
}

.sw-stickywallpage-editPreview[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-stickywallpage-editPreview[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-stickywallpage-editPreview[data-color='mint'] { --edit-color: #4ee39a; }
.sw-stickywallpage-editPreview[data-color='blue'] { --edit-color: #66bfff; }
.sw-stickywallpage-editPreview[data-color='purple'] { --edit-color: #b48cff; }
.sw-stickywallpage-editPreview[data-color='orange'] { --edit-color: #ffab52; }

.sw-stickywallpage-previewEmpty {
  opacity: 0.5;
}

.sw-stickywallpage-editMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-stickywallpage-menuMask {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.sw-stickywallpage-cardMenu {
  position: absolute;
  right: 10px;
  bottom: 34px;
  z-index: 41;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
  padding: 8px;
  border-radius: 14px;
  background: var(--dsw-alias-bg-elevated, #fff);
  box-shadow: 0 10px 28px rgb(0 0 0 / 18%);
  animation: menu-pop 0.16s ease both;
}

.sw-stickywallpage-recolorRow {
  display: flex;
  gap: 5px;
  padding: 2px 4px 6px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  margin-bottom: 2px;
}

.sw-stickywallpage-menuItem {
  border: none;
  background: transparent;
  color: inherit;
  padding: 6px 8px;
  border-radius: 9px;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.sw-stickywallpage-menuItem:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-stickywallpage-menuDanger {
  color: #e05555;
}

/* ---------- empty / loading / misc ---------- */

.sw-stickywallpage-empty {
  grid-column: 1 / -1;
  padding: 44px 0;
  text-align: center;
  font-size: 13.5px;
  opacity: 0.55;
}

.sw-stickywallpage-loading {
  padding: 40px;
  text-align: center;
  opacity: 0.5;
}

.sw-stickywallpage-moveList {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}

.sw-stickywallpage-moveRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}

.sw-stickywallpage-moveRow:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-stickywallpage-snapList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
  max-height: 320px;
  overflow-y: auto;
}

.sw-stickywallpage-snapRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, currentColor 5%, transparent);
}

.sw-stickywallpage-snapKind {
  font-size: 12px;
  font-weight: 600;
}

.sw-stickywallpage-snapTime {
  flex: 1;
  font-size: 11.5px;
  opacity: 0.6;
}

.sw-stickywallpage-folderForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 300px;
}

.sw-stickywallpage-folderFormRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sw-stickywallpage-emojiInput {
  width: 52px;
  height: 34px;
  text-align: center;
  font-size: 17px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  background: transparent;
  color: inherit;
}

.sw-stickywallpage-formError {
  color: #e05555;
  font-size: 12px;
}

.sw-stickywallpage-formButtons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sw-stickywallpage-spacer {
  flex: 1;
}

/* ---------- animations ---------- */

@keyframes stick-drop {
  0% {
    opacity: 0;
    transform: rotate(var(--tilt, 0deg)) translateY(-14px) scale(0.92);
  }
  70% {
    opacity: 1;
    transform: rotate(var(--tilt, 0deg)) translateY(3px) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--tilt, 0deg)) translateY(0) scale(1);
  }
}

@keyframes menu-pop {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---------- dark mode: keep the candy, lift the ink ---------- */

@media (prefers-color-scheme: dark) {
  .sw-stickywallpage-card {
    color: #241d16;
    filter: saturate(1.05) brightness(0.94);
  }

  .sw-stickywallpage-pillActive,
  .sw-stickywallpage-pill[data-color].sw-stickywallpage-pillActive {
    color: #241d16;
  }
}
`;
// node_modules/.prebuild/client/StickyWallPage.mjs
const COLOR_ORDER = STICKY_COLORS;
const VIEW_MODE_KEY = "stickyWall.viewMode";
const FORMAT_BUTTONS = [
	{
		format: "bold",
		label: "B",
		title: "粗体 **文字**",
		glyph: "bold"
	},
	{
		format: "italic",
		label: "I",
		title: "斜体 *文字*",
		glyph: "italic"
	},
	{
		format: "strike",
		label: "S",
		title: "删除线 ~~文字~~",
		glyph: "strike"
	},
	{
		format: "code",
		label: "",
		title: "行内代码 `文字`"
	},
	{
		format: "h2",
		label: "H",
		title: "标题 ## 文字",
		glyph: "heading"
	},
	{
		format: "ul",
		label: "",
		title: "无序列表 - 项目"
	},
	{
		format: "ol",
		label: "",
		title: "有序列表 1. 项目"
	},
	{
		format: "task",
		label: "",
		title: "待办 - [ ] 任务"
	}
];
function OlListGlyph({ size = 14 }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 14 14",
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
				x: "0.4",
				y: "10.8",
				fontSize: "9",
				fontWeight: "700",
				fill: "currentColor",
				children: "1."
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "6.4",
				y1: "3.2",
				x2: "13",
				y2: "3.2",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "6.4",
				y1: "7",
				x2: "13",
				y2: "7",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
				x1: "6.4",
				y1: "10.8",
				x2: "13",
				y2: "10.8",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			})
		]
	});
}
function renderFormatGlyph(btn) {
	if (btn.format === "code") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 });
	if (btn.format === "ul") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFlatListOutlineRegular, { size: 14 });
	if (btn.format === "ol") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OlListGlyph, { size: 14 });
	if (btn.format === "task") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, { size: 14 });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		className: css$2["glyph" + (btn.glyph === "bold" ? "Bold" : btn.glyph === "italic" ? "Italic" : btn.glyph === "strike" ? "Strike" : "Heading")],
		children: btn.label
	});
}
function loadViewMode() {
	try {
		return window.localStorage.getItem(VIEW_MODE_KEY) === "list" ? "list" : "cards";
	} catch {
		return "cards";
	}
}
function Tip(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
		label: props.label,
		side: props.side ?? "top",
		portal: true,
		children: props.children
	});
}
function noteStamp(ms) {
	const d = new Date(ms);
	const pad = (n) => String(n).padStart(2, "0");
	return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function tiltOf(id) {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = hash * 31 + id.charCodeAt(i) | 0;
	return (hash % 7 - 3) * .5;
}
function summaryOf(note) {
	return (note.text.split("\n").find((line) => line.trim().length > 0) ?? "").replace(/^#{1,6}\s+/, "").replace(/^[-*]\s+\[[ xX]\]\s+/, "☑ ").replace(/^[-*]\s+/, "").replace(/^\d+[.、]\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/`(.+?)`/g, "$1").trim() || "🖼";
}
function StickyWallPage(props) {
	const { t, useWall, source, sync, jumpToOrigin } = props;
	const wall = useWall((snapshot) => snapshot);
	const [filter, setFilter] = (0, react.useState)("all");
	const [viewMode, setViewMode] = (0, react.useState)(loadViewMode);
	const [query, setQuery] = (0, react.useState)("");
	const [composeOpen, setComposeOpen] = (0, react.useState)(false);
	const [editTarget, setEditTarget] = (0, react.useState)(null);
	const [folderModal, setFolderModal] = (0, react.useState)(null);
	const [moveTarget, setMoveTarget] = (0, react.useState)(null);
	const [snapshotsOpen, setSnapshotsOpen] = (0, react.useState)(false);
	const [lightbox, setLightbox] = (0, react.useState)(null);
	const [imageUrls, setImageUrls] = (0, react.useState)(/* @__PURE__ */ new Map());
	const folders = wall.folders;
	const colorNames = t("colorNames").split("|");
	(0, react.useEffect)(() => {
		try {
			window.localStorage.setItem(VIEW_MODE_KEY, viewMode);
		} catch {}
	}, [viewMode]);
	(0, react.useEffect)(() => {
		const missing = [...new Set(wall.notes.flatMap((note) => note.images ?? []))].filter((id) => !imageUrls.has(id));
		if (missing.length === 0) return;
		let alive = true;
		for (const id of missing) source.image(id).then((dataUrl) => {
			if (alive && dataUrl !== void 0) setImageUrls((prev) => new Map(prev).set(id, dataUrl));
		});
		return () => {
			alive = false;
		};
	}, [
		wall.notes,
		imageUrls,
		source
	]);
	const visible = (0, react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		const live = wall.notes.filter((note) => note.deletedAt === null);
		const base = filter === "trash" ? wall.notes.filter((note) => note.deletedAt !== null) : filter === "all" ? live : live.filter((note) => note.folderId === filter);
		return [...needle.length === 0 ? base : base.filter((note) => note.text.toLowerCase().includes(needle))].sort((a, b) => {
			if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
			return b.createdAt - a.createdAt;
		});
	}, [
		wall.notes,
		filter,
		query
	]);
	const folderCounts = (0, react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const note of wall.notes) {
			if (note.deletedAt !== null) continue;
			counts.set(note.folderId, (counts.get(note.folderId) ?? 0) + 1);
		}
		return counts;
	}, [wall.notes]);
	const trashCount = wall.notes.filter((note) => note.deletedAt !== null).length;
	const folderById = (id) => folders.find((f) => f.id === id);
	const liveTotal = [...folderCounts.values()].reduce((a, b) => a + b, 0);
	function createNote(text, color, folderId, imageIds) {
		const options = { color };
		if (folderId !== "") options.folderId = folderId;
		source.createNote(text, options);
		if (imageIds.length > 0) window.setTimeout(() => {
			attachToLatest(imageIds);
		}, 600);
	}
	async function attachToLatest(ids) {
		const newest = [...source.getSnapshot().notes].filter((n) => n.deletedAt === null).sort((a, b) => b.createdAt - a.createdAt)[0];
		if (newest !== void 0) source.attachImages(newest.id, ids);
	}
	async function download(format) {
		const exported = await source.exportWall(format);
		if (exported === void 0) return;
		const blob = new Blob([exported.content], { type: format === "json" ? "application/json" : "text/markdown" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = exported.filename;
		anchor.click();
		URL.revokeObjectURL(url);
	}
	function emptyTrash() {
		if (window.confirm(t("emptyTrashConfirm"))) source.emptyTrash();
	}
	const noteActions = {
		togglePin: (note) => {
			source.updateNote(note.id, { pinned: !note.pinned });
		},
		toggleStrike: (note) => {
			source.updateNote(note.id, { struck: !note.struck });
		},
		toggleTask: (note, taskIndex) => {
			source.updateNote(note.id, { text: toggleTask(note.text, taskIndex) });
		},
		remove: (note) => {
			source.deleteNote(note.id);
		},
		restore: (note) => {
			source.restoreNote(note.id);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: css.page,
		children: [
			wall.error !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.errorBanner,
				role: "alert",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
					"⚠️ ",
					t("loadFailed"),
					" · ",
					wall.error
				] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: css.retryBtn,
					onClick: () => {
						source.reload();
					},
					children: ["↻ ", t("retry")]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.toolbar,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SyncControl, { sync }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }),
						onClick: () => {
							setComposeOpen(true);
						},
						children: t("newNote")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.searchWrap,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { className: css.searchIcon }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								...css.search === void 0 ? {} : { className: css.search },
								value: query,
								placeholder: t("searchPlaceholder"),
								onChange: (e) => {
									setQuery(e.target.value);
								}
							}),
							query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: css.searchClear,
								onClick: () => {
									setQuery("");
								},
								"aria-label": "clear",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.viewToggle,
						role: "group",
						"aria-label": "view mode",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
							label: t("viewCards"),
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: clsx(css.viewBtn, viewMode === "cards" && css.viewBtnActive),
								"aria-label": t("viewCards"),
								"aria-pressed": viewMode === "cards",
								onClick: () => {
									setViewMode("cards");
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
									width: "16",
									height: "16",
									viewBox: "0 0 16 16",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.5",
									"aria-hidden": "true",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: "2",
											y: "2",
											width: "5",
											height: "5",
											rx: "1"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: "9",
											y: "2",
											width: "5",
											height: "5",
											rx: "1"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: "2",
											y: "9",
											width: "5",
											height: "5",
											rx: "1"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											x: "9",
											y: "9",
											width: "5",
											height: "5",
											rx: "1"
										})
									]
								})
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
							label: t("viewList"),
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: clsx(css.viewBtn, viewMode === "list" && css.viewBtnActive),
								"aria-label": t("viewList"),
								"aria-pressed": viewMode === "list",
								onClick: () => {
									setViewMode("list");
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
									width: "16",
									height: "16",
									viewBox: "0 0 16 16",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.5",
									strokeLinecap: "round",
									"aria-hidden": "true",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 4h9M5 8h9M5 12h9" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										d: "M2 4h.1M2 8h.1M2 12h.1",
										strokeWidth: "2"
									})]
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.toolbarButtons,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
								label: t("exportMd"),
								side: "bottom",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: css.toolBtn,
									"aria-label": t("exportMd"),
									onClick: () => {
										download("markdown");
									},
									children: "↓ MD"
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
								label: t("exportJson"),
								side: "bottom",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: css.toolBtn,
									"aria-label": t("exportJson"),
									onClick: () => {
										download("json");
									},
									children: "↓ JSON"
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
								label: t("snapshots"),
								side: "bottom",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: css.toolBtn,
									"aria-label": t("snapshots"),
									onClick: () => {
										setSnapshotsOpen(true);
									},
									children: "◷"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.pills,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: clsx(css.pill, filter === "all" && css.pillActive),
						onClick: () => {
							setFilter("all");
						},
						children: [
							"🧁 ",
							t("all"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: css.count,
								children: liveTotal
							})
						]
					}),
					folders.map((folder) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: clsx(css.pill, filter === folder.id && css.pillActive),
						"data-color": folder.color,
						onClick: () => {
							setFilter(folder.id);
						},
						onContextMenu: (e) => {
							e.preventDefault();
							setFolderModal({
								mode: "rename",
								folder
							});
						},
						children: [
							folder.emoji,
							" ",
							folder.name,
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: css.count,
								children: folderCounts.get(folder.id) ?? 0
							})
						]
					}, folder.id)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: t("newFolder"),
						side: "bottom",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.pill, css.pillAdd),
							onClick: () => {
								setFolderModal({ mode: "create" });
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: clsx(css.pill, filter === "trash" && css.pillActive, trashCount > 0 && css.pillBadge),
						onClick: () => {
							setFilter("trash");
						},
						children: [
							"🗑 ",
							t("trash"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: css.count,
								children: trashCount
							})
						]
					}),
					filter === "trash" && trashCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: clsx(css.pill, css.pillDanger),
						onClick: emptyTrash,
						children: t("emptyTrashAction")
					})
				]
			}),
			viewMode === "cards" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.grid,
				children: [visible.map((note, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.cardSlot,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StickyCard, {
						note,
						folder: folderById(note.folderId),
						index,
						inTrash: filter === "trash",
						t,
						colorNames,
						source,
						imageUrls,
						actions: noteActions,
						onEdit: () => {
							setEditTarget(note);
						},
						onMove: () => {
							setMoveTarget(note);
						},
						onJump: () => {
							jumpToOrigin(note);
						},
						onImage: (url) => {
							setLightbox(url);
						}
					})
				}, note.id)), visible.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.empty,
					children: filter === "trash" ? t("emptyTrash") : query !== "" ? t("noNotesMatch") : t("emptyWall")
				})]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.list,
				children: [visible.map((note) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StickyRow, {
					note,
					folder: folderById(note.folderId),
					inTrash: filter === "trash",
					t,
					source,
					imageUrls,
					actions: noteActions,
					onEdit: () => {
						setEditTarget(note);
					},
					onJump: () => {
						jumpToOrigin(note);
					},
					onImage: (url) => {
						setLightbox(url);
					}
				}, note.id)), visible.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.empty,
					children: filter === "trash" ? t("emptyTrash") : query !== "" ? t("noNotesMatch") : t("emptyWall")
				})]
			}),
			lightbox !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: css$2.lightbox,
				onClick: () => {
					setLightbox(null);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					src: lightbox,
					alt: ""
				})
			}),
			composeOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StickyEditModal, {
				mode: "create",
				note: null,
				folders,
				imageUrls,
				t,
				onCancel: () => {
					setComposeOpen(false);
				},
				onCreate: (text, color, folderId, imageIds) => {
					createNote(text, color, folderId, imageIds);
					setComposeOpen(false);
				},
				onSave: () => {},
				onDelete: () => {},
				onRestore: () => {},
				onMoveFolder: () => {},
				storeImage: (dataUrl) => source.saveImage(dataUrl),
				inTrash: false
			}),
			editTarget !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StickyEditModal, {
				mode: "edit",
				note: editTarget,
				folders,
				imageUrls,
				t,
				onCancel: () => {
					setEditTarget(null);
				},
				onCreate: () => {},
				onSave: (patch) => {
					source.updateNote(editTarget.id, patch);
					setEditTarget(null);
				},
				onDelete: () => {
					source.deleteNote(editTarget.id);
					setEditTarget(null);
				},
				onRestore: () => {
					source.restoreNote(editTarget.id);
					setEditTarget(null);
				},
				onMoveFolder: (folderId) => {
					source.moveNote(editTarget.id, folderId);
				},
				onPasteImage: (dataUrl) => {
					(async () => {
						const id = await source.saveImage(dataUrl);
						if (id !== void 0) source.attachImages(editTarget.id, [id]);
					})();
				},
				inTrash: editTarget.deletedAt !== null
			}, editTarget.id),
			folderModal !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderModal, {
				mode: folderModal,
				t,
				existing: folders,
				onCancel: () => {
					setFolderModal(null);
				},
				onSubmit: (name, emoji, color) => {
					if (folderModal.mode === "create") source.createFolder(name, emoji === void 0 ? void 0 : emoji, color);
					else {
						const patch = { name };
						if (emoji !== void 0) patch.emoji = emoji;
						if (color !== void 0) patch.color = color;
						source.updateFolder(folderModal.folder.id, patch);
					}
					setFolderModal(null);
				},
				onDelete: folderModal.mode === "rename" && !folderModal.folder.builtin ? () => {
					if (window.confirm(t("deleteFolderConfirm"))) {
						source.deleteFolder(folderModal.folder.id);
						if (filter === folderModal.folder.id) setFilter("all");
						setFolderModal(null);
					}
				} : void 0
			}),
			moveTarget !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: () => {
					setMoveTarget(null);
				},
				title: t("moveTo"),
				closeLabel: t("cancel"),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.moveList,
					children: folders.filter((f) => f.id !== moveTarget.folderId).map((folder) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: css.moveRow,
						onClick: () => {
							source.moveNote(moveTarget.id, folder.id);
							setMoveTarget(null);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							folder.emoji,
							" ",
							folder.name
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: css.count,
							children: folderCounts.get(folder.id) ?? 0
						})]
					}, folder.id))
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: snapshotsOpen,
				onClose: () => {
					setSnapshotsOpen(false);
				},
				title: t("snapshots"),
				closeLabel: t("cancel"),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.snapList,
					children: [wall.snapshots.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css.empty,
						children: "—"
					}), wall.snapshots.map((snap) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.snapRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: css.snapKind,
								children: snap.kind === "daily" ? `\u{1F319} ${t("snapshotDaily")}` : `\u{1F570} ${t("snapshotRecent")}`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.snapTime,
								children: [
									noteStamp(snap.savedAt),
									" · ",
									snap.notes,
									" 📝"
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								onClick: () => {
									source.restoreSnapshot(snap.id);
									setSnapshotsOpen(false);
								},
								children: t("restoreSnapshot")
							})
						]
					}, snap.id))]
				})
			})
		]
	});
}
function StickyCard(props) {
	const { note, folder, index, inTrash, t, colorNames, source, imageUrls, actions, onEdit, onMove, onJump, onImage } = props;
	const [menuOpen, setMenuOpen] = (0, react.useState)(false);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
		className: clsx(css.card, note.pinned && css.pinnedCard, note.struck && css.struckCard),
		"data-color": note.color,
		style: {
			"--tilt": `${tiltOf(note.id)}deg`,
			"--drop": `${Math.min(index, 6) * 30}ms`
		},
		children: [
			note.pinned && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.pin,
				children: "📌"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.textBody,
				onClick: (e) => {
					if (!(e.target instanceof HTMLElement) || !e.target.closest("[data-todo]")) onEdit();
				},
				children: [inTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteMarkdown, { text: note.text }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteMarkdown, {
					text: note.text,
					onToggleTask: (taskIndex) => {
						actions.toggleTask(note, taskIndex);
					}
				}), note.images.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css$2.imgStrip,
					children: note.images.map((id) => {
						const url = imageUrls.get(id);
						return url === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: css$2.thumbPending,
							children: "🖼"
						}, id) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: css$2.thumb,
							src: url,
							alt: "",
							onClick: (e) => {
								e.stopPropagation();
								onImage(url);
							}
						}, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.cardMeta,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: css.folderChip,
						"data-color": folder?.color ?? "blue",
						children: folder ? `${folder.emoji} ${folder.name}` : "?"
					}),
					note.origin !== null && !inTrash && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: note.origin.snippet,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: css.originLink,
							onClick: (e) => {
								e.stopPropagation();
								onJump();
							},
							children: ["↩ ", t("backToSession")]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: css.stamp,
						children: [
							t("createdAt"),
							noteStamp(note.createdAt),
							note.updatedAt > note.createdAt + 6e4 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								" · ",
								t("editedAt"),
								noteStamp(note.updatedAt)
							] })
						]
					})
				]
			}),
			inTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: css.cardActions,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: css.act,
					onClick: () => {
						actions.restore(note);
					},
					children: ["↩ ", t("restore")]
				})
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.cardActions,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: note.pinned ? t("unpin") : t("pin"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.act, note.pinned && css.actOn),
							onClick: () => {
								actions.togglePin(note);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPinOutlineRegular, { size: 14 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: note.struck ? t("unstrike") : t("strike"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.act, note.struck && css.actOn),
							onClick: () => {
								actions.toggleStrike(note);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: t("moveTo"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: css.act,
							onClick: onMove,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, { size: 14 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: t("moreActions"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: css.act,
							onClick: () => {
								setMenuOpen((v) => !v);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, { size: 14 })
						})
					})
				]
			}),
			menuOpen && !inTrash && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: css.menuMask,
				onClick: () => {
					setMenuOpen(false);
				}
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.cardMenu,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css.recolorRow,
						children: COLOR_ORDER.map((color, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.dot, note.color === color && css.dotActive),
							"data-color": color,
							title: colorNames[i] ?? color,
							onClick: () => {
								source.updateNote(note.id, { color });
								setMenuOpen(false);
							}
						}, color))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: css.menuItem,
						onClick: () => {
							setMenuOpen(false);
							onEdit();
						},
						children: ["✏️ ", t("edit")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: clsx(css.menuItem, css.menuDanger),
						onClick: () => {
							setMenuOpen(false);
							actions.remove(note);
						},
						children: ["🗑 ", t("deleteNote")]
					})
				]
			})] })
		]
	});
}
function StickyRow(props) {
	const { note, folder, inTrash, t, imageUrls, actions, onEdit, onJump, onImage } = props;
	const firstImage = note.images.length > 0 ? imageUrls.get(note.images[0]) : void 0;
	const taskTotal = (note.text.match(/^[-*]\s+\[[ xX]\]/gm) ?? []).length;
	const taskDone = (note.text.match(/^[-*]\s+\[[xX]\]/gm) ?? []).length;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: clsx(css.row, note.pinned && css.rowPinned, note.struck && css.rowStruck),
		"data-color": note.color,
		onClick: onEdit,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.rowBar,
				"data-color": note.color
			}),
			note.pinned && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.rowPin,
				children: "📌"
			}),
			firstImage !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className: css.rowThumb,
				src: firstImage,
				alt: "",
				onClick: (e) => {
					e.stopPropagation();
					onImage(firstImage);
				}
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.rowEmoji,
				"data-color": note.color,
				children: "📝"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: css.rowBody,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: clsx(css.rowText, note.struck && css.rowTextStruck),
					children: summaryOf(note)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.rowTags,
					children: [
						taskTotal > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: css.rowTask,
							children: [
								"☑ ",
								taskDone,
								"/",
								taskTotal
							]
						}),
						note.images.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: css.rowTask,
							children: ["🖼 ×", note.images.length]
						}),
						note.origin !== null && !inTrash && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: css.originLink,
							onClick: (e) => {
								e.stopPropagation();
								onJump();
							},
							title: note.origin.snippet,
							children: "↩"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.folderChip,
				"data-color": folder?.color ?? "blue",
				children: folder ? `${folder.emoji} ${folder.name}` : "?"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: css.stamp,
				children: [
					t("createdAt"),
					noteStamp(note.createdAt),
					note.updatedAt > note.createdAt + 6e4 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						" · ",
						t("editedAt"),
						noteStamp(note.updatedAt)
					] })
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.rowActions,
				onClick: (e) => {
					e.stopPropagation();
				},
				children: inTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: css.act,
					onClick: () => {
						actions.restore(note);
					},
					children: "↩"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: note.pinned ? t("unpin") : t("pin"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.act, note.pinned && css.actOn),
							onClick: () => {
								actions.togglePin(note);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPinOutlineRegular, { size: 13 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: note.struck ? t("unstrike") : t("strike"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.act, note.struck && css.actOn),
							onClick: () => {
								actions.toggleStrike(note);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 13 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: t("edit"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: css.act,
							onClick: onEdit,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 13 })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: t("deleteNote"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: css.act,
							onClick: () => {
								actions.remove(note);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 13 })
						})
					})
				] })
			})
		]
	});
}
function StickyEditModal(props) {
	const { mode, note, folders, imageUrls, t, inTrash, onCancel, onCreate, onSave, onDelete, onRestore, onMoveFolder, onPasteImage, storeImage } = props;
	const isCreate = mode === "create";
	const [tab, setTab] = (0, react.useState)("edit");
	const [text, setText] = (0, react.useState)(note?.text ?? "");
	const [color, setColor] = (0, react.useState)(note?.color ?? "yellow");
	const [folderId, setFolderId] = (0, react.useState)(note?.folderId ?? folders.find((f) => f.builtin)?.id ?? folders[0]?.id ?? "");
	const [pendingImages, setPendingImages] = (0, react.useState)([]);
	const areaRef = (0, react.useRef)(null);
	const dirty = isCreate ? text.trim().length > 0 || pendingImages.length > 0 : text !== note?.text || color !== note?.color;
	async function paste(e) {
		const files = clipboardImageFiles(e);
		if (files.length === 0) return;
		e.preventDefault();
		for (const file of files) {
			const dataUrl = await readImageFile(file);
			if (isCreate) {
				const id = storeImage !== void 0 ? await storeImage(dataUrl) : void 0;
				if (id !== void 0) setPendingImages((prev) => [...prev, {
					id,
					dataUrl
				}]);
			} else onPasteImage?.(dataUrl);
		}
	}
	function submit() {
		if (isCreate) {
			onCreate(text.trim().length === 0 ? "🖼" : text.trim(), color, folderId, pendingImages.map((entry) => entry.id));
			return;
		}
		onSave({
			text,
			...color !== note?.color ? { color } : {}
		});
	}
	const title = isCreate ? t("newNote") : t("editNote") + (dirty ? " •" : "");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		...css.editDialog === void 0 ? {} : { className: css.editDialog },
		...css.editContent === void 0 ? {} : { contentClassName: css.editContent },
		onClose: () => {
			if (!dirty || isCreate || window.confirm(t("unsavedConfirm"))) onCancel();
		},
		title,
		closeLabel: t("cancel"),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: css.editModal,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.editHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css$2.fmtBar,
						children: FORMAT_BUTTONS.map((btn) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
							label: btn.title,
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: css$2.fmtBtn,
								"data-glyph": btn.glyph,
								onMouseDown: (e) => {
									e.preventDefault();
								},
								onClick: () => {
									areaRef.current && setText(applyNoteFormat(areaRef.current, btn.format));
								},
								children: renderFormatGlyph(btn)
							})
						}, btn.format))
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.editTabs,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.editTab, tab === "edit" && css.editTabActive),
							onClick: () => {
								setTab("edit");
							},
							children: t("editTab")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.editTab, tab === "preview" && css.editTabActive),
							onClick: () => {
								setTab("preview");
							},
							children: t("preview")
						})]
					})]
				}),
				tab === "edit" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					ref: areaRef,
					className: css.editModalArea,
					"data-color": color,
					value: text,
					autoFocus: true,
					placeholder: t("quickPlaceholder"),
					onChange: (e) => {
						setText(e.target.value);
					},
					onPaste: (e) => {
						paste(e);
					},
					onKeyDown: (e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							if (dirty) submit();
						}
					}
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.editPreview,
					"data-color": color,
					children: text.trim().length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: css.previewEmpty,
						children: t("previewEmpty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NoteMarkdown, {
						text,
						onToggleTask: (taskIndex) => {
							setText(toggleTask(text, taskIndex));
						}
					})
				}),
				(isCreate ? pendingImages.length > 0 : (note?.images.length ?? 0) > 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css$2.imgStrip,
					children: isCreate ? pendingImages.map((img) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						className: css$2.thumb,
						src: img.dataUrl,
						alt: ""
					}, img.id)) : note?.images.map((id) => {
						const url = imageUrls.get(id);
						return url === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: css$2.thumbPending,
							children: "🖼"
						}, id) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: css$2.thumb,
							src: url,
							alt: ""
						}, id);
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.editMeta,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css.dots,
						children: COLOR_ORDER.map((c, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
							label: t("colorNames").split("|")[i] ?? c,
							side: "bottom",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: clsx(css.dot, color === c && css.dotActive),
								"data-color": c,
								onClick: () => {
									setColor(c);
								}
							})
						}, c))
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: css.folderSelect,
						value: folderId,
						onChange: (e) => {
							const next = e.target.value;
							setFolderId(next);
							if (!isCreate && next !== note?.folderId) onMoveFolder(next);
						},
						children: folders.map((folder) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
							value: folder.id,
							children: [
								folder.emoji,
								" ",
								folder.name
							]
						}, folder.id))
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.formButtons,
					children: [
						!isCreate && (inTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							onClick: onRestore,
							children: ["↩ ", t("restore")]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: onDelete,
							children: ["🗑 ", t("deleteNote")]
						})),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: css.spacer }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								if (!dirty || isCreate || window.confirm(t("unsavedConfirm"))) onCancel();
							},
							children: t("cancel")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							disabled: !dirty,
							onClick: submit,
							children: isCreate ? t("create") : t("save")
						})
					]
				})
			]
		})
	});
}
function FolderModal(props) {
	const { mode, t, existing, onCancel, onSubmit, onDelete } = props;
	const isCreate = mode.mode === "create";
	const selfId = mode.mode === "rename" ? mode.folder.id : "";
	const [name, setName] = (0, react.useState)(isCreate ? "" : mode.folder.name);
	const [emoji, setEmoji] = (0, react.useState)(isCreate ? "📁" : mode.folder.emoji);
	const [color, setColor] = (0, react.useState)(isCreate ? "pink" : mode.folder.color);
	const colorNames = t("colorNames").split("|");
	const nameTaken = name.trim().length > 0 && existing.some((f) => f.name === name.trim() && f.id !== selfId);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		onClose: onCancel,
		title: isCreate ? t("newFolder") : t("rename"),
		closeLabel: t("cancel"),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: css.folderForm,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.folderFormRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: css.emojiInput,
						value: emoji,
						maxLength: 4,
						onChange: (e) => {
							setEmoji(e.target.value);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
						value: name,
						placeholder: t("newFolderName"),
						onChange: (e) => {
							setName(e.target.value);
						}
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.dots,
					children: COLOR_ORDER.map((c, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tip, {
						label: colorNames[i] ?? c,
						side: "bottom",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: clsx(css.dot, color === c && css.dotActive),
							"data-color": c,
							onClick: () => {
								setColor(c);
							}
						})
					}, c))
				}),
				nameTaken && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: css.formError,
					children: t("folderExists")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.formButtons,
					children: [
						onDelete !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: onDelete,
							children: ["🗑 ", t("deleteFolder")]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: css.spacer }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							onClick: onCancel,
							children: t("cancel")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							disabled: name.trim().length === 0 || nameTaken,
							onClick: () => {
								onSubmit(name.trim(), emoji, color);
							},
							children: isCreate ? t("create") : t("save")
						})
					]
				})
			]
		})
	});
}
// node_modules/.prebuild/client/wall-source.mjs
const EMPTY$1 = {
	status: "loading",
	folders: [],
	notes: [],
	snapshots: [],
	error: ""
};
var WallSource = class {
	/**
	* @param api - mounted `remote.stickyWall` namespace.
	*/
	constructor(api) {
		this.api = api;
	}
	api;
	snapshot = EMPTY$1;
	listeners = /* @__PURE__ */ new Set();
	pending = Promise.resolve();
	getSnapshot() {
		return this.snapshot;
	}
	subscribe(listener) {
		this.listeners.add(listener);
		if (this.listeners.size === 1) this.reload();
		return () => {
			this.listeners.delete(listener);
		};
	}
	/** Read the whole wall again; failures keep the previous data with an error status. */
	reload() {
		this.enqueue(async () => {
			await this.readState();
		});
	}
	/** Create one note from the quick bar, the panel, or the selection pill. */
	createNote(text, options = {}) {
		this.call(this.api.createNote({
			text,
			...options
		}));
	}
	/** Patch one note (edit, pin, strike, recolor). */
	updateNote(id, patch) {
		this.call(this.api.updateNote({
			id,
			patch
		}));
	}
	/** Move one note into another folder. */
	moveNote(id, folderId) {
		this.call(this.api.moveNote({
			id,
			folderId
		}));
	}
	/** Soft-delete one note into the trash. */
	deleteNote(id) {
		this.call(this.api.deleteNote({ id }));
	}
	/** Restore one trashed note. */
	restoreNote(id) {
		this.call(this.api.restoreNote({ id }));
	}
	/** Permanently remove every trashed note. */
	emptyTrash() {
		this.call(this.api.emptyTrash());
	}
	/** Create one folder. */
	createFolder(name, emoji, color) {
		const request = { name };
		if (emoji !== void 0) request.emoji = emoji;
		if (color !== void 0) request.color = color;
		this.call(this.api.createFolder(request));
	}
	/** Patch one folder. */
	updateFolder(id, patch) {
		this.call(this.api.updateFolder({
			id,
			patch
		}));
	}
	/** Delete one folder; its notes move to the inbox. */
	deleteFolder(id) {
		this.call(this.api.deleteFolder({ id }));
	}
	/** Roll the wall back to one retained snapshot. */
	restoreSnapshot(id) {
		this.call(this.api.restoreSnapshot({ id }));
	}
	/**
	* Store one pasted image.
	* @returns the image id, or undefined when the store rejected it.
	*/
	async saveImage(dataUrl) {
		try {
			const result = await this.api.saveImage({ dataUrl });
			return result.ok && result.value !== void 0 ? result.value.id : void 0;
		} catch {
			return;
		}
	}
	/**
	* Read one stored image's data URL.
	* @returns the data URL, or undefined when unavailable.
	*/
	async image(id) {
		try {
			const result = await this.api.image({ id });
			return result.ok && result.value !== void 0 ? result.value.dataUrl : void 0;
		} catch {
			return;
		}
	}
	/** Append stored image ids onto one note. */
	attachImages(id, imageIds) {
		this.call(this.api.attachImages({
			id,
			imageIds
		}));
	}
	/** Export the wall; resolves with the file body, or undefined on failure. */
	async exportWall(format) {
		try {
			const result = await this.api.exportWall({ format });
			return result.ok && result.value !== void 0 ? result.value : void 0;
		} catch {
			return;
		}
	}
	/** Serialize mutations through one queue; each ends in a reload. */
	call(pending) {
		this.enqueue(async () => {
			let failure = "";
			try {
				const result = await pending;
				if (!result.ok) failure = describeFailure(result.error);
			} catch (reason) {
				failure = describeFailure(reason);
			}
			await this.readState(failure);
		});
	}
	/** One state read used to finish every mutation. */
	async readState(presetError = "") {
		let failure = presetError;
		let value;
		try {
			const result = await this.api.state();
			if (!result.ok || result.value === void 0) {
				if (failure === "") failure = describeFailure(result.error);
			} else value = result.value;
		} catch (reason) {
			if (failure === "") failure = describeFailure(reason);
		}
		this.set(value === void 0 ? {
			...this.snapshot,
			status: "error",
			error: failure === "" ? "unknown error" : failure
		} : {
			status: failure === "" ? "ready" : "error",
			error: failure,
			folders: value.folders,
			notes: value.notes,
			snapshots: value.snapshots
		});
	}
	/** Chain work so a mutation's reload cannot race the next mutation's write. */
	enqueue(run) {
		this.pending = this.pending.then(run).catch((reason) => {
			this.set({
				...this.snapshot,
				status: "error",
				error: describeFailure(reason)
			});
		});
	}
	set(next) {
		this.snapshot = next;
		for (const listener of this.listeners) listener();
	}
};
function describeFailure(reason) {
	if (reason === void 0 || reason === null) return "remote call failed";
	return String(typeof reason === "object" && "message" in reason ? reason.message : reason).slice(0, 160);
}
// node_modules/.prebuild/sync-merge.mjs
function index(items) {
	const map = /* @__PURE__ */ new Map();
	for (const item of items) {
		if (map.has(item.id)) throw new Error(`duplicate id: ${item.id}`);
		map.set(item.id, item);
	}
	return map;
}
function canonical(value) {
	return JSON.stringify(value, (_key, item) => {
		if (item === null || typeof item !== "object" || Array.isArray(item)) return item;
		const object = item;
		return Object.fromEntries(Object.keys(object).sort().map((key) => [key, object[key]]));
	});
}
function equal$1(a, b) {
	return canonical(a) === canonical(b);
}
function mergeWalls(base, local, remote, newId) {
	let conflicts = 0;
	const merge = (kind, baseRows, localRows, remoteRows) => {
		const b = index(baseRows), l = index(localRows), r = index(remoteRows);
		const result = [];
		for (const id of /* @__PURE__ */ new Set([
			...b.keys(),
			...l.keys(),
			...r.keys()
		])) {
			const before = b.get(id), ours = l.get(id), theirs = r.get(id);
			if (kind === "image") {
				const candidates = [
					before,
					ours,
					theirs
				].filter((x) => x !== void 0);
				if (candidates.some((x) => !equal$1(x, candidates[0]))) throw new Error(`image conflict: ${id}`);
				if (candidates[0] !== void 0) result.push(candidates[0]);
				continue;
			}
			if (equal$1(ours, theirs)) {
				if (ours !== void 0) result.push(ours);
				continue;
			}
			if (equal$1(ours, before)) {
				if (theirs !== void 0) result.push(theirs);
				continue;
			}
			if (equal$1(theirs, before)) {
				if (ours !== void 0) result.push(ours);
				continue;
			}
			if (kind === "folder") throw new Error(`folder conflict: ${id}`);
			conflicts++;
			if (ours === void 0 || theirs === void 0) {
				const survivor = ours ?? theirs;
				if (survivor !== void 0) result.push(survivor);
			} else {
				result.push(theirs);
				const note = ours;
				result.push({
					...note,
					id: newId(),
					text: `\u3010\u540C\u6B65\u51B2\u7A81\u526F\u672C\u3011${note.text}`
				});
			}
		}
		return result;
	};
	const folders = merge("folder", base.folders, local.folders, remote.folders);
	const notes = merge("note", base.notes, local.notes, remote.notes);
	const images = merge("image", base.images, local.images, remote.images);
	const folderIds = new Set(folders.map((folder) => folder.id));
	const imageIds = new Set(images.map((image) => image.id));
	for (const note of notes) {
		if (!folderIds.has(note.folderId)) throw new Error(`missing folder: ${note.folderId}`);
		for (const id of note.images) if (!imageIds.has(id)) throw new Error(`missing image: ${id}`);
	}
	return {
		wall: {
			folders,
			notes,
			images
		},
		conflicts
	};
}
// node_modules/.prebuild/client/sync-controller.mjs
const URL$1 = "https://mnfvjcntimpcrovkjvfo.supabase.co";
const KEY = "sb_publishable_hSPgeAD5aUV0xVn1oe_CRQ_l64oBbEV";
const SESSION_KEY = "dsh-note-wall.supabase.session.v1";
const EMPTY = {
	folders: [],
	notes: [],
	images: []
};
function normalize(wall) {
	const sort = (rows) => [...rows].sort((a, b) => a.id.localeCompare(b.id));
	return {
		folders: sort(wall.folders),
		notes: sort(wall.notes),
		images: sort(wall.images)
	};
}
function equal(a, b) {
	return canonical(normalize(a)) === canonical(normalize(b));
}
async function baseStore(user, write) {
	const db = await new Promise((resolve, reject) => {
		const req = indexedDB.open("dsh-note-wall-sync-v1", 1);
		req.onupgradeneeded = () => {
			req.result.createObjectStore("bases");
		};
		req.onsuccess = () => {
			resolve(req.result);
		};
		req.onerror = () => {
			reject(req.error);
		};
	});
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction("bases", write === void 0 ? "readonly" : "readwrite");
			const store = tx.objectStore("bases");
			const req = write === void 0 ? store.get(user) : store.put(write, user);
			let result = write ?? {
				wall: EMPTY,
				revision: 0
			};
			req.onsuccess = () => {
				if (write === void 0) result = req.result ?? result;
			};
			tx.oncomplete = () => {
				resolve(result);
			};
			tx.onerror = () => {
				reject(tx.error);
			};
			tx.onabort = () => {
				reject(tx.error);
			};
		});
	} finally {
		db.close();
	}
}
var SyncController = class {
	constructor(api, onChange, bases = baseStore) {
		this.api = api;
		this.onChange = onChange;
		this.bases = bases;
		try {
			this.session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
		} catch {
			this.session = null;
		}
		if (this.session !== null) this.set("syncing", "准备同步");
	}
	api;
	onChange;
	bases;
	session = null;
	status = {
		state: "signed-out",
		text: "未登录云同步",
		email: ""
	};
	listeners = /* @__PURE__ */ new Set();
	timer;
	busy = false;
	disposed = false;
	getSnapshot = () => this.status;
	subscribe = (listener) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	start() {
		if (this.timer !== void 0) return;
		this.disposed = false;
		this.timer = window.setInterval(() => {
			this.sync();
		}, 5e3);
		this.sync();
	}
	stop() {
		this.disposed = true;
		if (this.timer !== void 0) window.clearInterval(this.timer);
		this.timer = void 0;
	}
	set(state, text) {
		this.status = {
			state,
			text,
			email: this.session?.user.email ?? ""
		};
		for (const listener of this.listeners) listener();
	}
	saveSession(session) {
		if (!session.access_token || !session.refresh_token || !session.user?.id) throw new Error("登录信息不完整");
		this.session = session;
		localStorage.setItem(SESSION_KEY, JSON.stringify(session));
	}
	async request(path, init = {}, token) {
		const response = await fetch(`${URL$1}${path}`, {
			...init,
			headers: {
				apikey: KEY,
				"Content-Type": "application/json",
				...token ? { Authorization: `Bearer ${token}` } : {},
				...init.headers
			}
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) throw new Error(String(body?.msg ?? body?.error_description ?? body?.message ?? `\u8BF7\u6C42\u5931\u8D25 (${response.status})`));
		return body;
	}
	async signIn(email, password) {
		const session = await this.request("/auth/v1/token?grant_type=password", {
			method: "POST",
			body: JSON.stringify({
				email,
				password
			})
		});
		this.saveSession(session);
		this.set("syncing", "登录成功，正在同步");
		this.sync();
	}
	async signUp(email, password) {
		const result = await this.request("/auth/v1/signup", {
			method: "POST",
			body: JSON.stringify({
				email,
				password
			})
		});
		if (result.access_token) {
			this.saveSession(result);
			this.sync();
			return true;
		}
		return false;
	}
	signOut() {
		this.session = null;
		localStorage.removeItem(SESSION_KEY);
		this.set("signed-out", "未登录云同步");
	}
	async token() {
		const current = this.session;
		if (current === null) throw new Error("请登录云同步");
		if (current.expires_at > Date.now() / 1e3 + 60) return current;
		const refreshed = await this.request("/auth/v1/token?grant_type=refresh_token", {
			method: "POST",
			body: JSON.stringify({ refresh_token: current.refresh_token })
		});
		if (this.session !== current) throw new Error("登录状态已改变");
		this.saveSession(refreshed);
		return refreshed;
	}
	async sync() {
		if (this.busy || this.session === null || this.disposed) return;
		this.busy = true;
		try {
			this.set("syncing", "同步中");
			const session = await this.token();
			const base = await this.bases(session.user.id);
			const localResult = await this.api.syncRead();
			if (!localResult.ok || localResult.value === void 0) throw new Error("读取本机便签失败");
			const local = normalize(localResult.value);
			let rows = await this.request("/rest/v1/dsh_note_wall_sync_v1?select=revision", {}, session.access_token);
			if (!Array.isArray(rows) || rows.length > 1) throw new Error("云端数据格式异常");
			if (rows[0] !== void 0 && rows[0].revision !== base.revision) {
				rows = await this.request("/rest/v1/dsh_note_wall_sync_v1?select=revision,wall", {}, session.access_token);
				if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.wall === void 0) throw new Error("云端数据格式异常");
			}
			const revision = rows[0]?.revision ?? 0;
			const remote = rows[0] === void 0 ? EMPTY : rows[0].wall === void 0 ? base.wall : normalize(rows[0].wall);
			const merged = normalize(mergeWalls(base.wall, local, remote, () => crypto.randomUUID()).wall);
			if (this.session?.user.id !== session.user.id || this.disposed) return;
			let committedRevision = revision;
			if (revision === 0 || !equal(merged, remote)) {
				if (await this.request("/rest/v1/rpc/dsh_note_wall_compare_and_swap_v1", {
					method: "POST",
					body: JSON.stringify({
						expected_revision: revision,
						new_wall: merged
					})
				}, session.access_token) !== true) {
					this.set("syncing", "云端有新变化，准备重新合并");
					return;
				}
				committedRevision = revision + 1;
			}
			if (this.session?.user.id !== session.user.id || this.disposed) return;
			if (!equal(local, merged)) {
				const result = await this.api.syncApply({
					expected: local,
					next: merged
				});
				if (!result.ok) throw new Error("更新本机便签失败");
				if (!result.value) {
					this.set("syncing", "本机有新变化，准备重新合并");
					return;
				}
				this.onChange();
			}
			await this.bases(session.user.id, {
				wall: merged,
				revision: committedRevision
			});
			this.set("ready", "已同步");
		} catch (error) {
			const message = error instanceof Error ? error.message : "同步失败";
			this.set("error", message.startsWith("folder conflict:") ? "文件夹存在冲突，已暂停同步" : `\u540C\u6B65\u5931\u8D25\uFF1A${message}`);
		} finally {
			this.busy = false;
		}
	}
};
// node_modules/.prebuild/client/main.mjs
const PANEL_ID = "stickyWall";
const inject = [
	"slots",
	"locale",
	"remote",
	"uiWorkspace"
];
function injectStyles() {
	const marker = "dsh-sticky-wall-styles";
	if (document.getElementById(marker) !== null) return;
	const style = document.createElement("style");
	style.id = marker;
	style.textContent = [
		cssText,
		cssText$1,
		cssText$2
	].join("\n");
	document.head.appendChild(style);
}
function apply(ctx) {
	injectStyles();
	const t = ctx.locale.bind(NS);
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "stickyWall: dictionaries");
	ctx.plugin(async (owner) => {
		await owner.remote.$mount(stickyWallRemote);
		owner.inject(["remote.stickyWall"], (scope) => {
			const source = new WallSource(scope.remote.stickyWall);
			const sync = new SyncController(scope.remote.stickyWall, () => source.reload());
			scope.effect(() => {
				sync.start();
				return () => {
					sync.stop();
				};
			}, "stickyWall: cloud sync");
			const uiWorkspace = scope.uiWorkspace;
			const jumpToOrigin = makeJump((sessionId) => {
				uiWorkspace.openSession(sessionId);
			});
			ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				inject: () => ({
					source,
					sync,
					jumpToOrigin,
					hooks: { wall: source }
				})
			}, StickyWallPage)), "stickyWall: main panel");
			ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 21,
				locale: NS,
				label: () => t("panel")
			}, StickyPanelIcon)), "stickyWall: sidebar entry");
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "stickyWall.capture",
				locale: NS,
				inject: () => ({
					source,
					hooks: { wall: source }
				})
			}, QuickCapture)), "stickyWall: capture overlay");
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "stickyWall.sessionTracker",
				inject: (sessionId) => {
					setStickySessionId(sessionId);
					return {};
				}
			}, SessionTracker)), "stickyWall: session tracker");
		});
	});
}
function SessionTracker() {
	return null;
}
exports.PANEL_ID = PANEL_ID;
exports.WallSource = WallSource;
exports.apply = apply;
exports.inject = inject;
	return module.exports;
	},
})
