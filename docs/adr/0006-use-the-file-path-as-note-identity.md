# 6. Use the file path as note identity

- Status: Accepted
- Supersedes: [ADR 0001](0001-use-generated-uuids-for-note-identity.md)
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

The UUID index from ADR 0001 was a second source of truth. Notes renamed outside the app lost their id, and every create and rename had to update both the file and the index. `NoteMeta.id` was already an opaque string, so the code that uses ids did not depend on them being UUIDs.

I considered three options:

- Keep the index.
- Store a UUID in each note's frontmatter. This writes app data into every note and changes files the user did not edit.
- Use the file path as the id.

## Decision

A note's id is its path relative to the notebook. Notebooks are flat for now, so this is the filename. The index file and the code that maintained it are deleted.

## Consequences

- There is one source of truth, the files themselves. A rename done outside the app looks like one note being deleted and another created, which matches what the user sees in the folder.
- Renaming a note changes its id. The new id has to reach the notes list, the content and frontmatter caches, the selection and every open tab. Tests cover each of these.
- Because every rename now re-keys that state, the title field renames the file only on blur or Enter, not after a pause in typing.
- Renaming a note to a different case of the same name, such as `note` to `Note`, is not handled yet on Windows and macOS, where the filesystem treats both names as the same file.
