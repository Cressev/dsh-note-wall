# dsh-sticky-wall

A persistent note wall for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): pin work notes, memos and ideas in folders, search them, roll back a mistake, and let the agent read and write them for you.

## What it does

- **Folders and notes.** Coloured notes in per-topic folders with pin, strike-through, move and delete. Deleting sends a note to the trash, so nothing is lost by accident.
- **Rollback.** Every mutation retains a snapshot first — a rolling `recent` ring plus a daily ring — so the panel can restore the wall to an earlier state.
- **Model tools.** `sticky_note_add`, `sticky_note_list` and `sticky_note_search` let the agent save what you asked it to remember and look it up again later. Tool-written notes are indistinguishable from hand-written ones.
- **Quick capture.** A floating capture box for adding a note without leaving the conversation.
- **Search and export.** Full-text search across note bodies, plus Markdown or JSON export of the whole wall.

## Install

```sh
dsh plugin --profile web add dsh-sticky-wall
```

Restart `dsh web`, reload the page, and the **sticky wall** entry appears in the left sidebar.

From a checkout instead of npm:

```sh
git clone https://github.com/Cressev/dsh-sticky-wall.git
dsh plugin --profile web add /absolute/path/to/dsh-sticky-wall
```

## Compatibility

- Requires DeepSeek Harness `0.2.1-rc.5` or newer (`0.2.x`); `engines.dsh` declares the range.
- Web profile only (the wall is a browser panel).
- Notes live in the profile's local storage domain `sticky_wall`; nothing leaves the machine.

## Storage

One storage domain holds three tables: folders, notes (with `deletedAt` tombstones), and snapshots. The builtin folder is seeded on first open and cannot be deleted; deleting a folder moves its notes rather than deleting them.

## Development

```sh
pnpm install
pnpm build        # lib/index.mjs, lib/remote.mjs, lib/client.js
pnpm typecheck
```

## Licence

MIT
