<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Document from "@tiptap/extension-document";
  import Placeholder from "@tiptap/extension-placeholder";

  let unsubscribe;
  let editor;
  let element;

  const CustomDocument = Document.extend({
    content: "heading block*",
  });

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        CustomDocument,
        StarterKit.configure({
          document: false,
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
          class:
            " prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-lg relative m-10 focus:outline-none",
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
  class="editor-container relative w-full h-screen overflow-y-auto"
  bind:this={element}
></div>


