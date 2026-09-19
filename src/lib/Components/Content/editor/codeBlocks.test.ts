import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import { codeBlockLines, isInCode, codeBlockText } from "./codeBlocks";

const doc = "a `b` c\n```\nx\n```\n    y";
const state = EditorState.create({ doc, extensions: [markdown()] });

describe("isInCode", () => {
  it.each([
    ["plain text", doc.indexOf("a"), false],
    ["inline code", doc.indexOf("b"), true],
    ["just after inline code", doc.indexOf("` c") + 1, false],
    ["a fenced block", doc.indexOf("x"), true],
    ["an indented block", doc.indexOf("y"), true],
  ])("%s", (_label, pos, expected) => {
    expect(isInCode(state, pos)).toBe(expected);
  });
});

describe("codeBlockLines", () => {
  it("marks every line of a fenced block, with first and last classes", () => {
    let fenced = null;
    syntaxTree(state).iterate({
      enter: (node) => {
        if (node.name === "FencedCode") {
          fenced = node.node;
        }
      },
    });
    const classes = codeBlockLines(state, fenced!).map(
      (r) => r.value.spec.class,
    );

    expect(classes).toEqual([
      "cm-codeblock cm-codeblock-first",
      "cm-codeblock",
      "cm-codeblock cm-codeblock-last",
    ]);
  });
});

describe("codeBlockText", () => {
  function textAt(doc: string, line: number): string | null {
    const state = EditorState.create({ doc, extensions: [markdown()] });
    return codeBlockText(state, state.doc.line(line).from);
  }

  it("returns the code betweem the fences", () => {
    expect(textAt("```py\nx = 1\ny = 2\n```", 1)).toBe("x = 1\ny = 2");
  });

  it("finds a block that is not at the top of the note", () => {
    expect(textAt("intro\n\n```\ncode\n```", 3)).toBe("code");
  });

  it("returns everything after the fence in an unclosed block", () => {
    expect(textAt("```js\nx\ny", 1)).toBe("x\ny");
  });

  it("returns an empty string for an empty block", () => {
    expect(textAt("```py\n```", 1)).toBe("");
  });

  it("returns null outside a code block", () => {
    expect(textAt("plain text", 1)).toBeNull();
  });
});
