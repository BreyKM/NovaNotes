<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, keymap } from "@codemirror/view";
  import { EditorState, Annotation, Transaction } from "@codemirror/state";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { markdown } from "@codemirror/lang-markdown";
  import { noteContentStore, updateNoteContent } from "../../../store/Store";
  import { livePreview } from "./livePreview";

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
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          livePreview,
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

<div class="cm-wrapper mx-auto flex min-h-0 w-[80%] flex-1 flex-col px-8 pt-10">
  <div
    bind:this={editorContainer}
    class="cm-host min-h-0 w-full max-w-[700px] flex-1"
  ></div>
</div>

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

  .cm-host :global(.cm-markup-hidden) {
    font-size: 0.01em;
    opacity: 0;
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
</style>
