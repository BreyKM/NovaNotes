<script lang="ts">
  import { derived } from "svelte/store";
  import NovaNotesIcon from "../../../assets/NovaNotesIcon.svelte";
  import {
    createEmptyNote,
    handleNoteSelect,
    notesStore,
    sortNotes,
  } from "../../../store/Store";
  import { formatEdited } from "../../formatTime";

  const RECENT_COUNT = 3;

  const recent = derived(notesStore, ($notesStore) =>
    sortNotes($notesStore, "edited").slice(0, RECENT_COUNT),
  );
</script>

<div
  class="flex h-full flex-col items-center justify-center overflow-hidden px-8"
>
  <div class="flex w-full max-w-[320px] flex-col items-center gap-6">
    <div aria-hidden="true" class="pointer-events-none opacity-60">
      <NovaNotesIcon width="320" height="120" />
    </div>

    <button
      class="facet bg-accent-fill hover:bg-accent-hover text-ui cursor-pointer px-3 py-1.5 text-white"
      onclick={() => void createEmptyNote()}
    >
      New note
    </button>

    {#if $recent.length > 0}
      <div class="flex w-full flex-col gap-0.5">
        <p class="text-text-faint text-label px-2 pb-1 tracking-wide uppercase">
          Recent
        </p>
        {#each $recent as note (note.id)}
          <button
            class="hover:bg-surface-raised text-text-secondary text-ui flex h-[30px] items-center gap-3 rounded-sm px-2 text-left"
            onclick={() => void handleNoteSelect(note.id)}
          >
            <span class="min-w-0 flex-1 truncate">{note.title}</span>
            <span class="text-text-faint text-label flex-none">
              {formatEdited(note.lastEditTime, Date.now())}
            </span>
          </button>
        {/each}
      </div>
    {/if}

    <p class="text-text-muted text-lg">Ctrl + N for a new note</p>
  </div>
</div>
