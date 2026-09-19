# Architecture decision records

Significant decisions in NovaNotes, one per file, numbered in the order they were made. [ADR 0000](0000-record-architecture-decisions.md) explains the format and why the log starts in September 2026.

| ADR                                                                 | Decision                                                          | Status             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------ |
| [0000](0000-record-architecture-decisions.md)                       | Record architecture decisions                                     | Accepted           |
| [0001](0001-use-generated-uuids-for-note-identity.md)               | Use generated UUIDs for note identity                             | Superseded by 0006 |
| [0002](0002-migrate-to-typescript-with-strict-mode.md)              | Migrate to TypeScript and enable strict mode one flag at a time   | Accepted           |
| [0003](0003-do-not-write-notes-when-they-are-only-opened.md)        | Do not write a note back to disk when it is only opened           | Superseded by 0011 |
| [0004](0004-keep-frontmatter-out-of-the-editor.md)                  | Keep frontmatter out of the editor                                | Accepted           |
| [0005](0005-add-tests-before-risky-refactors.md)                    | Add tests before risky refactors                                  | Accepted           |
| [0006](0006-use-the-file-path-as-note-identity.md)                  | Use the file path as note identity                                | Accepted           |
| [0007](0007-build-a-notes-app-for-technical-work.md)                | Build a notes app for technical work                              | Accepted           |
| [0008](0008-storage-layout.md)                                      | Storage layout for attachments and app data                       | Accepted           |
| [0009](0009-target-hundreds-of-notes-with-an-in-memory-index.md)    | Target hundreds of notes with an in-memory index                  | Accepted           |
| [0010](0010-write-notes-atomically.md)                              | Write notes atomically                                            | Accepted           |
| [0011](0011-replace-milkdown-with-codemirror-6.md)                  | Replace Milkdown with CodeMirror 6                                | Accepted           |
| [0012](0012-preview-may-differ-from-commonmark-the-file-may-not.md) | The preview may differ from CommonMark, the file may not          | Accepted           |
| [0013](0013-serialize-note-saves.md)                                | Serialize note saves and wait for them before renaming or closing | Accepted           |
