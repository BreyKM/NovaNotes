<script lang="ts">
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import BookIcon from "@lucide/svelte/icons/book";
  import Check from "@lucide/svelte/icons/check";
  import type { NoteSort } from "../../../../shared/types";
  import { activeNotebookNameStore } from "../../../store/Store";
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

<div class="flex h-[32px] flex-none items-center gap-1.5 pr-1.5 pl-3">
  <BookIcon size={15} strokeWidth={1.5} class="text-text-muted flex-none" />
  <span class="text-text-secondary text-ui min-w-0 flex-1 truncate">
    {$activeNotebookNameStore ?? ""}
  </span>

  <div bind:this={sortMenu} class="relative flex-none">
    <button
      onclick={() => (menuOpen = !menuOpen)}
      class="text-text-muted hover:text-text-primary hover:bg-surface-raised flex h-6 w-6 items-center justify-center rounded"
      aria-label="Sort notes"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      title="Sort notes"
    >
      <ArrowUpDown size={17} strokeWidth={1.5} />
    </button>

    {#if menuOpen}
      <div
        class="facet bg-border-strong absolute top-full right-0 z-30 min-w-[168px] rounded-md p-px"
      >
        <div
          role="menu"
          class="facet bg-surface-raised text-ui rounded-md py-1"
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
      </div>
    {/if}
  </div>
</div>
