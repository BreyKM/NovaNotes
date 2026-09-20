<script lang="ts">
  import { onMount } from "svelte";
  import {
    loadNotes,
    notesStore,
    selectedNoteIdStore,
    handleNoteSelect,
    selectedNoteStore,
  } from "../../../store/Store";
  import { isEmpty } from "lodash";
  import NotePreview from "./notePreview.svelte";

  let isLoading = $state(false);

  const onSelect = (): void => {
    console.log("Selection finished from component.");
  };

  $effect(() => {
    console.log("NPL: ", $notesStore);
    console.log($selectedNoteIdStore);
    console.log("selectedNoteStore", $selectedNoteStore);
  });

  onMount(async () => {
    isLoading = true;
    await loadNotes();
    isLoading = false;
  });
</script>

<div
  class="note-preview-list-container dark:[&::-webkit-scrollbar-thumb]:bg-surface-chrome mr-0.5 ml-2 flex flex-col overflow-y-auto pr-2
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
      {#each $notesStore as note}
        <NotePreview
          title={note.title}
          isActive={$selectedNoteIdStore === note.id}
          on:click={() => handleNoteSelect(note.id, onSelect)}
        />
      {/each}
    {/if}
  </ul>
</div>
