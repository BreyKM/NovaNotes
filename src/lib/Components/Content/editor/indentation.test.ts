import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { columns, indentDecorations } from "./indentation";
import { markdown } from "@codemirror/lang-markdown";

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

    const guides = line.value.spec.attributes.style.match(
      /--[\w-]+(?=\) 40%, transparent\) \d+ch/g,
    );

    expect(guides).toEqual([
      "--color-accent",
      "--code-string",
      "--code-function",
    ]);
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

describe("guides across blank lines", () => {
  function styleOnLine(doc: string, lineNumber: number): string | null {
    const state = EditorState.create({ doc });
    const from = state.doc.line(lineNumber).from;
    const deco = indentDecorations(state).find(
      (r) => r.from === from && r.to === from,
    );
    return deco ? deco.value.spec.attributes.style : null;
  }

  it("continue through a blank line inside a block", () => {
    expect(styleOnLine("def f():\n    a\n\n    b", 3)).toContain(
      "background-size: 4ch",
    );
  });

  it("take the shallower neighbour when depths differ", () => {
    expect(styleOnLine("        a\n\n    b", 2)).toContain(
      "background-size: 4ch",
    );
  });

  it("stop at the end of a block", () => {
    expect(styleOnLine("    a\n\nb", 2)).toBeNull();
  });

  it("do not start before a block begins", () => {
    expect(styleOnLine("a\n\n    b", 2)).toBeNull();
  });

  it("span several blank lines in a row", () => {
    const doc = "    a\n\n\n    b";
    expect(styleOnLine(doc, 2)).toContain("background-size: 4ch");
    expect(styleOnLine(doc, 3)).toContain("background-size: 4ch");
  });
});

describe("guide spacing inside fenced code", () => {
  function guidesOnLine(doc: string, lineNumber: number): string[] {
    const state = EditorState.create({ doc, extensions: [markdown()] });
    const from = state.doc.line(lineNumber).from;
    const deco = indentDecorations(state).find(
      (r) => r.from === from && r.to === from,
    );
    const style: string = deco ? deco.value.spec.attributes.style : "";
    return (style.match(/transparent\) [\d.]+ch/g) ?? []).map(
      (s) => s.split(" ")[1],
    );
  }

  const twoSpace = [
    "```ts",
    "function  f() {",
    "  const count = 1;",
    "  for (;;) {",
    "    if (x) {",
    "      y();",
    "    }",
    "  }",
    "}",
    "```",
  ].join("\n");

  it.each([
    [3, "function body", ["0ch"]],
    [5, "for body", ["0ch", "2ch"]],
    [6, "if body", ["0ch", "2ch", "4ch"]],
  ])("2-space code, line %i (%s)", (line, _label, expected) => {
    expect(guidesOnLine(twoSpace, line)).toEqual(expected);
  });

  it("puts 4-space code guides at the start of each step", () => {
    const doc = "```py\ndef f():\n    if x:\n        y()\n```";
    expect(guidesOnLine(doc, 4)).toEqual(["0ch", "4ch"]);
  });

  it("keeps prose guides centred in each step", () => {
    expect(guidesOnLine("a\n        b", 2)).toEqual(["2ch", "6ch"]);
  });

  it("does not let a code block change prose after it", () => {
    const doc = "```\n  a\n```\n        b";
    expect(guidesOnLine(doc, 4)).toEqual(["2ch", "6ch"]);
  });
});
