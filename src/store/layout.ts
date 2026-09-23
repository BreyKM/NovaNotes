import { derived, get, writable, type Writable } from "svelte/store";
import type { NoteSort } from "../../shared/types";

export const MIN_SIDEBAR_WIDTH = 160;
export const MAX_SIDEBAR_WIDTH = 420;
const DEFAULT_SIDEBAR_WIDTH = 220;
export const COLLAPSE_BELOW_WIDTH = MIN_SIDEBAR_WIDTH / 2;

export const sidebarWidth: Writable<number> = writable(DEFAULT_SIDEBAR_WIDTH);
export const sidebarCollapsed: Writable<boolean> = writable(false);

export function clampSidebarWidth(width: number): number {
  return Math.min(
    MAX_SIDEBAR_WIDTH,
    Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)),
  );
}

export type SidebarDrag =
  { collapsed: true } | { collapsed: false; width: number };

export const sidebarDrag: Writable<SidebarDrag | null> = writable(null);

export const sidebarCollapsedView = derived(
  [sidebarCollapsed, sidebarDrag],
  ([$sidebarCollapsed, $sidebarDrag]) =>
    $sidebarDrag ? $sidebarDrag.collapsed : $sidebarCollapsed,
);

export const sidebarWidthView = derived(
  [sidebarWidth, sidebarDrag],
  ([$sidebarWidth, $sidebarDrag]) =>
    $sidebarDrag && !$sidebarDrag.collapsed
      ? $sidebarDrag.width
      : $sidebarWidth,
);

export function sidebarDragResult(rawWidth: number): SidebarDrag {
  if (rawWidth < COLLAPSE_BELOW_WIDTH) {
    return { collapsed: true };
  }
  return { collapsed: false, width: clampSidebarWidth(rawWidth) };
}

function saveLayout(): void {
  window.layout.set({
    sidebarWidth: get(sidebarWidth),
    sidebarCollapsed: get(sidebarCollapsed),
    noteSort: get(noteSort),
  });
}

export async function loadLayout(): Promise<void> {
  const saved = await window.layout.get();

  if (typeof saved.sidebarWidth === "number") {
    sidebarWidth.set(clampSidebarWidth(saved.sidebarWidth));
  }

  if (typeof saved.sidebarCollapsed === "boolean") {
    sidebarCollapsed.set(saved.sidebarCollapsed);
  }

  if (saved.noteSort && NOTE_SORTS.includes(saved.noteSort)) {
    noteSort.set(saved.noteSort);
  }
}

export function setSidebarWidth(width: number): void {
  sidebarWidth.set(clampSidebarWidth(width));
  saveLayout();
}

export function setSidebarCollapsed(collapsed: boolean): void {
  sidebarCollapsed.set(collapsed);
  saveLayout();
}

export const noteSort: Writable<NoteSort> = writable("edited");

const NOTE_SORTS: readonly NoteSort[] = ["name", "edited", "created"];

export function toggleSidebar(): void {
  setSidebarCollapsed(!get(sidebarCollapsed));
}

export function setNoteSort(sort: NoteSort): void {
  noteSort.set(sort);
  saveLayout();
}
