// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { undo } from "@codemirror/commands";
import { loadNote, noteExtensions } from "./noteEditor";

describe("loadNote", () => {
  let view: EditorView;

  afterEach(() => view.destroy());

  function open(text: string, onEdit = vi.fn()) {
    const extensions = noteExtensions(onEdit);
    view = new EditorView({
      state: EditorState.create({ doc: text, extensions }),
    });
    return { extensions, onEdit };
  }

  function type(from: number, to: number, insert = "") {
    view.dispatch({ changes: { from, to, insert }, userEvent: "input" });
  }

  it("does not let undo reach edits made in the previous note", () => {
    const { extensions } = open("note A: hello world");
    type(8, 14);

    loadNote(view, "note B: untouched", extensions);

    expect(undo(view)).toBe(false);
    expect(view.state.doc.toString()).toBe("note B: untouched");
  });

  it("does not report the load as an edit", () => {
    const { extensions, onEdit } = open("note A");

    loadNote(view, "note B", extensions);

    expect(onEdit).not.toHaveBeenCalled();
  });

  it("reports edits made after a load", () => {
    const { extensions, onEdit } = open("note A");
    loadNote(view, "note B", extensions);

    type(6, 6, "!");

    expect(onEdit).toHaveBeenCalledWith("note B!");
  });
});
