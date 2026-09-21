import { get, writable, type Writable } from "svelte/store";

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
}

export function setSidebarWidth(width: number): void {
  sidebarWidth.set(clampSidebarWidth(width));
  saveLayout();
}

export function setSidebarCollapsed(collapsed: boolean): void {
  sidebarCollapsed.set(collapsed);
  saveLayout();
}

export function toggleSidebar(): void {
  setSidebarCollapsed(!get(sidebarCollapsed));
}
