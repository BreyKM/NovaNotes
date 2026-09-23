<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";
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
  const DETAILS_LINGER_MS = 120;

  const fadeMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 150;

  let isLoading = $state(false);
  let details = $state<{ note: NoteMeta; top: number; left: number } | null>(
    null,
  );
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(async () => {
    isLoading = true;
    await loadNotes();
    isLoading = false;
  });

  onDestroy(() => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
  });

  function placeAt(note: NoteMeta, row: HTMLElement) {
    const box = row.getBoundingClientRect();
    return { note, top: box.top, left: box.right + 6 };
  }

  function showDetails(note: NoteMeta, event: PointerEvent): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    const row = event.currentTarget as HTMLElement;

    if (details) {
      details = placeAt(note, row);
      return;
    }

    showTimer = setTimeout(() => {
      details = placeAt(note, row);
    }, DETAILS_DELAY_MS);
  }

  function hideDetailsSoon(): void {
    clearTimeout(showTimer);
    hideTimer = setTimeout(() => {
      details = null;
    }, DETAILS_LINGER_MS);
  }

  function hideDetailsNow(): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    details = null;
  }
</script>

<div
  class="note-preview-list-container flex min-h-0 flex-1 scrollbar-gutter-stable flex-col gap-0.5 overflow-y-auto
pl-1.5"
  onscroll={hideDetailsNow}
>
  {#if isLoading}
    <p class="text-text-muted text-ui px-2 py-1">Loading...</p>
  {:else if $sortedNotesStore.length === 0}
    <p class="text-text-muted text-ui px-2 py-1">No notes yet</p>
  {:else}
    {#each $sortedNotesStore as note (note.id)}
      <NotePreview
        title={note.title}
        isActive={$selectedNoteIdStore === note.id}
        onclick={() => {
          hideDetailsNow();
          void handleNoteSelect(note.id);
        }}
        onpointerenter={(event) => showDetails(note, event)}
        onpointerleave={hideDetailsSoon}
      />
    {/each}
  {/if}
</div>

{#if details}
  <div
    class="note-details facet bg-border-strong pointer-events-none fixed z-40 max-w-[240px] rounded-md p-px"
    style="top: {details.top}px; left: {details.left}px;"
    transition:fade={{ duration: fadeMs }}
  >
    <div
      role="tooltip"
      class="facet bg-surface-raised text-ui rounded-md px-2.5 py-1.5"
    >
      <div class="text-text-primary truncate">{details.note.title}</div>
      <div class="text-text-muted">
        edited {formatEdited(details.note.lastEditTime, Date.now())}
      </div>
    </div>
  </div>
{/if}

<style>
  .note-details {
    transition:
      top 150ms ease-out,
      left 150ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .note-details {
      transition: none;
    }
  }
</style>
