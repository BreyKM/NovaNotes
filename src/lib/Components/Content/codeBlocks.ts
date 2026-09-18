import { HighlightStyle, syntaxTree } from "@codemirror/language";
import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType } from "@codemirror/view";
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

class CodeHeaderWidget extends WidgetType {
  readonly language: string;
  readonly alone: boolean;

  constructor(language: string, alone: boolean) {
    super();
    this.language = language;
    this.alone = alone;
  }

  eq(other: CodeHeaderWidget): boolean {
    return other.language === this.language && other.alone === this.alone;
  }

  toDOM(): HTMLElement {
    const header = document.createElement("div");
    header.className = this.alone
      ? "cm-codeblock-header cm-codeblock-header-alone"
      : "cm-codeblock-header";

    const label = document.createElement("span");
    label.className = "cm-codeblock-language";
    label.textContent = this.language || "text";
    header.append(label);

    return header;
  }

  ignoreEvent(): boolean {
    return true;
  }
}

const hiddenLine = Decoration.replace({ block: true });

export function fencedCodeDecorations(
  state: EditorState,
  block: SyntaxNode,
  showSource: (from: number, to: number) => boolean,
): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];

  const opening = state.doc.lineAt(block.from);
  const end = state.doc.lineAt(block.to);
  const closed = block.getChildren("CodeMark").length === 2;
  const closing = closed && end.number > opening.number ? end : null;

  const info = block.getChild("CodeInfo");
  const language = info ? state.doc.sliceString(info.from, info.to) : "";

  const reveal = showSource(block.from, block.to);

  const visible: number[] = [];
  if (reveal) {
    visible.push(opening.number);
  }
  const lastContent = closing ? closing.number - 1 : end.number;
  for (let n = opening.number + 1; n <= lastContent; n++) {
    visible.push(n);
  }
  if (closing && reveal) {
    visible.push(closing.number);
  }

  out.push(
    Decoration.widget({
      widget: new CodeHeaderWidget(language, visible.length === 0),
      block: true,
      side: -1,
    }).range(opening.from),
  );

  if (!reveal) {
    out.push(hiddenLine.range(opening.from, opening.to));
    if (closing) {
      out.push(hiddenLine.range(closing.from, closing.to));
    }
  }

  visible.forEach((n, i) => {
    const classes = ["cm-codeblock"];
    if (i === visible.length - 1) {
      classes.push("cm-codeblock-last");
    }
    out.push(
      Decoration.line({ class: classes.join(" ") }).range(
        state.doc.line(n).from,
      ),
    );
  });

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
