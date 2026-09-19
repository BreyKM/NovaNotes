import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { columns } from "./indentation";

class MarkerWidget extends WidgetType {
  readonly label: string;
  readonly cols: number;

  constructor(label: string, cols: number) {
    super();
    this.label = label;
    this.cols = cols;
  }

  eq(other: MarkerWidget): boolean {
    return other.label === this.label && other.cols === this.cols;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-list-marker";
    span.style.width = `${this.cols}ch`;
    span.textContent = this.label;
    return span;
  }
}

export function listMarkDecorations(
  state: EditorState,
  mark: SyntaxNode,
  showSource: (from: number, to: number) => boolean,
): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];

  const item = mark.parent;
  const list = item?.parent;
  if (!item || item.name !== "ListItem" || !list) {
    return out;
  }

  const line = state.doc.lineAt(mark.from);
  const leading = line.text.slice(0, mark.from - line.from);
  if (leading.trim() !== "") {
    return out;
  }

  const hasSpace = state.doc.sliceString(mark.to, mark.to + 1) === " ";
  const textStart = hasSpace ? mark.to + 1 : mark.to;
  const hang = columns(leading) + (textStart - mark.from);

  out.push(
    Decoration.line({
      attributes: {
        style: `padding-left: calc(${hang}ch + 6px); text-indent: -${hang}ch;`,
      },
    }).range(line.from),
  );

  if (!showSource(mark.from, mark.to)) {
    const label =
      list.name === "BulletList"
        ? "•"
        : state.doc.sliceString(mark.from, mark.to);
    out.push(
      Decoration.replace({
        widget: new MarkerWidget(label, textStart - mark.from),
      }).range(mark.from, textStart),
    );
  }

  return out;
}
