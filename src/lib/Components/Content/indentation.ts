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

const GUIDES =
  `background-image: repeating-linear-gradient(to right, transparent 0 2ch, ` +
  `var(--color-background-nav) 2ch calc(2ch + 1px), transparent calc(2ch + 1px) ${INDENT}ch);` +
  ` background-position: 6px 0; background-repeat: no-repeat;`;

export function indentDecorations(state: EditorState): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];

  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n);
    const match = LEADING.exec(line.text);
    if (!match) {
      continue;
    }

    const cols = columns(match[0]);

    out.push(
      Decoration.line({
        attributes: { style: `${GUIDES} background-size: ${cols}ch 100%;` },
      }).range(line.from),
    );

    out.push(
      Decoration.replace({ widget: new IndentWidget(cols) }).range(
        line.from,
        line.from + match[0].length,
      ),
    );
  }

  return out;
}
