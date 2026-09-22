import { afterEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { EditorSelection, EditorState } from "@codemirror/state";
import {
  countWords,
  isTypingStore,
  markTyping,
  statsFor,
} from "./editorStatus";

describe("countWords", () => {
  it.each([
    ["", 0],
    ["   \n\t ", 0],
    ["one", 1],
    ["one two  three\nfour", 4],
    ["see [the docs](https://example.com) now", 4],
    ["before\n```js\nconst x = 1;\n```\nafter", 2],
    ["café naïve", 2],
    ["use the ` key\n\nthen run `npm test` again", 6],
    ["# Title\n\n- [ ] buy milk", 3],
    ["![diagram](a.png) caption", 1],
  ])("counts %j as %i words", (text, expected) => {
    expect(countWords(text)).toBe(expected);
  });
});

describe("statsFor", () => {
  it("reports the line the cursor is on", () => {
    const doc = "first\nsecond\nthird";
    const state = EditorState.create({
      doc,
      selection: EditorSelection.cursor(doc.indexOf("second") + 2),
    });

    expect(statsFor(state).line).toBe(2);
  });

  it("counts characters, including line breaks", () => {
    const state = EditorState.create({ doc: "ab\ncd" });

    expect(statsFor(state).characters).toBe(5);
  });
});

describe("markTyping", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays typing until a second passes without another keystroke", () => {
    vi.useFakeTimers();

    markTyping();
    vi.advanceTimersByTime(800);
    markTyping();
    vi.advanceTimersByTime(800);
    expect(get(isTypingStore)).toBe(true);

    vi.advanceTimersByTime(200);
    expect(get(isTypingStore)).toBe(false);
  });
});
