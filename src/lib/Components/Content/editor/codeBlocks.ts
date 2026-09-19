import { HighlightStyle, syntaxTree } from "@codemirror/language";
import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType, EditorView } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { tags as t } from "@lezer/highlight";
import { fenceLanguageChange, languageOptions } from "./codeLanguages";

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

  toDOM(view: EditorView): HTMLElement {
    const header = document.createElement("div");
    header.className = this.alone
      ? "cm-codeblock-header cm-codeblock-header-alone"
      : "cm-codeblock-header";

    const select = document.createElement("select");
    select.className = "cm-codeblock-language";
    select.title = "Code language";
    for (const option of languageOptions(this.language)) {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      element.selected = option.selected;
      select.append(element);
    }

    select.addEventListener("change", () => {
      const line = view.state.doc.lineAt(view.posAtDOM(header));
      const change = fenceLanguageChange(line.text, line.from, select.value);
      if (change) {
        view.dispatch({ changes: change });
      }
      view.focus();
    });

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "cm-codeblock-copy";
    copy.title = "Copy code";
    copy.innerHTML = COPY_ICON;

    copy.addEventListener("mousedown", (event) => event.preventDefault());
    copy.addEventListener("click", () => {
      const text = codeBlockText(view.state, view.posAtDOM(header));
      if (text === null) {
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => {
          copy.textContent = "Copied";
          setTimeout(() => {
            copy.innerHTML = COPY_ICON;
          }, 1500);
        })
        .catch((error) => console.error("Copy failed", error));
    });

    header.append(select, copy);
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

const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function codeBlockText(state: EditorState, pos: number): string | null {
  let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, 1);
  while (node && node.name !== "FencedCode") {
    node = node.parent;
  }
  if (!node) {
    return null;
  }
  const code = node.getChild("CodeText");
  return code ? state.doc.sliceString(code.from, code.to) : "";
}
