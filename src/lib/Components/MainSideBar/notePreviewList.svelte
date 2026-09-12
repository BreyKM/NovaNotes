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

<div
  class="note-preview-list-container dark:[&::-webkit-scrollbar-thumb]:bg-background-nav mr-0.5 ml-2 flex flex-col overflow-y-auto pr-2
    text-sm
    [&::-webkit-scrollbar]:m-3
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  dark:[&::-webkit-scrollbar-track]:bg-transparent"
>
  <ul>
    {#if isLoading}
      <p class="flex h-full w-full items-center justify-center text-2xl">
        Loading...
      </p>
    {:else if isEmpty($notesStore)}
      <p class="flex h-full w-full items-center justify-center text-2xl">
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
