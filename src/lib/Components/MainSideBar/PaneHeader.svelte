<script lang="ts">
  import FilePlus from "@lucide/svelte/icons/file-plus";
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import Check from "@lucide/svelte/icons/check";
  import type { NoteSort } from "../../../../shared/types";
  import { createEmptyNote } from "../../../store/Store";
  import { noteSort, setNoteSort } from "../../../store/layout";

  const SORT_OPTIONS: { value: NoteSort; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "edited", label: "Recently edited" },
  ];

  let sortMenu: HTMLDivElement | undefined = $state();
  let menuOpen = $state(false);

  function choose(sort: NoteSort): void {
    setNoteSort(sort);
    menuOpen = false;
  }

  function closeOnOutsideClick(event: MouseEvent): void {
    if (menuOpen && !sortMenu?.contains(event.target as Node)) {
      menuOpen = false;
    }
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      menuOpen = false;
    }
  }
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div class="flex flex-none items-center gap-0.5 px-1.5 pt-1.5 pb-1">
  <button
    onclick={() => void createEmptyNote()}
    class="text-text-muted hover:text-text-primary hover:bg-surface-raised rounded p-1"
    aria-label="New note"
    title="New note"
  >
    <FilePlus size={15} strokeWidth={1.5} />
  </button>
  <div bind:this={sortMenu} class="relative">
    <button
      onclick={() => (menuOpen = !menuOpen)}
      class="text-text-muted hover:text-text-primary hover:bg-surface-raised rounded p-1"
      aria-label="Sort notes"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      title="Sort notes"
    >
      <ArrowUpDown size={15} strokeWidth={1.5} />
    </button>

    {#if menuOpen}
      <div
        role="menu"
        class="bg-surface-base border-surface-raised absolute top-full left-1.5 z-30 min-w-[168px]
rounded-md border py-1 text-xs shadow-lg"
      >
        {#each SORT_OPTIONS as option (option.value)}
          <button
            role="menuitemradio"
            aria-checked={$noteSort === option.value}
            onclick={() => choose(option.value)}
            class="hover:bg-surface-raised flex w-full items-center gap-2 px-2 py-1 text-left"
          >
            <span class="flex w-3.5 justify-center">
              {#if $noteSort === option.value}
                <Check size={13} strokeWidth={2} />
              {/if}
            </span>
            {option.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
