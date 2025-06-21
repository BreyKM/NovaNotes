<script>
  import { onMount } from "svelte";
  import {
    loadNotes,
    notesStore,
    selectedNoteIndexStore,
    handleNoteSelect,
    selectedNoteStore,
    userInputCurrentNoteTitle,
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
    console.log("selectedNoteStore", $selectedNoteStore);
  });

  onMount(async () => {
    isLoading = true;
    await loadNotes();
    isLoading = false;
  });
</script>

<div class="note-preview-list-container overflow-y-auto ml-2 mr-0.5 pr-2 text-sm flex flex-col
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar]:m-3
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
  dark:[&::-webkit-scrollbar-thumb]:bg-background-nav
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:rounded-full">
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
