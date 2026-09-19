# 1. Use generated UUIDs for note identity

- Status: Superseded by [ADR 0006](0006-use-the-file-path-as-note-identity.md)
- Date: 2026-09-12
- Recorded: 2026-09-19

## Context

Notes were identified by their file's inode number from `fs.stat()`. Tabs, the selected note and the content cache all store this id. An inode is a detail of the filesystem rather than something the app controls. It is not kept when a file is copied, it can behave differently on network drives and synced folders, and it changes when a file is replaced by writing a new file and renaming it over the old one.

## Decision

Each note gets a generated UUID the first time the app sees it. A `.novanotes-index.json` file at the notebook root maps note titles to their UUIDs, and the app updates it when a note is created or renamed.

## Consequences

- Note ids no longer depend on the filesystem, and they survive renames made inside the app.
- The index is a second source of truth next to the files. A note renamed outside the app, in Explorer or through git, is missing from the index and gets a new id.
- Creating or renaming a note has to update two things, the file and the index.
