import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

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

const guide = (token: string): string =>
  `color-mix(in srgb, var(${token}) 40%, transparent)`;

const GUIDE_COLORS = [
  guide("--color-accent"),
  guide("--code-string"),
  guide("--code-function"),
  guide("--code-number"),
  guide("--code-tag"),
];

interface GuideSpacing {
  unit: number;
  offset: number;
}

const PROSE_SPACING: GuideSpacing = { unit: INDENT, offset: INDENT / 2 };

function guideStyle(cols: number, { unit, offset }: GuideSpacing): string {
  const stops: string[] = [];
  for (let level = 0; level * unit + offset < cols; level++) {
    const at = level * unit + offset;
    const color = GUIDE_COLORS[level % GUIDE_COLORS.length];
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

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function guideSpacing(state: EditorState): GuideSpacing[] {
  const spacing = new Array<GuideSpacing>(state.doc.lines + 1).fill(
    PROSE_SPACING,
  );

  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name !== "FencedCode") {
        return;
      }

      const first = state.doc.lineAt(node.from).number;
      const last = state.doc.lineAt(node.to).number;

      let unit = 0;
      for (let n = first; n <= last; n++) {
        const lead = columns(LEADING.exec(state.doc.line(n).text)?.[0] ?? "");
        if (lead > 0) {
          unit = gcd(unit, lead);
        }
      }

      if (unit > 0) {
        const code: GuideSpacing = { unit: Math.max(unit, 2), offset: 0 };
        for (let n = first; n <= last; n++) {
          spacing[n] = code;
        }
      }
      return false;
    },
  });

  return spacing;
}

function guideDepths(state: EditorState): number[] {
  const count = state.doc.lines;
  const depth = new Array<number>(count + 1).fill(0);
  const blank = new Array<boolean>(count + 1).fill(false);

  for (let n = 1; n <= count; n++) {
    const text = state.doc.line(n).text;
    blank[n] = text.trim() === "";
    depth[n] = columns(LEADING.exec(text)?.[0] ?? "");
  }

  const guides = depth.slice();

  let above = 0;
  for (let n = 1; n <= count; n++) {
    if (blank[n]) {
      guides[n] = above;
    } else {
      above = depth[n];
    }
  }

  let below = 0;
  for (let n = count; n >= 1; n--) {
    if (blank[n]) {
      guides[n] = Math.max(depth[n], Math.min(guides[n], below));
    } else {
      below = depth[n];
    }
  }

  return guides;
}

export function indentDecorations(state: EditorState): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];
  const guides = guideDepths(state);
  const spacing = guideSpacing(state);

  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n);
    const match = LEADING.exec(line.text);
    const blank = line.text.trim() === "";

    const hang =
      !match || blank || LIST_ITEM.test(line.text)
        ? ""
        : ` padding-left: calc(${columns(match[0])}ch + 6px); text-indent: -${columns(match[0])}ch;`;
    const style = guideStyle(guides[n], spacing[n]) + hang;
    if (style) {
      out.push(Decoration.line({ attributes: { style } }).range(line.from));
    }

    if (match) {
      out.push(
        Decoration.replace({
          widget: new IndentWidget(columns(match[0])),
        }).range(line.from, line.from + match[0].length),
      );
    }
  }

  return out;
}
