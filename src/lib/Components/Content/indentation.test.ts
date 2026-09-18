import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { columns, indentDecorations } from "./indentation";

describe("columns", () => {
  it.each([
    ["", 0],
    ["    ", 4],
    ["\t", 4],
    ["  \t", 6],
  ])("measures %j as %i columns", (text, expected) => {
    expect(columns(text)).toBe(expected);
  });
});

describe("indentDecorations", () => {
  it("replaces leading spaces and tabs with fixed-width widgets", () => {
    const state = EditorState.create({ doc: "    a\n\tb\nc\n        d" });
    const widgets = indentDecorations(state)
      .filter((r) => r.to > r.from)
      .map((r) => [
        state.doc.sliceString(r.from, r.to),
        r.value.spec.widget.cols,
      ]);

    expect(widgets).toEqual([
      ["    ", 4],
      ["\t", 4],
      ["        ", 8],
    ]);
  });

  it("adds guide styling only to indented lines", () => {
    const state = EditorState.create({ doc: "    a\nb" });
    const lines = indentDecorations(state).filter((r) => r.to === r.from);

    expect(lines).toHaveLength(1);
    expect(lines[0].value.spec.attributes.style).toContain(
      "background-size: 4ch",
    );
  });
});
