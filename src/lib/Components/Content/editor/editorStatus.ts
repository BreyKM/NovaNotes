import type { EditorState } from "@codemirror/state";
import { writable, type Writable } from "svelte/store";

export interface EditorStats {
  line: number;
  words: number;
  characters: number;
}

export const editorStatsStore: Writable<EditorStats | null> = writable(null);

export const isTypingStore: Writable<boolean> = writable(false);

const TYPING_IDLE_MS = 1000;
let typingTimer: ReturnType<typeof setTimeout> | undefined;

export function countWords(text: string): number {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}>\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/^\s{0,3}([*+-]|\d+\.)\s+/gm, "");

  return cleaned.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu)?.length ?? 0;
}

export function statsFor(state: EditorState): EditorStats {
  const text = state.doc.toString();
  return {
    line: state.doc.lineAt(state.selection.main.head).number,
    words: countWords(text),
    characters: text.length,
  };
}

export function markTyping(): void {
  isTypingStore.set(true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => isTypingStore.set(false), TYPING_IDLE_MS);
}
