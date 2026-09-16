import type { EditorState, Range } from "@codemirror/state";
import { Decoration } from "@codemirror/view";

const MAX = 3;
const WORD = /\w/;

const hidden = Decoration.replace({});

const STYLES: Array<Decoration | null> = [
  null,
  Decoration.mark({ class: "cm-emphasis" }),
  Decoration.mark({ class: "cm-strong" }),
  Decoration.mark({ class: "cm-strong cm-emphasis" }),
];

interface Run {
  from: number;
  to: number;
  char: string;
  len: number;
}

function runsIn(text: string, lineFrom: number): Run[] {
  const out: Run[] = [];
  const re = /(_+|\*+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const before = start === 0 ? "" : text[start - 1];
    const after = end >= text.length ? "" : text[end];

    if (m[0][0] === "_" && WORD.test(before) && WORD.test(after)) {
      continue;
    }

    out.push({
      from: lineFrom + start,
      to: lineFrom + end,
      char: m[0][0],
      len: m[0].length,
    });
  }
  return out;
}

export function emphasisDecorations(
  state: EditorState,
  showSource: (from: number, to: number) => boolean,
): Range<Decoration>[] {
  const out: Range<Decoration>[] = [];

  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n);
    const runs = runsIn(line.text, line.from);

    let i = 0;
    while (i < runs.length) {
      const open = runs[i];
      if (open.to >= line.to) {
        break;
      }

      const level = Math.min(open.len, MAX);

      let j = i + 1;
      while (
        j < runs.length &&
        (runs[j].char !== open.char || runs[j].len < level)
      ) {
        j++;
      }

      const close = j < runs.length ? runs[j] : null;
      const contentTo = close ? close.from : line.to;
      const style = STYLES[level];

      if (style && contentTo > open.to) {
        out.push(style.range(open.to, contentTo));
      }

      if (!showSource(open.from, close ? close.to : line.to)) {
        out.push(hidden.range(open.from, open.from + level));
        if (close) {
          out.push(hidden.range(close.from, close.from + level));
        }
      }

      i = close ? j + 1 : runs.length;
    }
  }

  return out;
}
