# 11. Replace Milkdown with CodeMirror 6

- Status: Accepted
- Supersedes: [ADR 0003](0003-do-not-write-notes-when-they-are-only-opened.md)
- Date: 2026-09-15
- Recorded: 2026-09-19

## Context

Milkdown parses markdown into a ProseMirror document and serializes it back through remark when saving. Round-trip tests showed that this rewrites files: it escapes characters, converts link syntax and normalizes formatting the user never touched. ADR 0003 stopped this from happening when a note was only opened, but any edit still rewrote the whole file.

Other features I wanted also fit badly with Milkdown: a source mode, heading folding, Vim keybindings and fast handling of long notes. I also found the schema, parser and serializer layers hard to understand and debug, which made every custom syntax a large piece of work.

## Decision

Replace Milkdown with CodeMirror 6. The document is the markdown text itself. Live preview is built from decorations that hide markup and style text when the cursor is elsewhere, without changing the text. The new editor was added in one pull request and Milkdown was removed in the next.

I considered adding more guards and plugins to Milkdown, and switching to Tiptap. Tiptap is also built on ProseMirror, so it has the same round-trip problem.

## Consequences

- Notes round-trip byte for byte, and opening or editing a note never rewrites text the user did not change. The guard from ADR 0003 is no longer needed.
- Live preview is my own code: headings, emphasis, links, lists, indentation guides and code blocks. That is more code to own, but each piece is a small module with its own tests.
- Tables are shown as source for now.
- Folding, math, Mermaid and wikilinks are straightforward to add, because each is a decoration or widget over plain text.
