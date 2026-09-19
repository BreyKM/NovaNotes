import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import { EditorView } from "@codemirror/view";
import { shouldShowSource } from "./livePreview";

function linkAt(state: EditorState, pos: number): SyntaxNode | null {
  let node = syntaxTree(state).resolveInner(pos);
  while (node.name !== "Link") {
    if (!node.parent) {
      return null;
    }
    node = node.parent;
  }
  return node;
}

export const openLinkOnClick = EditorView.domEventHandlers({
  mousedown(event, view) {
    if (event.button !== 0) {
      return false;
    }

    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null) {
      return false;
    }

    const link = linkAt(view.state, pos);
    if (!link) {
      return false;
    }

    if (shouldShowSource(view.state, link.from, link.to)) {
      return false;
    }

    const url = link.getChild("URL");
    if (!url) {
      return false;
    }

    event.preventDefault();
    void window.main.openLink(view.state.doc.sliceString(url.from, url.to));
    return true;
  },
});
