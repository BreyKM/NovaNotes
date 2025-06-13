<script>
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Placeholder from "@tiptap/extension-placeholder";

  import { userInputCurrentNoteTitle } from "../../store/Store"

  let unsubscribe;
  let editor;
  let element;

  $effect(() => {
    console.log($userInputCurrentNoteTitle)
  })


  onMount(() => {
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
        console.log(editor.getJSON());
      },
    });
  });

  function handleTitleKeydown(event) {
    // Check if the pressed key was 'Enter'
    if (event.key === "Enter") {
      // Prevent the default 'Enter' behavior (like adding a newline or submitting a form)
      event.preventDefault();

      // Use the Tiptap editor's built-in command to focus the editor.
      // The 'end' argument places the cursor at the very end of the content.
      if (editor) {
        editor.commands.focus("end");
      }
    }
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
  class="pt-16 px-48 flex flex-col content-container w-screen h-screen overflow-hidden"
>
    <div
      class=" note-title text-4xl outline-none font-bold"
      tabindex="-1"
      onkeydown={handleTitleKeydown}
      contenteditable="true"
      role="none"
      bind:textContent={$userInputCurrentNoteTitle}
    >
  </div>
  <div
    class="editor-container relative w-full h-screen overflow-y-auto"
    bind:this={element}
  ></div>
</div>
