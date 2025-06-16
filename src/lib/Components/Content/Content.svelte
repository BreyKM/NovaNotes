<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Placeholder from "@tiptap/extension-placeholder";
  import { fly } from "svelte/transition";
  import { quintOut, quadInOut } from "svelte/easing";

  import {
    loadNotes,
    userInputCurrentNoteTitle,
    selectedNoteStore,
    handleAutoSaving,
    renameNote,
    updateNoteContent,
    isSwitchingTabs
  } from "../../../store/Store";
    import isValidFilename from "valid-filename";

  let unsubscribe;
  let editor;
  let element;

  let popupTimer;

  let debounceTimer;

  let isNoteFileNameValidPopupShow = false;
  let isNoteFileNameValid;

  const invalidCharacters = ' * " \ / < > : | ?' 

  onMount(async () => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit.configure({
          document: true,
        }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return "What’s the title?";
            }

            return "Can you add some further context?";
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "dark:prose-invert pt-8 relative focus:outline-none w-full",
        },
      },
      autofocus: "end",
      injectCSS: false,

      onTransaction: () => {
        editor = editor;
      },

      onUpdate: () => {
        updateNoteContent(editor.getJSON());
        console.log("editor.getJSON()", editor.getJSON());
      },
    });
  });

  afterUpdate(() => {
    if (editor && $selectedNoteStore) {
      editor.commands.setContent($selectedNoteStore.content);
      console.log("note.content", $selectedNoteStore.content);
      console.log("note.title", $selectedNoteStore.title);
    }
  });
  
  $: if($userInputCurrentNoteTitle && $selectedNoteStore && !$isSwitchingTabs) {
    if($userInputCurrentNoteTitle !== $selectedNoteStore.title) {
      if (isValidFilename($userInputCurrentNoteTitle)) {
        isNoteFileNameValid = true
        clearTimeout(debounceTimer)

      debounceTimer = setTimeout(() => {
        renameNote()
      }, 1500)
      } else {
        isNoteFileNameValid = false
        showInvalidNotebookNamePopup()
      }
  
    }
  }

  function handleTitleBlur() {
    if($isSwitchingTabs) return;

    clearTimeout(debounceTimer)
    renameNote()
  }

  function handleTitleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if ($userInputCurrentNoteTitle === "") {
        userInputCurrentNoteTitle.set($selectedNoteStore.title)
      }

      if (editor) {
        editor.commands.focus("end");
      }
    }
  }

  function showInvalidNotebookNamePopup() {
    isNoteFileNameValidPopupShow = true;
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      isNoteFileNameValidPopupShow = false;
    }, 3000); 
  }

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script> 

<div
  class="pt-16 px-48 flex flex-col content-container w-full h-screen overflow-hidden"
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
  >
  </div>
    {#if isNoteFileNameValidPopupShow === true}
      <div
        class="invalid-directory relative p-2 w-fit  text-sm mx-auto rounded-lg bg-background-error shadow-lg"
        in:fly={{ y: "100%", duration: 150, easing: quadInOut }}
        out:fly={{ y: "100%", duration: 150, easing: quadInOut }}
      >
        File name can not contain any of these characters: {invalidCharacters}
      </div>
    {/if}
</div>
  
  <div
    class="editor-container relative w-full h-screen overflow-y-auto"
    bind:this={element}
  ></div>
</div>


