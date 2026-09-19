# 0. Record architecture decisions

- Status: Accepted
- Date: 2026-09-19

## Context

NovaNotes started in June 2025 as an Electron, Svelte and Tailwind app. The editor moved from Tiptap to Milkdown within the first month. None of those choices were written down, and I no longer remember all of the reasons behind them.

In September 2026 I started a larger refactor: TypeScript, tests, CI, a new note identity model and a new editor. Those decisions had real alternatives and trade-offs, and the reasoning behind them is easy to lose once the code is merged.

## Decision

I record significant decisions as architecture decision records in `docs/adr/`, one file per decision, numbered in the order the decisions were made. Each record has a status, the date of the decision, the context, the decision and its consequences.

A record is not edited after it is accepted, apart from its status. When a decision is reversed, the new decision gets its own record and the old one is marked as superseded by it.

ADRs 0001 to 0012 were written after the fact, from commit messages, pull requests and my notes from the time. Each one gives the date the decision was made and the date it was recorded.

## Consequences

- The log starts in September 2026. Earlier choices (Electron, Svelte, Tailwind and the original Milkdown editor) are treated as the starting point and have no records, because I would be guessing at the reasons.
- From ADR 0013 onwards, records are written when the decision is made.
