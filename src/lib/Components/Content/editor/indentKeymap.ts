import { deleteCharBackward } from "@codemirror/commands";
import { Prec, type EditorState } from "@codemirror/state";
import { EditorView, keymap, type KeyBinding } from "@codemirror/view";
import { INDENT, LEADING, columns } from "./indentation";

const ONLY_WHITESPACE = /^[ \t]+$/;
const MARKER_ONLY = /^[ \t]*(?:[-*+]|\d+[.)]) ?$/;
const LIST_OR_QUOTE = /^[ \t]*(?:[-*+](?:\s|$)|\d+[.)](?:\s|$)|>)/;
const ORDERED = /^([ \t]*)(\d+)([.)])/;

export function stepBack(before: string): number {
  if (before.endsWith("\t")) {
    return 1;
  }
  const cols = columns(before);
  const stop = Math.floor((cols - 1) / INDENT) * INDENT;
  const trailing = before.length - before.replace(/ +$/, "").length;
  return Math.min(cols - stop, trailing);
}

export function previousNumber(
  state: EditorState,
  lineNumber: number,
  cols: number,
): number {
  for (let n = lineNumber - 1; n >= 1; n--) {
    const text = state.doc.line(n).text;
    if (text.trim() === "") {
      continue;
    }
    const lead = columns(LEADING.exec(text)?.[0] ?? "");
    if (lead > cols) {
      continue;
    }
    if (lead < cols) {
      return 0;
    }
    const match = ORDERED.exec(text);
    return match ? Number(match[2]) : 0;
  }
  return 0;
}

export function shiftOrdered(view: EditorView, dir: 1 | -1): boolean {
  const { state } = view;
  const range = state.selection.main;
  if (!range.empty) {
    return false;
  }

  const line = state.doc.lineAt(range.head);
  const match = ORDERED.exec(line.text);
  if (!match) {
    return false;
  }

  const oldCols = columns(match[1]);
  if (dir < 0 && oldCols === 0) {
    return false;
  }
  const newCols =
    dir > 0 ? oldCols + INDENT : Math.floor((oldCols - 1) / INDENT) * INDENT;

  const number = previousNumber(state, line.number, newCols) + 1;
  const prefix = " ".repeat(newCols) + String(number);
  const oldEnd = line.from + match[1].length + match[2].length;
  const anchor =
    range.head >= oldEnd
      ? range.head + prefix.length - (oldEnd - line.from)
      : line.from + prefix.length;

  view.dispatch(
    state.update({
      changes: { from: line.from, to: oldEnd, insert: prefix },
      selection: { anchor },
    }),
  );
  return true;
}

const indentBackspace: KeyBinding = {
  key: "Backspace",
  run: (view) => {
    const range = view.state.selection.main;
    if (!range.empty) {
      return false;
    }

    const line = view.state.doc.lineAt(range.head);
    const before = line.text.slice(0, range.head - line.from);

    if (ONLY_WHITESPACE.test(before)) {
      const remove = stepBack(before);
      view.dispatch({ changes: { from: range.head - remove, to: range.head } });
      return true;
    }

    if (MARKER_ONLY.test(before)) {
      return deleteCharBackward(view);
    }

    return false;
  },
};

const outdentOnEnter: KeyBinding = {
  key: "Enter",
  run: (view) => {
    const range = view.state.selection.main;
    if (!range.empty) {
      return false;
    }

    const line = view.state.doc.lineAt(range.head);
    if (!ONLY_WHITESPACE.test(line.text)) {
      return false;
    }

    const before = line.text.slice(0, range.head - line.from);
    if (before === "") {
      return false;
    }

    const remove = stepBack(before);
    view.dispatch({ changes: { from: range.head - remove, to: range.head } });
    return true;
  },
};

const keepIndentOnEnter: KeyBinding = {
  key: "Enter",
  run: (view) => {
    const range = view.state.selection.main;
    if (!range.empty) {
      return false;
    }

    const line = view.state.doc.lineAt(range.head);
    const indent = LEADING.exec(line.text)?.[0];
    if (!indent || LIST_OR_QUOTE.test(line.text)) {
      return false;
    }
    if (range.head - line.from < indent.length) {
      return false;
    }

    const insert = "\n" + indent;
    view.dispatch({
      changes: { from: range.head, insert },
      selection: { anchor: range.head + insert.length },
      scrollIntoView: true,
    });
    return true;
  },
};

const reindentOrdered: KeyBinding = {
  key: "Tab",
  run: (view) => shiftOrdered(view, 1),
  shift: (view) => shiftOrdered(view, -1),
};

export const indentKeymap = Prec.highest(
  keymap.of([
    indentBackspace,
    outdentOnEnter,
    keepIndentOnEnter,
    reindentOrdered,
  ]),
);
