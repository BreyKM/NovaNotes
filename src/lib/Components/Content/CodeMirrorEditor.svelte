<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, keymap } from "@codemirror/view";
  import { EditorState, Annotation, Transaction } from "@codemirror/state";
  import {
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab,
  } from "@codemirror/commands";
  import { markdown } from "@codemirror/lang-markdown";
  import { noteContentStore, updateNoteContent } from "../../../store/Store";
  import { livePreview } from "./livePreview";
  import { openLinkOnClick } from "./linkClick";
  import { autoPair } from "./autoPairs";
  import { indentKeymap } from "./indentKeymap";
  import { indentUnit, syntaxHighlighting } from "@codemirror/language";
  import { languages } from "@codemirror/language-data";
  import { codeHighlight } from "./codeBlocks";
  import { resolveLanguage } from "./codeLanguages";

  const externalSync = Annotation.define<boolean>();
  let editorContainer: HTMLDivElement | undefined;
  let view: EditorView | null = null;

  onMount(() => {
    if (!editorContainer) {
      return;
    }

    view = new EditorView({
      parent: editorContainer,
      state: EditorState.create({
        doc: $noteContentStore,
        extensions: [
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
            if (!update.docChanged) {
              return;
            }

            if (update.transactions.some((tr) => tr.annotation(externalSync))) {
              return;
            }

            updateNoteContent(update.state.doc.toString());
          }),
        ],
      }),
    });
  });

  $: if (view != null && $noteContentStore !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: $noteContentStore,
      },
      annotations: [externalSync.of(true), Transaction.addToHistory.of(false)],
      selection: { anchor: 0 },
    });
  }

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div
  bind:this={editorContainer}
  class="cm-host min-h-0 w-full max-w-[700px] flex-1"
></div>

<style>
  .cm-host :global(.cm-editor) {
    height: 100%;
  }

  .cm-host :global(.cm-editor.cm-focused) {
    outline: none;
  }

  .cm-host :global(.cm-scroller) {
    font-family: inherit;
    line-height: 1.6;
  }

  .cm-host :global(.cm-content) {
    caret-color: var(--color-text-primary);
  }

  .cm-host :global(.cm-heading) {
    font-weight: 700;
    line-height: 1.3;
  }

  .cm-host :global(.cm-heading-1) {
    font-size: 1.9em;
  }
  .cm-host :global(.cm-heading-2) {
    font-size: 1.6em;
  }
  .cm-host :global(.cm-heading-3) {
    font-size: 1.35em;
  }
  .cm-host :global(.cm-heading-4) {
    font-size: 1.2em;
  }
  .cm-host :global(.cm-heading-5) {
    font-size: 1.1em;
  }
  .cm-host :global(.cm-heading-6) {
    font-size: 1em;
  }

  .cm-host :global(.cm-strong) {
    font-weight: 700;
  }
  .cm-host :global(.cm-emphasis) {
    font-style: italic;
  }

  .cm-host :global(.cm-link) {
    color: var(--color-primary);
    text-decoration: underline;
    cursor: pointer;
  }

  .cm-host :global(.cm-indent),
  .cm-host :global(.cm-list-marker) {
    display: inline-block;
    text-indent: 0;
  }

  .cm-host :global(.cm-codeblock) {
    background-color: var(--color-background-secondary);
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
    font-size: 0.9em;
  }

  .cm-host :global(.cm-codeblock-first) {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .cm-host :global(.cm-codeblock-last) {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .cm-host :global(.cm-inline-code) {
    background-color: var(--color-background-secondary);
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
    font-size: 0.9em;
    border-radius: 4px;
    padding: 0.1em 0.3em;
  }

  .cm-host :global(.cm-codeblock-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 2px 10px;
    background-color: var(--color-background-secondary);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    user-select: none;
  }

  .cm-host :global(.cm-codeblock-header-alone) {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .cm-host :global(.cm-codeblock-language) {
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
    font-size: 0.75em;
    color: inherit;
    opacity: 0.6;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .cm-host :global(.cm-codeblock-language:hover),
  .cm-host :global(.cm-codeblock-language:focus-visible) {
    opacity: 1;
  }
  .cm-host :global(.cm-codeblock-language option) {
    background-color: var(--color-background-secondary);
    color: var(--color-text-primary);
  }

  .cm-host :global(.cm-codeblock-copy) {
    display: inline-flex;
    align-items: center;
    padding: 0;
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
    font-size: 0.75em;
  }
  .cm-host :global(.cm-codeblock-copy:hover) {
    opacity: 1;
  }
</style>
