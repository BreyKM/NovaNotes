<script lang="ts">
  import { onMount } from "svelte";
  import {
    getActiveFolder,
    activeNotebookNameStore,
    createEmptyNote,
  } from "../../../store/Store";
  import NotePreviewList from "./notePreviewList.svelte";
  import NovaNotesIcon from "../../../assets/NovaNotesIcon.svelte";
  import NoteEditIcon from "../../../assets/noteEditsvg.svelte";

  export let style = "";
  export let containerElement: HTMLDivElement | undefined = undefined;

  onMount(() => {
    getActiveFolder();
  });
</script>

<div
  bind:this={containerElement}
  class="left-container h-100% bg-background-secondary flex max-w-3/4 min-w-1/5 flex-col"
  {style}
>
  <div
    class="titlebar-title bg-background-nav z-100 flex h-10 px-3 text-center text-[1.75rem]"
  >
    <NovaNotesIcon width="40" height="40" />
    <div class="mt-1 ml-2 h-full self-center text-center">Nova</div>
  </div>
  <div class="sidebar-main relative isolate flex flex-col overflow-hidden">
    <div class="Notebook-name-container mx-2 my-2">
      {#if $activeNotebookNameStore}
        <div
          class=" hover:bg-background-secondary-hover rounded-sm px-2 py-px text-sm hover:cursor-pointer"
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
        class=" create-note hover:bg-background-secondary-hover flex items-center justify-center rounded-md p-1 hover:cursor-pointer"
        aria-label="Add folder icon"
      >
        <NoteEditIcon width="1.5rem" height="1.5rem" stroke="#f2f2f2" />
      </button>
    </div>
    <NotePreviewList />
  </div>
</div>
