<script>
  import { onMount } from "svelte";
  import {
    loadNotes,
    notesStore,
    selectedNoteIndexStore,
    handleNoteSelect,
    selectedNoteStore,
  } from "../../../store/Store";
  import { isEmpty } from "lodash";
  import NotePreview from "./notePreview.svelte";

  let isLoading = $state(false);

  const onSelect = () => {
    console.log("Selection finished from component.");
  };

  $effect(() => {
    console.log("NPL: ", $notesStore);
    console.log($selectedNoteIndexStore);
    console.log("slectedNoteStore", $selectedNoteStore);
  });

  onMount(async () => {
    isLoading = true;
    await loadNotes();
    isLoading = false;
  });
</script>

<div class="note-preview-list-container">
  <ul>
    {#if isLoading}
      <p class="flex justify-center items-center w-full h-full text-2xl">
        Loading...
      </p>
    {:else if isEmpty($notesStore)}
      <p class="flex justify-center items-center w-full h-full text-2xl">
        No notes yet!
      </p>
    {:else}
      {#each $notesStore as note, index}
        <NotePreview
          title={note.title}
          isActive={$selectedNoteIndexStore === index}
          on:click={() => handleNoteSelect(index, onSelect)}
        />
      {/each}
    {/if}
  </ul>
</div>
