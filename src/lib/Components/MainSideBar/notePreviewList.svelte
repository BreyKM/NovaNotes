<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    loadNotes,
    sortedNotesStore,
    selectedNoteIdStore,
    handleNoteSelect,
  } from "../../../store/Store";
  import type { NoteMeta } from "../../../../shared/types";
  import { formatEdited } from "../../formatTime";
  import NotePreview from "./notePreview.svelte";

  const DETAILS_DELAY_MS = 400;

  let isLoading = $state(false);
  let details = $state<{ note: NoteMeta; top: number; left: number } | null>(
    null,
  );
  let detailsTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(async () => {
    isLoading = true;
    await loadNotes();
    isLoading = false;
  });

  onDestroy(() => clearTimeout(detailsTimer));

  function showDetailsSoon(note: NoteMeta, event: PointerEvent): void {
    clearTimeout(detailsTimer);
    const row = (event.currentTarget as HTMLElement).getBoundingClientRect();
    detailsTimer = setTimeout(() => {
      details = { note, top: row.top, left: row.right + 6 };
    }, DETAILS_DELAY_MS);
  }

  function hideDetails(): void {
    clearTimeout(detailsTimer);
    details = null;
  }
</script>

<div
  class="note-preview-list-container [&::-webkit-scrollbar-thumb]:bg-surface-chrome flex min-h-0 flex-1 flex-col overflow-y-auto
  px-1.5
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent"
>
  {#if isLoading}
    <p class="text-text-muted px-2 py-1 text-xs">Loading...</p>
  {:else if $sortedNotesStore.length === 0}
    <p class="text-text-muted px-2 py-1 text-xs">No notes yet</p>
  {:else}
    {#each $sortedNotesStore as note (note.id)}
      <NotePreview
        title={note.title}
        isActive={$selectedNoteIdStore === note.id}
        onclick={() => {
          hideDetails();
          void handleNoteSelect(note.id);
        }}
        onpointerenter={(event) => showDetailsSoon(note, event)}
        onpointerleave={hideDetails}
      />
    {/each}
  {/if}
</div>

{#if details}
  <div
    role="tooltip"
    class="bg-surface-base border-surface-raised pointer-events-none fixed z-40 max-w-[240px]
rounded-md border px-2.5 py-1.5 text-xs shadow-lg"
    style="top: {details.top}px; left: {details.left}px;"
  >
    <div class="text-text-primary truncate">{details.note.title}</div>
    <div class="text-text-muted truncate font-mono text-[11px]">
      {details.note.id}
    </div>
    <div class="text-text-muted">
      edited {formatEdited(details.note.lastEditTime, Date.now())}
    </div>
  </div>
{/if}
