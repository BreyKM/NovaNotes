import { syntaxTree } from "@codemirror/language";
import { StateField, type EditorState, type Range } from "@codemirror/state";
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view";
import { emphasisDecorations } from "./emphasis";

const hiddenMark = Decoration.replace({});
const linkText = Decoration.mark({ class: "cm-link" });

const headingText = [1, 2, 3, 4, 5, 6].map((level) =>
  Decoration.mark({ class: `cm-heading cm-heading-${level}` }),
);

export function shouldShowSource(
  state: EditorState,
  from: number,
  to: number,
): boolean {
  for (const range of state.selection.ranges) {
    if (range.from <= to && range.to >= from) {
      return true;
    }
  }
  return false;
}

function buildDecorations(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];

  syntaxTree(state).iterate({
    enter: (node) => {
      const name = node.name;

      if (name.startsWith("ATXHeading")) {
        const level = Number(name.slice("ATXHeading".length));
        const style = headingText[level - 1];
        if (style) {
          decorations.push(style.range(node.from, node.to));
        }
        return;
      }

      if (name === "HeaderMark") {
        const parent = node.node.parent;
        if (!parent || !parent.name.startsWith("ATXHeading")) {
          return;
        }
        if (shouldShowSource(state, parent.from, parent.to)) {
          return;
        }
        let to = node.to;
        if (state.doc.sliceString(to, to + 1) === " ") {
          to += 1;
        }
        decorations.push(hiddenMark.range(node.from, to));
        return;
      }

      if (name === "Link") {
        decorations.push(linkText.range(node.from, node.to));
        return;
      }

      if (name === "LinkMark" || name === "URL") {
        const parent = node.node.parent;
        if (!parent || parent.name !== "Link") {
          return;
        }
        if (shouldShowSource(state, parent.from, parent.to)) {
          return;
        }
        decorations.push(hiddenMark.range(node.from, node.to));
        return;
      }
    },
  });

  decorations.push(
    ...emphasisDecorations(state, (from, to) =>
      shouldShowSource(state, from, to),
    ),
  );

  return Decoration.set(decorations, true);
}

export const livePreview = StateField.define<DecorationSet>({
  create: (state) => buildDecorations(state),
  update: (decorations, tr) => {
    if (tr.docChanged || tr.selection) {
      return buildDecorations(tr.state);
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});
