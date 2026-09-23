import { get, writable, type Writable } from "svelte/store";
import type { ThemeName } from "../../shared/types";

export const theme: Writable<ThemeName> = writable("dark");

export function applyTheme(next: ThemeName): void {
  theme.set(next);
  document.documentElement.dataset.theme = next;
}

export function loadTheme(): void {
  applyTheme(window.theme.initial());
}

export function toggleTheme(): void {
  const next: ThemeName = get(theme) === "dark" ? "light" : "dark";
  applyTheme(next);
  window.theme.set(next);
}
