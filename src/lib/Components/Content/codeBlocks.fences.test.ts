import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import type { SyntaxNode } from "@lezer/common";
import { fencedCodeDecorations } from "./codeBlocks";

function describeFence(doc: string, cursor: number | null): string[] {
  const state = EditorState.create({ doc, extensions: [markdown()] });
  let block: SyntaxNode | null = null;
  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name === "FencedCode") {
        block = node.node;
      }
    },
  });
  const showSource = (from: number, to: number) =>
    cursor !== null && cursor >= from && cursor <= to;

  return fencedCodeDecorations(state, block!, showSource).map((r) => {
    const line = state.doc.lineAt(r.from).number;
    const spec = r.value.spec;
    if (spec.widget) {
      return `${line}: header(${spec.widget.language}${spec.widget.alone ? ", alone" : ""})`;
    }
    if (spec.block) {
      return `${line}: hidden`;
    }
    return `${line}: ${spec.class}`;
  });
}

const doc = "```py\nx = 1\ny = 2\n```";

const revealed = [
  "1: header(py)",
  "1: cm-codeblock",
  "2: cm-codeblock",
  "3: cm-codeblock",
  "4: cm-codeblock cm-codeblock-last",
];

describe("fencedCodeDecorations", () => {
  it("shows a header and hides both fences when the cursor is elsewhere", () => {
    expect(describeFence(doc, null)).toEqual([
      "1: header(py)",
      "1: hidden",
      "4: hidden",
      "2: cm-codeblock",
      "3: cm-codeblock cm-codeblock-last",
    ]);
  });

  it.each([
    ["on the opening fence", 2],
    ["in the code", doc.indexOf("x")],
    ["on the closing fence", doc.length],
  ])(
    "keeps the header and reveals both fences with the cursor %s",
    (_label, cursor) => {
      expect(describeFence(doc, cursor)).toEqual(revealed);
    },
  );

  it("labels a block with no language as plain", () => {
    expect(describeFence("```\nx\n```", null)[0]).toBe("1: header()");
  });

  it("only hides the opening fence of an unclosed block", () => {
    expect(describeFence("```js\nx\ny", null)).toEqual([
      "1: header(js)",
      "1: hidden",
      "2: cm-codeblock",
      "3: cm-codeblock cm-codeblock-last",
    ]);
  });

  it("marks the header as alone when nothing else is visible", () => {
    expect(describeFence("```py\n```", null)).toEqual([
      "1: header(py, alone)",
      "1: hidden",
      "2: hidden",
    ]);
  });
});
