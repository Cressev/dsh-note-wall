# dsh-note-wall

A persistent note wall for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): pin work notes, memos and ideas in folders, search them, roll back a mistake, sync them across machines, and let the agent read and write them for you.

## What it does

- **Folders and notes.** Coloured notes in per-topic folders with pin, strike-through, move and delete. Deleting sends a note to the trash, so nothing is lost by accident.
- **Two layouts.** A candy sticky-note wall (masonry, each card sized by its own content) or a compact list with one-line summaries and todo progress. The choice is remembered per browser.
- **Markdown notes.** Headings, bold, italic, strikethrough, inline code, unordered/ordered lists, and todo lists whose checkboxes are clickable — in the card, in the preview pane, and when editing.
- **Editing in a dialog.** Click a note to open an editor with a formatting toolbar, an edit/preview switch, colour and folder pickers, and image attachments.
- **Pasted images.** Paste a screenshot straight into the new-note dialog or an existing note; thumbnails render on the card and open in a lightbox.
- **Ordered by creation.** Notes keep their creation order when edited, and each card shows both the creation and (once it differs) the last-edit time.
- **Rollback.** Every mutation retains a snapshot first — a rolling `recent` ring plus a daily ring — so the panel can restore the wall to an earlier state.
- **Model tools.** `sticky_note_add`, `sticky_note_list` and `sticky_note_search` let the agent save what you asked it to remember and look it up again later. Tool-written notes are indistinguishable from hand-written ones.
- **Quick capture.** `⌘/Ctrl+Shift+N` opens a floating capture box; selecting text in an assistant reply also offers "pin to wall", with a link back to the conversation.
- **Cloud sync.** Optional Supabase-backed sync so several machines share one wall (see below).
- **Search and export.** Full-text search across note bodies, plus Markdown or JSON export of the whole wall.

## Install

Install from GitHub (this is not published to npm):

```sh
dsh plugin --profile web add 'github:Cressev/dsh-note-wall'
```

Restart `dsh web`, reload the page, and the **note wall** entry appears in the left sidebar.

From a local checkout:

```sh
git clone https://github.com/Cressev/dsh-note-wall.git
dsh plugin --profile web add /absolute/path/to/dsh-note-wall
```

### Trying it from the source tree instead

When developing the plugin itself, mount the source entry through a profile patch instead of installing a package:

```yaml
# ~/.dsh/profiles/web/cordis.patch.yml
- insert:
    - id: sticky-wall
      name: '/absolute/path/to/dsh-note-wall/src/index.ts'
```

Changes under `src/client/` reach the browser on a page reload; anything under `src/index.ts`, `src/remote.ts` or `src/storage.ts` needs `dsh web` restarted, because those are host-side.

> **Name note:** the npm name `dsh-sticky-wall` belongs to an unrelated third-party
> plugin. This package is `dsh-note-wall`; installing `dsh-sticky-wall` by name gets
> that other plugin, not this one.

## Compatibility

- Requires DeepSeek Harness `0.2.1-rc.5` or newer (`0.2.x`); `engines.dsh` declares the range.
- Web and desktop profiles using the browser panel.
- Notes live in the local storage domain `sticky_wall` (`~/.dsh/storages/sticky_wall.json`). When cloud sync is enabled and signed in, folders, notes and images also sync to the configured Supabase project.

## Cloud sync

Open the note wall and press **☁ 未登录云同步** in the toolbar. Create an account (or sign in with the same account you use on your other machine). Once signed in the client checks for changes about every five seconds and retries after a disconnect.

How the merge behaves:

- Existing notes on each machine are merged, not replaced.
- A note edited on both sides is kept twice: the other side's version, plus a `【同步冲突副本】` copy of yours.
- A folder whose name/emoji/colour differs on the two sides takes the cloud version and sync continues.
- A folder deleted on one side while edited on the other **stops** syncing rather than orphaning notes. Fix the folder on one machine and it resumes.
- Only one browser tab per profile runs the sync loop (Web Lock), so several open tabs cannot fight over the same write.

### Running against your own Supabase project

This repository ships the project URL and **publishable** key used by the author (`src/client/sync-controller.ts`). A publishable key identifies the project and is safe to publish; neither a secret key nor a service-role key belongs in client code.

To use your own project:

1. Create a Supabase project.
2. Apply [`supabase-sync.sql`](supabase-sync.sql) in the SQL editor. It creates `public.dsh_note_wall_sync_v1`, enables row-level security, and installs the `dsh_note_wall_compare_and_swap_v1` function that makes writes compare-and-swap.
3. Replace `URL` and `KEY` at the top of `src/client/sync-controller.ts` with your project's values.
4. Rebuild (`pnpm build`) and reinstall/remount the plugin.

### Caveats

- Notes and images are stored in Supabase **without application-level end-to-end encryption**. Do not put secrets in synced notes.
- Sign-in tokens live in the browser's `localStorage`; local baseline copies for conflict detection live in IndexedDB.
- Back up `~/.dsh/storages/sticky_wall.json` before enabling sync on a device that already has notes you care about.

## Storage

One storage domain holds four tables: folders, notes (with `deletedAt` tombstones), images, and snapshots. A separate `sticky_wall_sync_journal` domain records an in-flight sync write so an interrupted apply is replayed on the next start. The builtin folder is seeded on first open and cannot be deleted; deleting a folder moves its notes rather than deleting them.

## Development

```sh
pnpm install
pnpm build        # lib/index.mjs, lib/remote.mjs, lib/client.js
pnpm typecheck
```

Client styles are plain TypeScript modules (`*.styles.ts`) that export a class map and the CSS text, injected once at startup — the bundle carries no CSS imports.

## Licence

MIT
