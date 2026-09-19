# 5. Add tests before risky refactors

- Status: Accepted
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

The project had no automated tests. The hardest bugs so far had been subtle state problems that manual testing only caught late. The frontmatter regex failed on CRLF input, and because the code under test rewrote its own test file, three rounds of manual testing measured stale files before the bug was found.

The next planned changes, a new note identity model and a new editor, were riskier than anything before them.

## Decision

Add Vitest and cover the store before changing note identity or the editor. Pure functions are tested directly, and store logic is tested with the Electron IPC layer replaced by mocks on `window`. CI runs the tests and `svelte-check` on every pull request.

## Consequences

- The identity change (ADR 0006) was made against tests covering renames, cache re-keying and tab updates.
- Bug fixes start with a test that fails without the fix. This became the normal way to work.
- Svelte components are not unit tested. Changes to widgets and the editor DOM still need checking in the running app.
