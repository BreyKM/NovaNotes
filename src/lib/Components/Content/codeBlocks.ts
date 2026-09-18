import { HighlightStyle, syntaxTree } from "@codemirror/language";
import type { EditorState, Range } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { tags as t } from "@lezer/highlight";

const CODE_NODES = new Set(["FencedCode", "CodeBlock", "InlineCode"]);

export function isInCode(state: EditorState, pos: number): boolean {
  let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, 1);
  while (node) {
    if (CODE_NODES.has(node.name)) {
      return true;
    }
    node = node.parent;
  }
  return false;
}

export function codeBlockLines(
  state: EditorState,
  block: SyntaxNode,
): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];
  const first = state.doc.lineAt(block.from).number;
  const last = state.doc.lineAt(block.to).number;

  for (let n = first; n <= last; n++) {
    const classes = ["cm-codeblock"];
    if (n === first) {
      classes.push("cm-codeblock-first");
    }
    if (n === last) {
      classes.push("cm-codeblock-last");
    }
    out.push(
      Decoration.line({ class: classes.join(" ") }).range(
        state.doc.line(n).from,
      ),
    );
  }

  return out;
}

export const codeHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#c678dd" },
  { tag: [t.string, t.regexp], color: "#c678dd" },
  { tag: t.comment, color: "#7d8799", fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#d19a66" },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: "#61afef",
  },
  { tag: [t.typeName, t.className, t.namespace], color: "#e5c07b" },
  { tag: [t.propertyName, t.tagName], color: "#e06c75" },
  { tag: t.attributeName, color: "#d19a66" },
  { tag: t.operator, color: "#56b6c2" },
]);
