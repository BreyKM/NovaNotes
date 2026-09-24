import type { EditorState, Range } from "@codemirror/state";
import { Decoration, WidgetType, type EditorView } from "@codemirror/view";

export const CHECKED = "[x]";
export const UNCHECKED = "[ ]";

export function toggledMarker(marker: string): string {
  return marker === CHECKED ? UNCHECKED : CHECKED;
}

class CheckboxWidget extends WidgetType {
  readonly checked: boolean;
  readonly from: number;

  constructor(checked: boolean, from: number) {
    super();
    this.checked = checked;
    this.from = from;
  }

  eq(other: CheckboxWidget): boolean {
    return other.checked === this.checked && other.from === this.from;
  }

  toDOM(view: EditorView): HTMLElement {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = "cm-task-checkbox";
    box.checked = this.checked;
    box.setAttribute("aria-label", this.checked ? "Done" : "Not done");

    box.addEventListener("mousedown", (event) => {
      event.preventDefault();
      toggleTask(view, this.from);
    });

    return box;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

export function toggleTask(view: EditorView, from: number): void {
  const marker = view.state.doc.sliceString(from, from + CHECKED.length);
  if (marker !== CHECKED && marker !== UNCHECKED) {
    return;
  }

  view.dispatch({
    changes: {
      from,
      to: from + marker.length,
      insert: toggledMarker(marker),
    },
  });
}

export function taskMarkerDecoration(
  state: EditorState,
  from: number,
  to: number,
): Range<Decoration>[] {
  const marker = state.doc.sliceString(from, to);
  if (marker !== CHECKED && marker !== UNCHECKED) {
    return [];
  }

  let end = to;
  if (state.doc.sliceString(end, end + 1) === " ") {
    end += 1;
  }

  return [
    Decoration.replace({
      widget: new CheckboxWidget(marker === CHECKED, from),
    }).range(from, end),
  ];
}
