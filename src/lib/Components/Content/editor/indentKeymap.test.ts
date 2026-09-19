import { describe, expect, it } from "vitest";
import { EditorSelection, EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import {
  insertNewlineContinueMarkup,
  markdown,
} from "@codemirror/lang-markdown";
import { previousNumber, shiftOrdered, stepBack } from "./indentKeymap";

describe("stepBack", () => {
  it.each([
    ["    ", 4],
    ["        ", 4],
    ["      ", 2],
    ["  ", 2],
    [" ", 1],
    ["\t", 1],
    ["    \t", 1],
  ])("removes the right amount from %j", (before, expected) => {
    expect(stepBack(before)).toBe(expected);
  });
});

describe("previousNumber", () => {
  const state = EditorState.create({
    doc: "1. a\n2. b\n    1. c\n    2. d\n\n3. e\n- bullet\n    x",
  });

  it("returns 0 for the first item of a nested list", () => {
    expect(previousNumber(state, 3, 4)).toBe(0);
  });

  it("continues from a sibling at the same level", () => {
    expect(previousNumber(state, 4, 4)).toBe(1);
  });

  it("skips blank lines and deeper items to find its sibling", () => {
    expect(previousNumber(state, 6, 0)).toBe(2);
  });

  it("stops at a sibling that is not an ordered item", () => {
    expect(previousNumber(state, 8, 0)).toBe(0);
  });
});

describe("shiftOrdered", () => {
  function editor(doc: string) {
    const view = {
      state: EditorState.create({
        doc,
        selection: EditorSelection.cursor(doc.length),
        extensions: [markdown(), indentUnit.of("    ")],
      }),
      dispatch(tr: { state: EditorState }) {
        view.state = tr.state;
      },
    };
    return view;
  }

  function type(view: ReturnType<typeof editor>, text: string) {
    const head = view.state.selection.main.head;
    view.dispatch(
      view.state.update({
        changes: { from: head, insert: text },
        selection: { anchor: head + text.length },
      }),
    );
  }

  it("restarts at 1 when indented and resumes the parent count when outdented", () => {
    const view = editor("1. test\n2. test");
    const asView = view as unknown as EditorView;

    insertNewlineContinueMarkup(view);
    shiftOrdered(asView, 1);
    type(view, "test");
    insertNewlineContinueMarkup(view);
    type(view, "test");
    insertNewlineContinueMarkup(view);
    shiftOrdered(asView, -1);
    type(view, "test");

    expect(view.state.doc.toString()).toBe(
      "1. test\n2. test\n    1. test\n    2. test\n3. test",
    );
  });

  it("declines outdenting an item that is already at the left edge", () => {
    const view = editor("1. test");
    expect(shiftOrdered(view as unknown as EditorView, -1)).toBe(false);
  });
});
