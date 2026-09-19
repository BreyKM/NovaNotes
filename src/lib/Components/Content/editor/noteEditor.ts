import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { indentUnit, syntaxHighlighting } from "@codemirror/language";
import { livePreview } from "./livePreview";
import { openLinkOnClick } from "./linkClick";
import { autoPair } from "./autoPairs";
import { indentKeymap } from "./indentKeymap";
import { codeHighlight } from "./codeBlocks";
import { resolveLanguage } from "./codeLanguages";

export function noteExtensions(onEdit: (text: string) => void): Extension[] {
  return [
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    indentUnit.of("    "),
    markdown({ codeLanguages: resolveLanguage }),
    syntaxHighlighting(codeHighlight),
    livePreview,
    openLinkOnClick,
    autoPair,
    indentKeymap,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onEdit(update.state.doc.toString());
      }
    }),
  ];
}

export function loadNote(
  view: EditorView,
  text: string,
  extensions: Extension[],
): void {
  view.setState(EditorState.create({ doc: text, extensions }));
}
