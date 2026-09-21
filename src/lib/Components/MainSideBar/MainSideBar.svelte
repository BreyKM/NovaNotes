<script lang="ts">
  import { onMount } from "svelte";
  import {
    getActiveFolder,
    activeNotebookNameStore,
    createEmptyNote,
  } from "../../../store/Store";
  import NotePreviewList from "./notePreviewList.svelte";
  import NoteEditIcon from "../../../assets/noteEditsvg.svelte";

  onMount(() => {
    getActiveFolder();
  });
</script>

<div
  class="left-container bg-surface-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-md"
>
  <div
    class="sidebar-main relative isolate flex min-h-0 flex-1 flex-col overflow-hidden"
  >
    <div class="Notebook-name-container mx-2 my-2">
      {#if $activeNotebookNameStore}
        <div
          class=" hover:bg-surface-raised rounded-sm px-2 py-px text-sm hover:cursor-pointer"
        >
          {$activeNotebookNameStore}
        </div>
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
    <div class="new-icons flex justify-center self-center">
      <button
        on:click={createEmptyNote}
        class=" create-note hover:bg-surface-raised flex items-center justify-center rounded-md p-1 hover:cursor-pointer"
        aria-label="Add folder icon"
      >
        <NoteEditIcon width="1.5rem" height="1.5rem" stroke="#f2f2f2" />
      </button>
    </div>
    <NotePreviewList />
  </div>
</div>
