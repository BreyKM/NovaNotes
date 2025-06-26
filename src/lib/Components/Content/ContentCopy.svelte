<script>
  import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
  import { history } from "@milkdown/kit/plugin/history";
  import { commonmark } from "@milkdown/kit/preset/commonmark";
  import { clipboard } from "@milkdown/kit/plugin/clipboard";
  import { indent, indentConfig } from "@milkdown/plugin-indent";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import { getMarkdown, replaceAll } from "@milkdown/kit/utils";

  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { nord } from "@milkdown/theme-nord";
  import { fly } from "svelte/transition";
  import { quintOut, quadInOut } from "svelte/easing";
  import isValidFilename from "valid-filename";
  import {
    loadNotes,
    userInputCurrentNoteTitle,
    selectedNoteStore,
    handleAutoSaving,
    renameNote,
    updateNoteContent,
    isSwitchingTabs,
  } from "../../../store/Store";

  import "./Content.css"
  import '@milkdown/theme-nord/style.css';

  let popupTimer;

  let debounceTimer;

  let isNoteFileNameValidPopupShow = false;
  let isNoteFileNameValid;

  let editorInstance = null;
  let editorContainer;

  const invalidCharacters = ' * " \\\ / < > : | ?';

  onMount(() => {
    const makeEditor = async () => {
      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, editorContainer);
          ctx.set(defaultValueCtx, "");
          ctx.set(indentConfig.key, {
            type: "space",
            size: 4,
          });
          ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
            if (doc.content.eq(prevDoc.content)) {
              return;
            }
            const markdown = editorInstance.action(getMarkdown());
            updateNoteContent(markdown);
            handleAutoSaving(markdown);
          });
        })
        .use(nord)
        .use(commonmark)
        .use(history)
        .use(clipboard)
        .use(indent)
        .use(listener)
        .create();

      editorInstance = editor;
    };
    makeEditor();
  });

  afterUpdate(() => {
    if (editorInstance && $selectedNoteStore) {
      const currentMarkdown = editorInstance.action(getMarkdown());
      if (currentMarkdown !== $selectedNoteStore.content) {
        editorInstance.action(replaceAll($selectedNoteStore.content || ""));
      }
    }
  });

  $: if (
    $userInputCurrentNoteTitle &&
    $selectedNoteStore &&
    !$isSwitchingTabs
  ) {
    if ($userInputCurrentNoteTitle !== $selectedNoteStore.title) {
      if (isValidFilename($userInputCurrentNoteTitle)) {
        isNoteFileNameValid = true;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          renameNote();
        }, 1500);
      } else {
        isNoteFileNameValid = false;
        showInvalidNotebookNamePopup();
      }
    }
  }

  function handleTitleBlur() {
    if ($isSwitchingTabs) return;

    clearTimeout(debounceTimer);
    renameNote();
  }

  function handleTitleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if ($userInputCurrentNoteTitle === "") {
        userInputCurrentNoteTitle.set($selectedNoteStore.title);
      }
    }
  }

  function showInvalidNotebookNamePopup() {
    isNoteFileNameValidPopupShow = true;
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      isNoteFileNameValidPopupShow = false;
    }, 500);
  }

  onDestroy(() => {
    if (editorInstance) {
      editorInstance.destroy();
    }
  });
</script>

<div
  class="pt-10 px-48 flex flex-col content-container h-screen overflow-y-auto overflow-x-hidden mr-0.5 mt-10
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar]:mt-10
  [&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
dark:[&::-webkit-scrollbar-thumb]:bg-background-nav
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:rounded-full"
>
  <div class="note-title-container">
    <div
      class=" note-title text-4xl outline-none font-bold"
      tabindex="-1"
      onkeydown={handleTitleKeydown}
      onblur={handleTitleBlur}
      contenteditable="true"
      role="none"
      bind:textContent={$userInputCurrentNoteTitle}
    ></div>
    {#if isNoteFileNameValidPopupShow === true}
      <div
        class="invalid-directory relative p-2 w-fit text-sm mx-auto rounded-lg bg-background-error shadow-lg"
        in:fly={{ y: "100%", duration: 150, easing: quadInOut }}
        out:fly={{ y: "100%", duration: 150, easing: quadInOut }}
      >
        File name can not contain any of these characters: {invalidCharacters}
      </div>
    {/if}
  </div>

  <div
    bind:this={editorContainer}
    class="  editor-container relative w-full h-screen"
  ></div>
</div>


