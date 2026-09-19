# 10. Write notes atomically

- Status: Accepted
- Date: 2026-09-15
- Recorded: 2026-09-19

## Context

`writeFile` wrote straight over the note, so a crash or power loss partway through a save left the note truncated.

## Decision

Each save writes the full content to a temporary file next to the note, then renames the temporary file over the note. The temporary file is in the same directory because a rename is only atomic within one filesystem.

## Consequences

- A note on disk is always either the old version or the new one, never half of each. If the rename fails, the original is left untouched.
- The temporary file has a fixed name, `<note>.md.tmp`, so two overlapping saves of the same note could interfere with each other. ADR 0013 fixes this by running saves one at a time.
- On Windows a rename can fail while another program, such as antivirus or a sync client, has the note open. The save then fails and is logged, and the note keeps its previous content.
