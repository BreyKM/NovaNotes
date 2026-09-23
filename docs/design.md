## NovaNotes design spec

### 1. Principles

1. **Technical, not decorative.** Structure (paths, counts, line numbers, code) is monospace. Prose is not.
2. **One facet, applied consistently.** A single cut corner marks "this is the active or important surface". Same corner, same size, everywhere.
3. **Minimal but reachable.** Nothing is hidden without a visible way back: every collapsed panel keeps its button, every action has a palette entry.
4. **The file is the truth.** Nothing in the interface implies state the files don't have.
5. **One action, one home.** A given action gets one button, plus keyboard and palette access.

### 2. Colour

Values are role tokens. Components never use a raw hex.

#### Dark (default)

| Token                | Value                   | Use                                   |
| -------------------- | ----------------------- | ------------------------------------- |
| `--surface-base`     | `#0C0F13`               | Window ground, behind the panels      |
| `--surface-panel`    | `#13171D`               | Sidebar pane                          |
| `--surface-editor`   | `#171C23`               | Editor panel, active tab              |
| `--surface-sunken`   | `#0F1318`               | Code blocks, inputs, scrollbar track  |
| `--surface-raised`   | `#1B2029`               | Popups, hover rows, chips             |
| `--surface-selected` | `#1B3552`               | Selected row, active tab tint         |
| `--border-subtle`    | `#20262F`               | Dividers inside a panel               |
| `--border`           | `#232B36`               | Default hairline                      |
| `--border-strong`    | `#2B3440`               | Hover, popup edges                    |
| `--danger`           | `#C0362C`               | Failed save (4.7)                     |
| `--text-primary`     | `#E4E9EF`               | Titles, active items (14.0)           |
| `--text-secondary`   | `#C3CBD5`               | Body text (10.5)                      |
| `--text-muted`       | `#8D98A6`               | Labels, inactive icons (5.9)          |
| `--text-faint`       | `#6D7885`               | Decorative only (3.8)                 |
| `--accent`           | `#3A8EE6`               | Links, active icons, keywords (5.1)   |
| `--accent-hover`     | `#529DEE`               | Hover state                           |
| `--accent-fill`      | `#1F6FC4`               | Filled buttons, with white text (5.1) |
| `--accent-quiet`     | `rgba(58,142,230,0.14)` | Tints, selection                      |
| `--scrollbar-thumb`  | `#2F3743`               | Scrollbar                             |

#### Light

| Token                | Value                   | Use                             |
| -------------------- | ----------------------- | ------------------------------- |
| `--surface-base`     | `#E9EDF2`               | Window ground                   |
| `--surface-panel`    | `#F4F6F9`               | Sidebar pane                    |
| `--surface-editor`   | `#FFFFFF`               | Editor panel, active tab        |
| `--surface-sunken`   | `#EEF2F6`               | Code blocks, inputs             |
| `--surface-raised`   | `#FFFFFF`               | Popups (with `--border-strong`) |
| `--surface-selected` | `#D7E8FA`               | Selected row                    |
| `--border-subtle`    | `#E3E8EE`               | Dividers                        |
| `--border`           | `#D9DFE7`               | Default hairline                |
| `--border-strong`    | `#C4CCD6`               | Hover, popup edges              |
| `--text-primary`     | `#17202B`               | (16.4)                          |
| `--text-secondary`   | `#3A4654`               | (9.6)                           |
| `--text-muted`       | `#5B6878`               | (5.7)                           |
| `--text-faint`       | `#7A8595`               | Decorative only (3.7)           |
| `--accent`           | `#1F6FC4`               | (5.1)                           |
| `--accent-hover`     | `#1A5FA8`               |                                 |
| `--accent-fill`      | `#1F6FC4`               | White text (5.1)                |
| `--accent-quiet`     | `rgba(31,111,196,0.12)` |                                 |
| `--scrollbar-thumb`  | `#C4CCD6`               |                                 |

Dark is the default. The theme toggle sits at the bottom of the rail until a settings screen exists; the choice is stored in electron-store and handed to the window as a launch argument, so it is applied before first paint and there is no flash.

**Rule:** `--text-faint` never carries information you must read. Everything else meets 4.5:1 on its own surface.

### 3. Syntax and editor colours

These replace the hard-coded One Dark values in `codeBlocks.ts` and `indentation.ts`, and become CSS variables so both themes work.

| Token                | Dark      | Light     | Applies to                   |
| -------------------- | --------- | --------- | ---------------------------- |
| `--code-keyword`     | `#6FA8F5` | `#1F6FC4` | keywords, operators-as-words |
| `--code-string`      | `#7FC8A9` | `#2F7D5E` | strings                      |
| `--code-number`      | `#E0A46A` | `#A85E17` | numbers, constants, booleans |
| `--code-function`    | `#C9A8F0` | `#6B44B8` | function and method names    |
| `--code-type`        | `#E3C583` | `#8A6A12` | types, classes               |
| `--code-tag`         | `#E0847C` | `#B2483E` | tags, attributes, markup     |
| `--code-comment`     | `#6B7686` | `#7A8595` | comments                     |
| `--code-punctuation` | `#97A3B2` | `#4C5769` | brackets, punctuation        |

**Indentation guides** cycle five hues at ~40% alpha, in this order: accent, string, function, number, tag. Blue leads, so the first indent level matches the app's accent.

### 4. Typography

Red Hat Text and Red Hat Mono, bundled locally through `@fontsource-variable/red-hat-text` and `@fontsource-variable/red-hat-mono`. No network fonts.

| Token          | Size / line-height                                                          | Use                            |
| -------------- | --------------------------------------------------------------------------- | ------------------------------ |
| `--text-label` | 11px / 1.4, mono                                                            | Breadcrumb, chips, pane labels |
| `--text-ui`    | 13px / 1.5                                                                  | All interface text             |
| `--text-body`  | 16px / 1.65                                                                 | Editor prose                   |
| `--text-title` | 28px / 1.3, weight 500                                                      | Note title                     |
| Headings       | h1 1.6em, h2 1.4em, h3 1.25em, h4 1.1em, h5 1em, h6 0.95em of `--text-body` | In-editor headings             |

Weights: 400 for text, 500 for headings and the note title, 600 for bold in prose. Bold also takes `--text-primary` against `--text-secondary` body text, because weight alone is hard to see at 16px. Code in the editor is `--text-body` minus 1px in mono.

### 5. Space, radius, facet

--space-1: 4px --space-2: 6px --space-3: 8px
--space-4: 12px --space-5: 16px --space-6: 24px

--radius-sm: 4px (rows, chips, inputs)
--radius: 6px (panels, code blocks)

--facet: 12px (the cut)
--facet-sm: 5px (small elements: chips, rows, buttons)

**The facet rule.** Cut the **top-right** corner, and only on: the active tab, code blocks, popups, and filled buttons. Everything else uses `--radius`. One utility implements it:

.facet {
clip-path: polygon(
0 0,
calc(100% - var(--facet)) 0,
100% var(--facet),
100% 100%,
0 100%
);
}

Because `clip-path` also clips shadows and outlines, focus on a faceted element is drawn **inside** it with `box-shadow: inset 0 0 0 2px var(--accent)`.

### 6. Layout

--rail-width: 32px
--rail-right-width: 22px
--gap: 6px
--sidebar-width: 220px (resizable 160–420px, remembered)
--editor-width: 46rem (text column inside the editor panel)
--row-height: 30px
--header-height: 32px

Structure, left to right: **left rail → sidebar column → editor column → right rail**, all full height, with `--gap` between them and `--gap` of padding around the whole window.

- **Left rail:** collapse toggle at the top, a divider, then new note, quick switcher, command palette, diagrams. The theme toggle sits at the bottom, where settings will go. On macOS the rail's contents start ~28px lower, below the traffic lights.
- **Sidebar column:** switcher strip (notes, search) on top, then the pane. The pane header holds the notebook name and switcher with the sort control at its right end; the list fills the rest. Dragging the resizer below half the minimum width (80px) collapses the sidebar live, and dragging back reopens it. Collapsing keeps the last width, so reopening restores it.
- **Editor column:** tab strip on top, then the editor panel. The panel has a 1px `--border` outline. The active tab is a matching outline box filled with `--surface-editor`, overlapping the panel's top border by 1px, so tab and panel read as one shape. The panel's top-left corner is square; the other three use `--radius`.
- **Right rail:** outline, backlinks, tags. Its panel, when opened, **pushes** the editor narrower.
- Window controls sit at the right end of the tab strip, flush with the window edge, directly above the right rail. macOS draws none. At least 48px of empty, draggable strip always separates them from the add-tab button, so the window can be moved however many tabs are open.
- **Collapsed sidebar:** the pane and the switcher strip both disappear; only the rail's collapse button remains, and the editor column takes the space. The tab strip gains a 24px draggable gap before the first tab, and the editor panel's top-left corner becomes rounded.
- **Minimum sizes:** the window is at least 640×400 (half of a 1366px screen still fits). The editor column never shrinks below 320px; when space runs out, the sidebar gives way. Its saved width is kept and comes back when the window is wide enough.

Because each column owns its own header, the tab strip always starts at the editor's left edge (plus the drag gap when the sidebar is collapsed), whatever the sidebar's width.

### 7. Components

**Tabs.** Height 32px, text 12px. Active: `--surface-editor`, `--text-primary`, faceted. Inactive: transparent, `--text-muted`, hover `--surface-raised`. Shrink from 180px with no floor. The title clips before the close button does, so the smallest tab is just its close button, and no tab is ever hidden; an overflow dropdown replaces this later. A 1px `--border` hairline separates neighbouring tabs, hidden on the active and hovered tabs. Hovering an inactive tab previews the cut. Closing a tab holds the remaining tabs at their current width until the pointer leaves the strip, so repeated closes don't resize under the cursor; the add-tab button follows the last tab immediately.

**Rail buttons.** 24×24px, icon 17px, `--text-muted`. Hover: `--surface-raised` and `--text-primary`. Active view: `--accent` icon. Tooltip after 500ms, showing the name and shortcut.

**Pane rows.** One line, `--row-height`, radius `--radius-sm`, text `--text-ui`, 2px apart. Hover: `--surface-raised` and, after 400ms, a details popup (title, edited time) anchored to the row's right edge, faceted, `--surface-raised` with `--border-strong`. While a popup is open, moving to another row moves it there at once; it fades out 150ms after the pointer leaves the list. Selected: `--surface-selected` with `--text-primary`.

**Editor.** The scroller fills the panel; the text column is centred at `--editor-width`. Breadcrumb in mono `--text-label` above the title.

**Scrollbar.** Always visible. 9px wide track (transparent), 5px thumb in `--scrollbar-thumb`, radius 3px, hover `--border-strong`. Flush with the panel's right edge. `scrollbar-gutter: stable` on one edge only.

**Status chips.** Bottom-right of the editor panel, 16px from the right (clear of the scrollbar), 8px from the bottom. Mono 11px, `--surface-base`, `--border-strong`, radius `--radius-sm`. Order: `ln 12`, `182 words`, `saved`. Fade to 0 in 150ms while typing, return 1s after typing stops. Hover reveals detail (last save time); click toggles words and characters. "saved" turns `--accent` once the write has landed. A failed write shows `not saved` in `--danger`; that chip does not fade while typing and stays until a later write succeeds.

**Buttons.** Primary: `--accent-fill`, white text, faceted with `--facet-sm`. Secondary: transparent, `--border-strong`, hover `--surface-raised`. Icon-only buttons are 26×26 with an `aria-label`.

**Inputs.** `--surface-sunken`, `--border`, radius `--radius-sm`, focus ring `0 0 0 2px var(--accent-quiet)` plus a `--accent` border.

**Empty state (no note open).** Faceted logo mark at 15% opacity, a primary "New note" button, up to three recent notes, and a muted `Ctrl K` hint.

### 8. Motion

250ms `ease-out` for hover and fades; 250ms for width changes that move the layout (the sidebar, the tab strip's gap, tab widths). No motion on theme change. Everything inside `@media (prefers-reduced-motion: reduce)` drops to 0ms.

### 9. Accessibility

Every icon-only control has an `aria-label`. Focus is always visible, drawn inside faceted elements. Note rows become buttons, so they're keyboard reachable. Colour is never the only signal: the active tab also has its facet and surface, and the active rail icon is also filled.

### 10. Implementation

- Tokens live in `app.css` under `@theme`, so Tailwind generates `bg-surface-panel`, `text-muted` and the rest. Light theme redefines the same tokens under `:root[data-theme="light"]`.
- `tailwind.config.js` is deleted; the tab animations move to `@keyframes` in CSS.
- Icons come from `@lucide/svelte`, imported per icon at stroke-width 1.5. The 13 unused icon components in `src/assets/` are deleted; the logo stays.
- CodeMirror reads the syntax tokens through `var(--code-*)`, so themes apply without rebuilding the highlighter.

### 11. The three PRs

1. **Cleanup, no visual change.** Delete unused tokens, the phantom `animate-slide-in-right`, `tailwind.config.js`, the two unused fonts and the unused icon components. Move tab CSS out of `app.css` into the components. Rename tokens to roles. Bundle fonts locally.
2. **Layout.** Rails, switcher strip, pane header, column structure, tab strip, scrollbar, status chips, resizer rewrite, collapse behaviour, macOS handling. Still in the current colours.
3. **Identity.** Both palettes, type scale, facet, editor theme, empty state, the theme switch in settings.
