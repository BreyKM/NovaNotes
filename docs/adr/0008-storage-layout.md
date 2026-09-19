# 8. Storage layout for attachments and app data

- Status: Accepted
- Date: 2026-09-14
- Recorded: 2026-09-19

## Context

Attachments and app data do not exist yet, but where they go affects note identity, links and what users see in their notebook folder, so I decided the layout before building either.

## Decision

- Attachments go in a visible `attachments/` folder at the notebook root. Notes link to them with relative markdown links rather than `![[embeds]]`, and file names get a timestamp so they do not collide. The folder is visible because attachments are the user's content.
- Data the app generates goes in a hidden `.novanotes/` folder. Everything in it must be safe to delete: the app rebuilds it and nothing is lost.
- Where a piece of data lives follows one rule. Data derived from the notes goes in the `.novanotes/` cache. The user's intent about a note, such as tags or aliases, goes in that note's frontmatter. App and session state goes in the app's own settings store.

## Consequences

- Attachment links work in any markdown tool and still work after notes are renamed.
- Deleting a note can leave unused attachments behind, so a cleanup command will be needed.
- A notebook folder stays readable without NovaNotes. Deleting `.novanotes/` costs only rebuild time.
