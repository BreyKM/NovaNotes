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

  it("colors each guide by its depth", () => {
    const state = EditorState.create({ doc: "            a" });
    const [line] = indentDecorations(state).filter((r) => r.to === r.from);

    expect(
      line.value.spec.attributes.style.match(/#[0-9a-f]{8} \d+ch/g),
    ).toEqual(["#e06c7566 2ch", "#e5c07b66 6ch", "#98c37966 10ch"]);
  });

  it("draws no guide for indents too shallow to reach one", () => {
    const state = EditorState.create({ doc: "  a" });
    const [line] = indentDecorations(state).filter((r) => r.to === r.from);

    expect(line.value.spec.attributes.style).not.toContain("background-image");
  });

  it("hangs wrapped rows of indented text under the text", () => {
    const state = EditorState.create({ doc: "    a" });
    const [line] = indentDecorations(state).filter((r) => r.to === r.from);

    expect(line.value.spec.attributes.style).toContain(
      "padding-left: calc(4ch + 6px); text-indent: -4ch;",
    );
  });

  it.each(["    - item", "    1. item"])(
    "leaves the hanging indent of %j to the list code",
    (doc) => {
      const state = EditorState.create({ doc });
      const [line] = indentDecorations(state).filter((r) => r.to === r.from);

      expect(line.value.spec.attributes.style).not.toContain("padding-left");
    },
  );
});
