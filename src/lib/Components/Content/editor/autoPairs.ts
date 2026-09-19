import { Prec } from "@codemirror/state";
import { EditorView, keymap, type KeyBinding } from "@codemirror/view";
import { isInCode } from "./codeBlocks";

const PAIRS: Record<string, string | undefined> = {
  _: "_",
  "*": "*",
  "[": "]",
  "(": ")",
};

const SKIPPABLE = new Set(["]", ")", "_", "*"]);
const WORD = /\w/;
const NEXT_ALLOWS_PAIR = /^$|^[\s)\]}>.,;:!?]/;

const pairOnType = EditorView.inputHandler.of((view, from, to, text) => {
  const { state } = view;
  if ((text === "_" || text === "*") && isInCode(state, from)) {
    return false;
  }

  if (
    from === to &&
    SKIPPABLE.has(text) &&
    state.doc.sliceString(from, from + 1) === text
  ) {
    view.dispatch({ selection: { anchor: from + 1 } });
    return true;
  }

  const close = PAIRS[text];
  if (close === undefined) {
    return false;
  }

  if (from !== to) {
    view.dispatch({
      changes: [
        { from, insert: text },
        { from: to, insert: close },
      ],
      selection: { anchor: from + text.length, head: to + text.length },
    });
    return true;
  }

  const after = state.doc.sliceString(to, to + 1);
  if (after !== close && !NEXT_ALLOWS_PAIR.test(after)) {
    return false;
  }

  if (text === "_" || text === "*") {
    const before = state.doc.sliceString(from - 1, from);
    if (WORD.test(before) || before === text) {
      return false;
    }
    const line = state.doc.lineAt(from);
    if (text === "*" && line.text.slice(0, from - line.from).trim() === "") {
      return false;
    }
  }

  view.dispatch({
    changes: { from, to, insert: text + close },
    selection: { anchor: from + text.length },
  });
  return true;
});

const deletePair: KeyBinding = {
  key: "Backspace",
  run: (view) => {
    const range = view.state.selection.main;
    if (!range.empty) {
      return false;
    }
    const before = view.state.doc.sliceString(range.from - 1, range.from);
    const after = view.state.doc.sliceString(range.from, range.from + 1);
    if (PAIRS[before] !== after) {
      return false;
    }
    view.dispatch({
      changes: { from: range.from - 1, to: range.from + 1 },
      selection: { anchor: range.from - 1 },
    });
    return true;
  },
};

export const autoPair = [pairOnType, Prec.high(keymap.of([deletePair]))];
