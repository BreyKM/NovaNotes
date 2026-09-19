import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { emphasisDecorations } from "./emphasis";
import { markdown } from "@codemirror/lang-markdown";

function render(doc: string, showSource = false) {
  const ranges = emphasisDecorations(
    EditorState.create({ doc }),
    () => showSource,
  );
  const styled = ranges
    .filter((r) => r.value.spec.class)
    .map((r) => [doc.slice(r.from, r.to), r.value.spec.class]);
  const hidden = ranges
    .filter((r) => !r.value.spec.class)
    .map((r) => doc.slice(r.from, r.to));
  return { styled, hidden };
}

describe("emphasisDecorations", () => {
  it.each([
    ["_x_", [["x", "cm-emphasis"]], ["_", "_"]],
    ["*x*", [["x", "cm-emphasis"]], ["*", "*"]],
    ["__x__", [["x", "cm-strong"]], ["__", "__"]],
    ["___x___", [["x", "cm-strong cm-emphasis"]], ["___", "___"]],
    ["____x____", [["x", "cm-strong cm-emphasis"]], ["___", "___"]],
    ["__bold", [["bold", "cm-strong"]], ["__"]],
    ["__bold_", [["bold_", "cm-strong"]], ["__"]],
    ["__bold_ text here__", [["bold_ text here", "cm-strong"]], ["__", "__"]],
    [
      "a __b__ and __c__",
      [
        ["b", "cm-strong"],
        ["c", "cm-strong"],
      ],
      ["__", "__", "__", "__"],
    ],
  ])("styles %j", (doc, styled, hidden) => {
    expect(render(doc)).toEqual({ styled, hidden });
  });

  it.each(["snake_case here", "* item", "a _ b", "plain text"])(
    "leaves %j alone",
    (doc) => {
      expect(render(doc)).toEqual({ styled: [], hidden: [] });
    },
  );

  it("keeps the style but shows the delimiters when the cursor is on it", () => {
    expect(render("__x__", true)).toEqual({
      styled: [["x", "cm-strong"]],
      hidden: [],
    });
  });
});

describe("emphasisisDecorations inside code", () => {
  function renderParsed(doc: string) {
    const state = EditorState.create({ doc, extensions: [markdown()] });
    return emphasisDecorations(state, () => false).map((r) =>
      doc.slice(r.from, r.to),
    );
  }

  it.each(["`*x*`", "```\ndef __init__(self, *args):\n```", "    __init__"])(
    "ignores delimiters in %j",
    (doc) => {
      expect(renderParsed(doc)).toEqual([]);
    },
  );

  it("still styles emphasis next to inline code", () => {
    expect(renderParsed("*a* `b`")).toEqual(["a", "*", "*"]);
  });
});
