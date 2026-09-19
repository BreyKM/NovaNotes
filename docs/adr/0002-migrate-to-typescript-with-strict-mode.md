# 2. Migrate to TypeScript and enable strict mode one flag at a time

- Status: Accepted
- Date: 2026-09-13
- Recorded: 2026-09-19

## Context

The codebase was JavaScript with no type checking. Note and tab objects are passed between the Electron main process and the renderer, and nothing checked that both sides agreed on their shape.

## Decision

Convert the whole codebase to TypeScript: the Electron main process first, then the store, then components from the leaf components upward. Types shared by both processes, such as `NoteMeta` and `Tab`, live in `shared/types.d.ts`.

Turn on strict mode one flag at a time, each in its own commit, and replace the individual flags with `"strict": true` once all eight pass.

## Consequences

- Each strict flag produced a small set of errors that could be traced to that flag. `strictNullChecks` found functions that were only partly guarded against null values: `handleNoteSelect`, `updateNoteContent` and `createNotebookDir`.
- Converting the store found an autosave that could write to the wrong note and a selection tracked by array index that went stale when the list re-sorted. Both were fixed during the migration.
- The Electron code has its own tsconfig and compiles to `.cjs`. CI did not type-check it until a separate `check:electron` step was added later.
