// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { noteExtensions } from "./noteEditor";
import { CHECKED, UNCHECKED, toggleTask, toggledMarker } from "./taskList";

describe("toggledMarker", () => {
  it.each([
    [CHECKED, UNCHECKED],
    [UNCHECKED, CHECKED],
  ])("turns %j into %j", (marker, expected) => {
    expect(toggledMarker(marker)).toBe(expected);
  });
});

describe("the editor", () => {
  let view: EditorView;

  afterEach(() => view.destroy());

  function open(doc: string) {
    view = new EditorView({
      state: EditorState.create({ doc, extensions: noteExtensions(() => {}) }),
    });
    return view;
  }

  function checkboxes(): HTMLInputElement[] {
    return [
      ...view.dom.querySelectorAll<HTMLInputElement>(".cm-task-checkbox"),
    ];
  }

  it("draws a checkbox for each task marker", () => {
    open("- [x] done\n- [ ] todo");

    expect(checkboxes().map((box) => box.checked)).toEqual([true, false]);
  });

  it("does not treat a task marker as a link", () => {
    open("- [x] done");

    expect(view.dom.querySelector(".cm-link")).toBeNull();
  });

  it("writes the flipped marker back to the document", () => {
    open("- [ ] todo");

    toggleTask(view, view.state.doc.toString().indexOf(UNCHECKED));

    expect(view.state.doc.toString()).toBe("- [x] todo");
  });

  it("leaves anything that is not a marker alone", () => {
    open("- [ ] todo");

    toggleTask(view, 0);

    expect(view.state.doc.toString()).toBe("- [ ] todo");
  });
});
