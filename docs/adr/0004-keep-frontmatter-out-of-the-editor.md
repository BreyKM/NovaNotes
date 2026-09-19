# 4. Keep frontmatter out of the editor

- Status: Accepted
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

remark, which Milkdown used to parse markdown, has no frontmatter support. It read the opening `---` as a thematic break, escaped the values, and turned the closing `---` into a setext underline that made the block a heading. The metadata could not be recovered.

## Decision

Split frontmatter off when a note is read and attach it again when the note is written. The editor only ever sees the body. The split lives in `splitFrontmatter` in the store, and each note's frontmatter is kept in a map keyed by note id.

The alternative was adding `remark-frontmatter` and a matching editor node. That adds a dependency, and the frontmatter would still pass through the editor's serializer.

## Consequences

- Frontmatter is kept byte for byte. A test checks that frontmatter plus body always equals the original file, including files with CRLF line endings.
- The editor cannot show or edit frontmatter. A properties panel above the document is the planned place for that, not text inside the editor.
- The approach did not depend on Milkdown and needed no changes when the editor was replaced (ADR 0011).
