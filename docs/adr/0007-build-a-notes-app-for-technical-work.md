# 7. Build a notes app for technical work

- Status: Accepted
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

My feature list for NovaNotes had grown to cover most of what Obsidian does, from graph view and canvas to theming, sync and a plugin system. Without a focus there was no way to decide what to build first or what to leave out, and building all of it would take years.

## Decision

NovaNotes is a notes app for technical work. Features that serve that come first: math, Mermaid diagrams, code blocks, search that understands code, and semantic search. In Obsidian these need community plugins.

That focus led to these cuts:

- Graph view is cut. Under about a hundred notes it shows nothing new, and over a thousand it becomes unreadable. The useful part, a note's direct neighbours, is a backlinks list.
- Canvas is cut. It would be a second application with its own file format, and Mermaid covers system diagrams as plain text.
- A theming engine and an activity heatmap are cut. There will be one dark and one light theme.
- Git sync becomes a single commit and push command. The target users can set up a repository themselves.
- Cloud sync and an iOS app are out of scope.
- An AI assistant would be an MCP server rather than a chat panel inside the app, and extensibility means internal feature modules behind a command registry rather than a public plugin API.

## Consequences

- New feature ideas are judged against this focus, which makes most of them easy to accept or decline.
- Some features Obsidian users expect will not exist. An importer for Obsidian vaults may come later, but live compatibility is not a goal.
- Running code blocks is still undecided. It fits the focus but competes with Jupyter and VS Code, and running code from imported notes raises security questions.
