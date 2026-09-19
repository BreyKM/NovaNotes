# 3. Do not write a note back to disk when it is only opened

- Status: Superseded by [ADR 0011](0011-replace-milkdown-with-codemirror-6.md)
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

Loading a note into Milkdown called `replaceAll`, which the change listener could not tell apart from a user edit, so the note was serialized straight back to disk. Milkdown's remark serializer normalizes markdown, so just opening a note reformatted it. It escaped `[[wikilinks]]` and LaTeX underscores, converted autolinks and destroyed YAML frontmatter.

## Decision

When a note is loaded, keep the editor's serialization of it. The change listener compares each new serialization with that one and skips the save when they are identical. Comparing serialized output with serialized output works even though Milkdown fires the listener after a delay rather than immediately.

## Consequences

- Opening a note no longer changes the file.
- Editing a note still runs the whole document through remark, so the first edit could still rewrite unrelated parts of the file. This guard treated the symptom. Fixing the cause meant replacing the editor, which ADR 0011 does.
