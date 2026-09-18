import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import { codeBlockLines, isInCode } from "./codeBlocks";

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
