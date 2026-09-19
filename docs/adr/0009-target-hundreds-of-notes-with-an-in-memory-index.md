# 9. Target hundreds of notes with an in-memory index

- Status: Accepted
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

Backlinks, tags, aliases and search all need an index of the notebook. SQLite, worker threads and a virtualized note list would support very large notebooks, but each adds a dependency and complexity to build and test. NovaNotes is a portfolio project that friends and a small group of users may also use, so the realistic size of a notebook is hundreds of notes.

## Decision

Design for hundreds of notes. When the index is built it will live in memory behind an interface, so it can be replaced by a SQLite-backed version later without changing the code that uses it. SQLite, workers and virtualization are deferred until a real notebook needs them.

## Consequences

- The first version of the index is simpler to build, test and debug.
- Every launch will rebuild the index by reading the whole notebook. That is fast at this size and gets slower as notebooks grow.
- The interface is the part that has to be right the first time. The storage behind it can change.
- Nothing in this record is built yet. The app currently keeps only the note list in memory.
