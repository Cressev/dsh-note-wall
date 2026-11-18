import { STICKY_COLORS, stickyWallRemote } from "./remote.mjs";
import { randomUUID } from "node:crypto";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
import { z as z$1 } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
// node_modules/.prebuild/storage.mjs
const noteRecordSchema = z$1.object({
	id: z$1.string(),
	folderId: z$1.string(),
	text: z$1.string(),
	color: z$1.enum(STICKY_COLORS),
	pinned: z$1.boolean(),
	struck: z$1.boolean(),
	createdAt: z$1.number(),
	updatedAt: z$1.number(),
	deletedAt: z$1.number().nullable(),
	origin: z$1.object({
		sessionId: z$1.string(),
		turn: z$1.number().nullable(),
		snippet: z$1.string()
	}).nullable(),
	images: z$1.array(z$1.string()).default([])
});
const folderRecordSchema = z$1.object({
	id: z$1.string(),
	name: z$1.string(),
	emoji: z$1.string(),
	color: z$1.enum(STICKY_COLORS),
	order: z$1.number(),
	builtin: z$1.boolean()
});
const snapshotRecordSchema = z$1.object({
	id: z$1.string(),
	savedAt: z$1.number(),
	kind: z$1.enum(["recent", "daily"]),
	payload: z$1.string()
});
const imageRecordSchema = z$1.object({
	id: z$1.string(),
	dataUrl: z$1.string(),
	createdAt: z$1.number()
});
const stickyWallDomain = defineDomain({
	name: "sticky_wall",
	version: 1,
	global: {
		schema: z$1.object({ seededAt: z$1.number() }),
		initial: { seededAt: 0 }
	},
	tables: {
		folders: domainTable(folderRecordSchema),
		notes: domainTable(noteRecordSchema),
		images: domainTable(imageRecordSchema),
		snapshots: domainTable(snapshotRecordSchema)
	}
});
const stickySyncJournalDomain = defineDomain({
	name: "sticky_wall_sync_journal",
	version: 1,
	global: {
		schema: z$1.object({ pending: z$1.string() }),
		initial: { pending: "" }
	},
	tables: {}
});
// node_modules/.prebuild/sync-merge.mjs
function canonical(value) {
	return JSON.stringify(value, (_key, item) => {
		if (item === null || typeof item !== "object" || Array.isArray(item)) return item;
		const object = item;
		return Object.fromEntries(Object.keys(object).sort().map((key) => [key, object[key]]));
	});
}
// node_modules/.prebuild/index.mjs
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
	throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var __decoratorStart = (base) => [
	,
	,
	,
	__create(base?.[__knownSymbol("metadata")] ?? null)
];
var __decoratorStrings = [
	"class",
	"method",
	"getter",
	"setter",
	"accessor",
	"field",
	"value",
	"get",
	"set"
];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({
	kind: __decoratorStrings[kind],
	name,
	metadata,
	addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null))
});
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
	for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
	return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
	var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
	var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
	var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
	var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : {
		get [name]() {
			return __privateGet(this, extra);
		},
		set [name](x) {
			return __privateSet(this, extra, x);
		}
	}, name));
	k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
	for (var i = decorators.length - 1; i >= 0; i--) {
		ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
		if (k) {
			ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
			if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
			if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
		}
		it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : {
			get: desc.get,
			set: desc.set
		} : target, ctx), done._ = 1;
		if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
		else if (typeof it !== "object" || it === null) __typeError("Object expected");
		else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
	}
	return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError("Cannot use the \"in\" operator on this value") : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _attachImages_dec;
var _image_dec;
var _saveImage_dec;
var _restoreSnapshot_dec;
var _exportWall_dec;
var _deleteFolder_dec;
var _updateFolder_dec;
var _createFolder_dec;
var _emptyTrash_dec;
var _restoreNote_dec;
var _deleteNote_dec;
var _moveNote_dec;
var _updateNote_dec;
var _createNote_dec;
var _state_dec;
var _syncApply_dec;
var _syncRead_dec;
var _a;
var _init;
const SEED_FOLDERS = [
	{
		name: "收纳盒",
		emoji: "🗂️",
		color: "blue",
		builtin: true
	},
	{
		name: "工作",
		emoji: "💼",
		color: "yellow",
		builtin: false
	},
	{
		name: "备忘",
		emoji: "📝",
		color: "mint",
		builtin: false
	},
	{
		name: "灵感",
		emoji: "💡",
		color: "orange",
		builtin: false
	}
];
const MAX_NOTE_TEXT = 1e4;
const MAX_SNIPPET = 200;
const MAX_FOLDER_NAME = 60;
const MAX_IMAGE_DATA_URL = 4e6;
const MAX_NOTE_IMAGES = 9;
const SNAPSHOT_QUIET_MS = 6e5;
const TOOL_RESULT_LIMIT = 20;
function clampInt(value, max, fallback) {
	return Math.min(Math.max(typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : fallback, 1), max);
}
function normalizeColor(value) {
	return value !== void 0 && STICKY_COLORS.includes(value) ? value : "yellow";
}
function formatStamp(ms) {
	const d = new Date(ms);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function summarizeNote(note) {
	const flags = [note.pinned ? "📌" : "", note.struck ? "✅(已划掉)" : ""].filter(Boolean).join(" ");
	const text = note.text.replace(/\s+/g, " ").slice(0, 120);
	return `${formatStamp(note.updatedAt)} ${flags} ${text}`.trim();
}
const TEXT_OUTPUT = {
	schema: { type: "string" },
	render: (_args, value) => [{
		type: "text",
		text: value
	}]
};
const toolColorParameter = {
	type: "string",
	enum: [...STICKY_COLORS],
	description: "Optional palette key: yellow, pink, mint, blue, purple, orange."
};
var StickyWallService = class extends (_a = TypertRemoteService, _syncRead_dec = [Remote("syncRead")], _syncApply_dec = [Remote("syncApply")], _state_dec = [Remote("state")], _createNote_dec = [Remote("createNote")], _updateNote_dec = [Remote("updateNote")], _moveNote_dec = [Remote("moveNote")], _deleteNote_dec = [Remote("deleteNote")], _restoreNote_dec = [Remote("restoreNote")], _emptyTrash_dec = [Remote("emptyTrash")], _createFolder_dec = [Remote("createFolder")], _updateFolder_dec = [Remote("updateFolder")], _deleteFolder_dec = [Remote("deleteFolder")], _exportWall_dec = [Remote("exportWall")], _restoreSnapshot_dec = [Remote("restoreSnapshot")], _saveImage_dec = [Remote("saveImage")], _image_dec = [Remote("image")], _attachImages_dec = [Remote("attachImages")], _a) {
	/**
	* @param ctx - Host context carrying storage-domain and tool services.
	* @param config - Validated snapshot-retention configuration.
	*/
	constructor(ctx, config) {
		super(ctx, "stickyWall");
		__runInitializers(_init, 5, this);
		__publicField(this, "limits");
		__publicField(this, "domain");
		__publicField(this, "initialized");
		__publicField(this, "journal");
		__publicField(this, "syncLock", Promise.resolve());
		__publicField(this, "syncBroken", false);
		this.limits = {
			recent: config.recentSnapshots,
			daily: config.dailySnapshots
		};
		this.domain = ctx.storageDomain.open(stickyWallDomain);
		this.journal = ctx.storageDomain.open(stickySyncJournalDomain);
		ctx.effect(() => () => {
			this.domain.then((domain) => domain.close());
		}, "stickyWall: storage");
		ctx.effect(() => () => {
			this.journal.then((domain) => domain.close());
		}, "stickyWall: sync journal");
		this.initialized = this.seed().then(() => this.recoverSync());
		this.registerTools();
	}
	/** Create the seed folders when the wall has never been opened. */
	async seed() {
		const domain = await this.domain;
		if (domain.global.get().seededAt > 0) return;
		const folders = domain.table("folders");
		if (folders.size === 0) {
			let order = 0;
			for (const seed of SEED_FOLDERS) await folders.put(seed.name, {
				id: seed.name,
				name: seed.name,
				emoji: seed.emoji,
				color: seed.color,
				order: order++,
				builtin: seed.builtin
			});
		}
		await domain.global.set({ seededAt: Date.now() });
	}
	/** Register the three model tools routed to this service. */
	registerTools() {
		this.ctx.effect(() => this.ctx.tools.register(defineTool({
			name: "sticky_note_add",
			description: "Pin one note onto the user's sticky wall. Use when the user asks to record, remember, or memo something (工作/备忘/灵感).",
			parameters: {
				text: {
					type: "string",
					required: true,
					description: "Note text to pin, verbatim from what the user wants recorded."
				},
				folder: {
					type: "string",
					description: "Target folder name (工作, 备忘, 灵感, or 收纳盒). Defaults to 收纳盒."
				},
				color: toolColorParameter
			},
			output: TEXT_OUTPUT,
			execute: async (args) => {
				await this.initialized;
				const domain = await this.domain;
				const folder = folderByName(domain, String(args.folder ?? "")) ?? inboxFolder(domain);
				const record = await this.mutate(async () => {
					const id = randomUUID();
					const now = Date.now();
					const note = {
						id,
						folderId: folder.id,
						text: String(args.text).trim().slice(0, MAX_NOTE_TEXT),
						color: normalizeColor(args.color === void 0 ? void 0 : String(args.color)),
						pinned: false,
						struck: false,
						createdAt: now,
						updatedAt: now,
						deletedAt: null,
						origin: null,
						images: []
					};
					if (note.text.length === 0) throw new Error("便签内容不能为空");
					await domain.table("notes").put(id, note);
					return note;
				});
				return `\u5DF2\u8D34\u5230\u4FBF\u7B7E\u5899 [${folder.emoji} ${folder.name}]\uFF1A${summarizeNote(record)}`;
			}
		})), "stickyWall: tool add");
		this.ctx.effect(() => this.ctx.tools.register(defineTool({
			name: "sticky_note_list",
			description: "List sticky-wall notes, newest first. Optional folder filter; trashed notes excluded.",
			parameters: {
				folder: {
					type: "string",
					description: "Optional folder name filter."
				},
				limit: {
					type: "integer",
					description: `Optional result ceiling, 1-${TOOL_RESULT_LIMIT}.`
				}
			},
			output: TEXT_OUTPUT,
			isConcurrencySafe: () => true,
			execute: async (args) => {
				await this.initialized;
				const domain = await this.domain;
				const folder = args.folder === void 0 ? void 0 : folderByName(domain, String(args.folder));
				if (args.folder !== void 0 && folder === void 0) return `\u6CA1\u6709\u540D\u4E3A\u300C${String(args.folder)}\u300D\u7684\u6587\u4EF6\u5939`;
				const limit = clampInt(args.limit, TOOL_RESULT_LIMIT, 10);
				const notes = liveNotes(domain).filter((note) => folder === void 0 || note.folderId === folder.id).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
				if (notes.length === 0) return folder === void 0 ? "便签墙还是空的" : `\u6587\u4EF6\u5939 [${folder.emoji} ${folder.name}] \u91CC\u6CA1\u6709\u4FBF\u7B7E`;
				return notes.map((note) => `- [${folderById(domain, note.folderId)?.name ?? "?"}] ${summarizeNote(note)}`).join("\n");
			}
		})), "stickyWall: tool list");
		this.ctx.effect(() => this.ctx.tools.register(defineTool({
			name: "sticky_note_search",
			description: "Search sticky-wall notes by keyword (case-insensitive substring over text), newest first.",
			parameters: {
				query: {
					type: "string",
					required: true,
					description: "Keyword to look for inside note text."
				},
				limit: {
					type: "integer",
					description: `Optional result ceiling, 1-${TOOL_RESULT_LIMIT}.`
				}
			},
			output: TEXT_OUTPUT,
			isConcurrencySafe: () => true,
			execute: async (args) => {
				await this.initialized;
				const domain = await this.domain;
				const needle = String(args.query).toLowerCase();
				const limit = clampInt(args.limit, TOOL_RESULT_LIMIT, 10);
				const notes = liveNotes(domain).filter((note) => note.text.toLowerCase().includes(needle)).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
				if (notes.length === 0) return `\u6CA1\u6709\u627E\u5230\u5305\u542B\u300C${String(args.query)}\u300D\u7684\u4FBF\u7B7E`;
				return notes.map((note) => `- [${folderById(domain, note.folderId)?.name ?? "?"}] ${summarizeNote(note)}`).join("\n");
			}
		})), "stickyWall: tool search");
	}
	/** Retain a pre-mutation snapshot, then apply the write body. */
	async mutate(body) {
		return this.exclusive(async () => {
			const domain = await this.domain;
			await this.snapshotBeforeChange(domain);
			return body(domain);
		});
	}
	async exclusive(body) {
		const previous = this.syncLock;
		let release;
		this.syncLock = new Promise((resolve) => {
			release = resolve;
		});
		await previous;
		try {
			if (this.syncBroken) throw new Error("Sync recovery is required; restart the application");
			return await body();
		} finally {
			release();
		}
	}
	syncValue(domain) {
		const sorted = (items) => items.sort((a, b) => a.id.localeCompare(b.id));
		return {
			folders: sorted([...domain.table("folders").entries()].map(([, row]) => row)),
			notes: sorted([...domain.table("notes").entries()].map(([, row]) => row)),
			images: sorted([...domain.table("images").entries()].map(([, row]) => row))
		};
	}
	async writeSyncValue(domain, wall) {
		for (const row of wall.images) await domain.table("images").put(row.id, row);
		for (const row of wall.folders) await domain.table("folders").put(row.id, row);
		for (const row of wall.notes) await domain.table("notes").put(row.id, row);
		for (const id of [...domain.table("notes").keys()]) if (!wall.notes.some((row) => row.id === id)) await domain.table("notes").delete(id);
		for (const id of [...domain.table("folders").keys()]) if (!wall.folders.some((row) => row.id === id)) await domain.table("folders").delete(id);
		for (const id of [...domain.table("images").keys()]) if (!wall.images.some((row) => row.id === id)) await domain.table("images").delete(id);
	}
	async recoverSync() {
		const journal = await this.journal;
		const pending = journal.global.get().pending;
		if (pending === "") return;
		await this.writeSyncValue(await this.domain, JSON.parse(pending));
		await journal.global.set({ pending: "" });
	}
	async syncRead() {
		await this.initialized;
		return this.exclusive(async () => this.syncValue(await this.domain));
	}
	async syncApply(request) {
		await this.initialized;
		return this.exclusive(async () => {
			const domain = await this.domain;
			const current = this.syncValue(domain);
			if (canonical(current) !== canonical(request.expected)) return false;
			const journal = await this.journal;
			await journal.global.set({ pending: JSON.stringify(current) });
			this.syncBroken = true;
			try {
				await this.snapshotBeforeChange(domain);
				await this.writeSyncValue(domain, request.next);
				await journal.global.set({ pending: "" });
				this.syncBroken = false;
			} catch (error) {
				await this.writeSyncValue(domain, current);
				await journal.global.set({ pending: "" });
				this.syncBroken = false;
				throw error;
			}
			return true;
		});
	}
	/** Retain one snapshot: `recent` per quiet window, `daily` per local day. */
	async snapshotBeforeChange(domain) {
		const table = domain.table("snapshots");
		const now = Date.now();
		const rows = [...table.entries()].map(([, row]) => row);
		const payload = JSON.stringify({
			folders: [...domain.table("folders").entries()].map(([, row]) => row),
			notes: [...domain.table("notes").entries()].map(([, row]) => row)
		});
		const recent = rows.filter((row) => row.kind === "recent").sort((a, b) => b.savedAt - a.savedAt);
		const daily = rows.filter((row) => row.kind === "daily").sort((a, b) => b.savedAt - a.savedAt);
		const sameLocalDay = (a, b) => {
			const da = new Date(a), db = new Date(b);
			return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
		};
		const writes = [];
		if (recent[0] === void 0 || now - recent[0].savedAt > SNAPSHOT_QUIET_MS) {
			const id = `recent-${now}-${randomUUID().slice(0, 8)}`;
			writes.push(table.put(id, {
				id,
				savedAt: now,
				kind: "recent",
				payload
			}));
			for (const stale of recent.slice(this.limits.recent - 1)) writes.push(table.delete(stale.id));
		}
		if (daily[0] === void 0 || !sameLocalDay(daily[0].savedAt, now)) {
			const id = `daily-${now}-${randomUUID().slice(0, 8)}`;
			writes.push(table.put(id, {
				id,
				savedAt: now,
				kind: "daily",
				payload
			}));
			for (const stale of daily.slice(this.limits.daily - 1)) writes.push(table.delete(stale.id));
		}
		await Promise.all(writes);
	}
	/** Whole-wall state for the panel: folders ordered, notes raw, snapshots newest-first. */
	stateValue(domain) {
		return {
			folders: [...domain.table("folders").entries()].map(([, row]) => row).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
			notes: [...domain.table("notes").entries()].map(([, row]) => row),
			snapshots: [...domain.table("snapshots").entries()].map(([, row]) => row).sort((a, b) => b.savedAt - a.savedAt).map((row) => {
				const parsed = JSON.parse(row.payload);
				return {
					id: row.id,
					savedAt: row.savedAt,
					kind: row.kind,
					notes: parsed.notes.length
				};
			})
		};
	}
	/** @returns the note row, or throws the shared id-miss error. */
	noteOrThrow(domain, id) {
		const note = domain.table("notes").get(id);
		if (note === void 0) throw new Error(`\u4FBF\u7B7E ${id} \u4E0D\u5B58\u5728`);
		return note;
	}
	async state() {
		await this.initialized;
		const domain = await this.domain;
		return this.stateValue(domain);
	}
	async createNote(request) {
		await this.initialized;
		const text = request.text.trim();
		if (text.length === 0) throw new Error("便签内容不能为空");
		const domain = await this.domain;
		const folderId = request.folderId ?? inboxFolder(domain).id;
		if (folderById(domain, folderId) === void 0) throw new Error(`\u6587\u4EF6\u5939 ${folderId} \u4E0D\u5B58\u5728`);
		return this.mutate(async () => {
			const id = randomUUID();
			const now = Date.now();
			const record = {
				id,
				folderId,
				text: text.slice(0, MAX_NOTE_TEXT),
				color: normalizeColor(request.color),
				pinned: false,
				struck: false,
				createdAt: now,
				updatedAt: now,
				deletedAt: null,
				origin: request.origin === void 0 ? null : {
					sessionId: request.origin.sessionId,
					turn: request.origin.turn,
					snippet: request.origin.snippet.slice(0, MAX_SNIPPET)
				},
				images: []
			};
			await domain.table("notes").put(id, record);
			return record;
		});
	}
	async updateNote(request) {
		await this.initialized;
		const domain = await this.domain;
		const note = this.noteOrThrow(domain, request.id);
		const patch = request.patch;
		if (patch.text !== void 0 && patch.text.trim().length === 0) throw new Error("便签内容不能为空");
		return this.mutate(async () => {
			const next = {
				...note,
				text: patch.text === void 0 ? note.text : patch.text.trim().slice(0, MAX_NOTE_TEXT),
				color: patch.color === void 0 ? note.color : normalizeColor(patch.color),
				pinned: patch.pinned ?? note.pinned,
				struck: patch.struck ?? note.struck,
				updatedAt: Date.now()
			};
			await domain.table("notes").put(note.id, next);
			return next;
		});
	}
	async moveNote(request) {
		await this.initialized;
		const domain = await this.domain;
		const note = this.noteOrThrow(domain, request.id);
		if (folderById(domain, request.folderId) === void 0) throw new Error(`\u6587\u4EF6\u5939 ${request.folderId} \u4E0D\u5B58\u5728`);
		return this.mutate(async () => {
			const next = {
				...note,
				folderId: request.folderId,
				updatedAt: Date.now()
			};
			await domain.table("notes").put(note.id, next);
			return next;
		});
	}
	async deleteNote(request) {
		await this.initialized;
		const domain = await this.domain;
		const note = this.noteOrThrow(domain, request.id);
		await this.mutate(async () => {
			await domain.table("notes").put(note.id, {
				...note,
				deletedAt: Date.now()
			});
		});
	}
	async restoreNote(request) {
		await this.initialized;
		const domain = await this.domain;
		const note = this.noteOrThrow(domain, request.id);
		return this.mutate(async () => {
			const next = {
				...note,
				deletedAt: null,
				updatedAt: Date.now()
			};
			await domain.table("notes").put(note.id, next);
			return next;
		});
	}
	async emptyTrash() {
		await this.initialized;
		const domain = await this.domain;
		return this.mutate(async () => {
			const removed = [...domain.table("notes").entries()].filter(([, note]) => note.deletedAt !== null).map(([id]) => id);
			if (removed.length > 0) await domain.table("notes").deleteMany(removed);
			return { removed };
		});
	}
	async createFolder(request) {
		await this.initialized;
		const name = request.name.trim().slice(0, MAX_FOLDER_NAME);
		if (name.length === 0) throw new Error("文件夹名称不能为空");
		const domain = await this.domain;
		if (folderByName(domain, name) !== void 0) throw new Error(`\u6587\u4EF6\u5939\u300C${name}\u300D\u5DF2\u5B58\u5728`);
		return this.mutate(async () => {
			let order = 0;
			for (const [, folder] of domain.table("folders").entries()) order = Math.max(order, folder.order + 1);
			const record = {
				id: randomUUID(),
				name,
				emoji: (request.emoji ?? "📁").slice(0, 8),
				color: normalizeColor(request.color),
				order,
				builtin: false
			};
			await domain.table("folders").put(record.id, record);
			return record;
		});
	}
	async updateFolder(request) {
		await this.initialized;
		const domain = await this.domain;
		const folder = domain.table("folders").get(request.id);
		if (folder === void 0) throw new Error(`\u6587\u4EF6\u5939 ${request.id} \u4E0D\u5B58\u5728`);
		const patch = request.patch;
		if (patch.name !== void 0) {
			const name = patch.name.trim().slice(0, MAX_FOLDER_NAME);
			if (name.length === 0) throw new Error("文件夹名称不能为空");
			const clash = folderByName(domain, name);
			if (clash !== void 0 && clash.id !== folder.id) throw new Error(`\u6587\u4EF6\u5939\u300C${name}\u300D\u5DF2\u5B58\u5728`);
		}
		return this.mutate(async () => {
			const next = {
				...folder,
				name: patch.name === void 0 ? folder.name : patch.name.trim().slice(0, MAX_FOLDER_NAME),
				emoji: patch.emoji === void 0 ? folder.emoji : patch.emoji.slice(0, 8),
				color: patch.color === void 0 ? folder.color : normalizeColor(patch.color)
			};
			await domain.table("folders").put(folder.id, next);
			return next;
		});
	}
	async deleteFolder(request) {
		await this.initialized;
		const domain = await this.domain;
		const folder = domain.table("folders").get(request.id);
		if (folder === void 0) throw new Error(`\u6587\u4EF6\u5939 ${request.id} \u4E0D\u5B58\u5728`);
		if (folder.builtin) throw new Error("内置文件夹不能删除");
		return this.mutate(async () => {
			const inbox = inboxFolder(domain);
			let moved = 0;
			for (const [id, note] of domain.table("notes").entries()) if (note.folderId === folder.id) {
				await domain.table("notes").put(id, {
					...note,
					folderId: inbox.id
				});
				moved += 1;
			}
			await domain.table("folders").delete(folder.id);
			return { moved };
		});
	}
	async exportWall(request) {
		await this.initialized;
		const domain = await this.domain;
		const folders = [...domain.table("folders").entries()].map(([, row]) => row).sort((a, b) => a.order - b.order);
		const live = liveNotes(domain).sort((a, b) => a.updatedAt - b.updatedAt);
		const stamp = formatStamp(Date.now()).replace(/[- :]/g, "");
		if (request.format === "json") return {
			content: JSON.stringify({
				exportedAt: Date.now(),
				folders,
				notes: live
			}, null, 2),
			filename: `sticky-wall-${stamp}.json`
		};
		const lines = ["# 便签墙导出", ""];
		for (const folder of folders) {
			const notes = live.filter((note) => note.folderId === folder.id);
			if (notes.length === 0) continue;
			lines.push(`## ${folder.emoji} ${folder.name}`, "");
			for (const note of notes) {
				const flags = [note.pinned ? "📌" : "", note.struck ? "✅" : ""].filter(Boolean).join(" ");
				const suffix = flags.length > 0 ? ` ${flags}` : "";
				lines.push(`- **${formatStamp(note.updatedAt)}**${suffix} ${note.text.replace(/\n/g, " ")}`);
			}
			lines.push("");
		}
		return {
			content: lines.join("\n"),
			filename: `sticky-wall-${stamp}.md`
		};
	}
	async restoreSnapshot(request) {
		await this.initialized;
		const domain = await this.domain;
		const snapshot = domain.table("snapshots").get(request.id);
		if (snapshot === void 0) throw new Error(`\u5FEB\u7167 ${request.id} \u4E0D\u5B58\u5728`);
		await this.mutate(async () => {
			const payload = JSON.parse(snapshot.payload);
			await domain.table("folders").deleteMany([...domain.table("folders").keys()]);
			await domain.table("notes").deleteMany([...domain.table("notes").keys()]);
			const writes = [];
			for (const folder of payload.folders) writes.push(domain.table("folders").put(folder.id, folder));
			for (const note of payload.notes) writes.push(domain.table("notes").put(note.id, note));
			await Promise.all(writes);
		});
		return this.stateValue(domain);
	}
	async saveImage(request) {
		await this.initialized;
		const dataUrl = request.dataUrl;
		if (!dataUrl.startsWith("data:image/")) throw new Error("只接受 data:image/* 图片");
		if (dataUrl.length > MAX_IMAGE_DATA_URL) throw new Error("图片过大（上限约 3MB）");
		const domain = await this.domain;
		const id = randomUUID();
		const record = {
			id,
			dataUrl,
			createdAt: Date.now()
		};
		await this.exclusive(async () => {
			await domain.table("images").put(id, record);
		});
		return record;
	}
	async image(request) {
		await this.initialized;
		const record = (await this.domain).table("images").get(request.id);
		if (record === void 0) throw new Error(`\u56FE\u7247 ${request.id} \u4E0D\u5B58\u5728`);
		return record;
	}
	async attachImages(request) {
		await this.initialized;
		const domain = await this.domain;
		const note = this.noteOrThrow(domain, request.id);
		const images = domain.table("images");
		const additions = request.imageIds.filter((imageId) => images.get(imageId) !== void 0);
		return this.mutate(async () => {
			const next = {
				...note,
				images: [...note.images, ...additions].slice(0, MAX_NOTE_IMAGES),
				updatedAt: Date.now()
			};
			await domain.table("notes").put(note.id, next);
			return next;
		});
	}
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "syncRead", _syncRead_dec, StickyWallService);
__decorateElement(_init, 1, "syncApply", _syncApply_dec, StickyWallService);
__decorateElement(_init, 1, "state", _state_dec, StickyWallService);
__decorateElement(_init, 1, "createNote", _createNote_dec, StickyWallService);
__decorateElement(_init, 1, "updateNote", _updateNote_dec, StickyWallService);
__decorateElement(_init, 1, "moveNote", _moveNote_dec, StickyWallService);
__decorateElement(_init, 1, "deleteNote", _deleteNote_dec, StickyWallService);
__decorateElement(_init, 1, "restoreNote", _restoreNote_dec, StickyWallService);
__decorateElement(_init, 1, "emptyTrash", _emptyTrash_dec, StickyWallService);
__decorateElement(_init, 1, "createFolder", _createFolder_dec, StickyWallService);
__decorateElement(_init, 1, "updateFolder", _updateFolder_dec, StickyWallService);
__decorateElement(_init, 1, "deleteFolder", _deleteFolder_dec, StickyWallService);
__decorateElement(_init, 1, "exportWall", _exportWall_dec, StickyWallService);
__decorateElement(_init, 1, "restoreSnapshot", _restoreSnapshot_dec, StickyWallService);
__decorateElement(_init, 1, "saveImage", _saveImage_dec, StickyWallService);
__decorateElement(_init, 1, "image", _image_dec, StickyWallService);
__decorateElement(_init, 1, "attachImages", _attachImages_dec, StickyWallService);
__decoratorMetadata(_init, StickyWallService);
__publicField(StickyWallService, "inject", ["storageDomain", "tools"]);
__publicField(StickyWallService, "Config", z.object({
	/** Retained recent-snapshot ceiling; the ring prunes oldest-first. */
	recentSnapshots: z.number().step(1).min(1).max(100).default(20),
	/** Retained daily-snapshot ceiling; one per local day, oldest-first pruning. */
	dailySnapshots: z.number().step(1).min(1).max(31).default(7)
}));
function folderById(domain, id) {
	return domain.table("folders").get(id);
}
function folderByName(domain, name) {
	for (const [, folder] of domain.table("folders").entries()) if (folder.name === name) return folder;
}
function inboxFolder(domain) {
	for (const [, folder] of domain.table("folders").entries()) if (folder.builtin) return folder;
	return {
		id: "收纳盒",
		name: "收纳盒",
		emoji: "🗂️",
		color: "blue",
		order: -1,
		builtin: true
	};
}
function liveNotes(domain) {
	return [...domain.table("notes").entries()].map(([, row]) => row).filter((note) => note.deletedAt === null);
}
var stdin_default = StickyWallService;
export { StickyWallService, stdin_default as default, stickyWallDomain, stickyWallRemote };
