# 13. Serialize note saves and wait for them before renaming or closing

- Status: Accepted
- Date: 2026-09-18

## Context

Autosave was a lodash `throttle` with a two second trailing call. Each call started `writeNote` and returned without waiting for it, so nothing in the app could find out whether the latest edits were on disk.

That caused two bugs and one latent problem:

- Renaming a note within two seconds of typing let the queued save run afterwards under the old title, which recreated the old file next to the renamed one. Flushing the throttle first was not enough. The flushed write still ran in parallel with the rename, and the main process could handle the rename between the write's temp file step and its final rename.
- The window's close button called `app.quit()` directly, which dropped any save still waiting in the throttle. Closing with Alt+F4 or from the taskbar had the same problem.
- Two writes to the same note could overlap. Atomic writes use a fixed `<note>.md.tmp` path, so overlapping writes could interfere with each other's temp file.

## Decision

Every note write goes through one queue in `Store.ts`. Each write is chained onto the promise of the previous one, so writes run one at a time in the order they were requested. A failed write is logged and the queue continues.

`saveNow()` flushes the throttle and resolves once every queued write has finished. Operations that change where a note lives or end the session await it first. Currently that is renaming a note and closing the window.

Closing uses a handshake between the two processes. The main process cancels the window's `close` event and sends `saveBeforeClose` to the renderer. The renderer awaits `saveNow()` and replies `readyToClose`, and the main process then calls `destroy()`, which skips the `close` event so the handler does not intercept its own close. If the renderer has not replied after five seconds, the main process destroys the window anyway.

The throttle stays. Typing still writes at most once every two seconds.

## Consequences

- Renaming and closing can no longer lose edits or recreate an old file.
- Future operations that move, delete or stop using a note (deleting notes, folders, switching notebooks) have one function to await first.
- Tests await `saveNow()` instead of relying on `flush()` to write synchronously.
- A slow write delays everything queued behind it, including a rename or a close. For local markdown files this is a few milliseconds.
- A failed save is only logged. It is not retried and the user is not told. Showing save errors is left for later.
- If the renderer hangs, closing takes five seconds and anything not yet saved is lost.
- The queue is module state, so it is shared between tests. The store tests release any write they hold back in `afterEach`, so one failing test cannot block the rest.

## Alternatives considered

- **Flush the throttle before renaming.** This starts the pending write but does not wait for it, so the rename and the write can still interleave in the main process.
- **Save in a `beforeunload` handler.** These handlers cannot wait for async work, so the save would be cut off when the window closes.
- **A unique temp file name per write.** This fixes the temp file collision but not the ordering, and it does nothing for renaming or closing.
- **Move autosave into the main process.** The main process owns the files and could order writes itself. It is a larger change that moves editor state across the process boundary, and the renderer would still need to hand over its last edits before closing. It may be worth revisiting if other windows ever write notes.
