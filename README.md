# dsh-note-wall

A persistent note wall for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): pin work notes, memos and ideas in folders, search them, roll back a mistake, and let the agent read and write them for you.

## What it does

- **Folders and notes.** Coloured notes in per-topic folders with pin, strike-through, move and delete. Deleting sends a note to the trash, so nothing is lost by accident.
- **Rollback.** Every mutation retains a snapshot first — a rolling `recent` ring plus a daily ring — so the panel can restore the wall to an earlier state.
- **Model tools.** `sticky_note_add`, `sticky_note_list` and `sticky_note_search` let the agent save what you asked it to remember and look it up again later. Tool-written notes are indistinguishable from hand-written ones.
- **Quick capture.** A floating capture box for adding a note without leaving the conversation.
- **Search and export.** Full-text search across note bodies, plus Markdown or JSON export of the whole wall.

## Install

Install this synchronization branch (the npm package is not published yet):

```sh
dsh plugin --profile web add 'github:Cressev/dsh-note-wall#feature/supabase-sync'
```

Restart `dsh web`, reload the page, and the **sticky wall** entry appears in the left sidebar.

> **Name note:** the npm name `dsh-sticky-wall` belongs to an unrelated third-party
> plugin. This package is `dsh-note-wall`; installing `dsh-sticky-wall` by name gets
> that other plugin, not this one.

From a local checkout:

```sh
git clone https://github.com/Cressev/dsh-note-wall.git
dsh plugin --profile web add /absolute/path/to/dsh-note-wall
```

## Compatibility

- Requires DeepSeek Harness `0.2.1-rc.5` or newer (`0.2.x`); `engines.dsh` declares the range.
- Web and desktop profiles using the browser panel.
- Notes live in the local storage domain `sticky_wall`. When cloud sync is enabled and signed in, notes, folders and images also sync to the configured Supabase project.

## Cloud sync

Sign in from the cloud-sync button on the note wall and use the same sync account on each device. The client checks for changes approximately every five seconds while the app is running, and retries after disconnection. Existing notes from each device are merged. Concurrent note edits are retained as conflict copies; conflicting folder operations stop synchronization instead of overwriting data.

This branch is configured for the owner's Supabase project. `src/client/sync-controller.ts` contains its project URL and **publishable** key; neither a Supabase secret key nor a service-role key belongs in client code. A publishable key identifies the project and is visible to anyone using this public repository. Users wishing to host their own instance must configure their own project URL and publishable key, apply `supabase-sync.sql` to their own project, and rebuild the client. The SQL enables row-level security and an authenticated compare-and-swap function; it must be applied separately from installing the plugin.

Notes and images are stored in Supabase without application-level end-to-end encryption. Session tokens are stored in the desktop webview's local storage. Local baseline copies for conflict detection are kept in IndexedDB. Back up existing note data before installing the plugin on another device. Upload of a test note from one desktop has been verified; two physical devices have not yet been tested together.

`sync-merge.test.ts`, `sync-controller.test.ts`, and `sync-journal.test.mjs` cover merging, simulated two-device/offline synchronization, and local recovery; they do not replace a real two-device test. `note-format.test.ts` checks single-line toggles, rapid repeated clicks, and explicit multi-line selections.

## Storage

One storage domain holds three tables: folders, notes (with `deletedAt` tombstones), and snapshots. The builtin folder is seeded on first open and cannot be deleted; deleting a folder moves its notes rather than deleting them.

## Development

```sh
pnpm install
pnpm build        # lib/index.mjs, lib/remote.mjs, lib/client.js
pnpm typecheck
node --import tsx/esm --test sync-merge.test.ts sync-controller.test.ts sync-journal.test.mjs
node --import tsx/esm --test note-format.test.ts
```

## Licence

MIT
