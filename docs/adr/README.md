# Architecture decision records

Significant decisions in NovaNotes, one per file, numbered in the order they were made. [ADR 0000](0000-record-architecture-decisions.md) explains the format and why the log starts in September 2026.

- | ADR | Decision | Status |
- | --- | --- | --- |
- [0000: Record architecture decisions](0000-record-architecture-decisions.md)
- [0001: Use generated UUIDs for note identity](0001-use-generated-uuids-for-note-identity.md) (superseded by 0006)
- [0002: Migrate to TypeScript and enable strict mode one flag at a time](0002-migrate-to-typescript-with-strict-mode.md)
- [0003: Do not write a note back to disk when it is only opened](0003-do-not-write-notes-when-they-are-only-opened.md) (superseded by 0011)
- [0004: Keep frontmatter out of the editor](0004-keep-frontmatter-out-of-the-editor.md)
- [0005: Add tests before risky refactors](0005-add-tests-before-risky-refactors.md)
- [0006: Use the file path as note identity](0006-use-the-file-path-as-note-identity.md)
- [0007: Build a notes app for technical work](0007-build-a-notes-app-for-technical-work.md)
- [0008: Storage layout for attachments and app data](0008-storage-layout.md)
- [0009: Target hundreds of notes with an in-memory index](0009-target-hundreds-of-notes-with-an-in-memory-index.md)
- [0010: Write notes atomically](0010-write-notes-atomically.md)
- [0011: Replace Milkdown with CodeMirror 6](0011-replace-milkdown-with-codemirror-6.md)
- [0012: The preview may differ from CommonMark, the file may not](0012-preview-may-differ-from-commonmark-the-file-may-not.md)
- [0013: Serialize note saves and wait for them before renaming or closing](0013-serialize-note-saves.md)
