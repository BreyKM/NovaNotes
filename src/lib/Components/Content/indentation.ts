import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType } from "@codemirror/view";

export const INDENT = 4;

export const LEADING = /^[ \t]+/;

export function columns(text: string): number {
  return text.replace(/\t/g, " ".repeat(INDENT)).length;
}

class IndentWidget extends WidgetType {
  readonly cols: number;

  constructor(cols: number) {
    super();
    this.cols = cols;
  }

  eq(other: IndentWidget): boolean {
    return other.cols === this.cols;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-indent";
    span.style.width = `${this.cols}ch`;
    return span;
  }
}

const GUIDE_COLORS = [
  "#e06c7566",
  "#e5c07b66",
  "#98c37966",
  "#61afef66",
  "#c678dd66",
];

function guideStyle(cols: number): string {
  const stops: string[] = [];
  for (let at = 2; at < cols; at += INDENT) {
    const color = GUIDE_COLORS[((at - 2) / INDENT) % GUIDE_COLORS.length];
    stops.push(
      `transparent ${at}ch`,
      `${color} ${at}ch`,
      `${color} calc(${at}ch + 1px)`,
      `transparent calc(${at}ch + 1px)`,
    );
  }
  if (stops.length === 0) {
    return "";
  }
  return (
    `background-image: linear-gradient(to right, transparent 0, ${stops.join(", ")});` +
    ` background-size: ${cols}ch 100%; background-position: 6px 0; background-repeat: no-repeat;`
  );
}

const LIST_ITEM = /^[ \t]*(?:[-*+]|\d+[.)])(?:[ \t]|$)/;

export function indentDecorations(state: EditorState): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];

  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n);
    const match = LEADING.exec(line.text);
    if (!match) {
      continue;
    }

    const cols = columns(match[0]);

    const hang = LIST_ITEM.test(line.text)
      ? ""
      : ` padding-left: calc(${cols}ch + 6px); text-indent: -${cols}ch;`;
    const style = guideStyle(cols) + hang;
    if (style) {
      out.push(Decoration.line({ attributes: { style } }).range(line.from));
    }

    out.push(
      Decoration.replace({ widget: new IndentWidget(cols) }).range(
        line.from,
        line.from + match[0].length,
      ),
    );
  }

  return out;
}
