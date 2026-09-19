# 12. The preview may differ from CommonMark, the file may not

- Status: Accepted
- Date: 2026-09-18
- Recorded: 2026-09-19

## Context

While building live preview, some CommonMark rules gave results that were confusing to type. The clearest case was emphasis: runs such as `***` and emphasis next to other delimiters can be read in ways that do not match what the writer meant, and Obsidian, which I use as the reference for editor behaviour, does not follow the spec exactly either.

## Decision

The editor may show a note differently from what CommonMark specifies, and it may insert text in direct response to a keystroke, such as closing a bracket or continuing a list. It never changes text the user did not touch, and it never changes what the file means.

For emphasis, the number of opening delimiters sets the style, up to three, and a closing run only counts if it is at least that long.

## Consequences

- The file on disk is always exactly what the user typed, and other markdown tools read it according to their own rules.
- In edge cases, another markdown viewer may render a note slightly differently from the NovaNotes preview.
- Behaviour choices like this one are made against how typing feels, not against the spec alone.
