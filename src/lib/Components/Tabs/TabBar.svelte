<script lang="ts">
  import { onMount, tick } from "svelte";
  import Tab from "./Tab.svelte";
  import {
    getNoteContent,
    noteContentStore,
    notesStore,
    selectedNoteIdStore,
    tabStore,
    isSwitchingTabs,
    userInputCurrentNoteTitle,
    activeTabIndexStore,
    closeTab,
    handleAutoSaving,
  } from "../../../store/Store";
  import { get } from "svelte/store";
  import WindowControls from "./WindowControls.svelte";
  import { sidebarCollapsed } from "../../../store/layout";

  onMount(() => {
    const observer = new ResizeObserver(updateScrollHints);
    if (strip) {
      observer.observe(strip);
    }

    window.tab.getTabs().then(({ tabs, activeIndex }) => {
      tabStore.set(tabs);
      activeTabIndexStore.set(activeIndex);
      syncContentView(activeIndex, false);
    });

    window.tab.onTabsUpdated(({ tabs, activeIndex }) => {
      tabStore.set(tabs);
      activeTabIndexStore.set(activeIndex);
      syncContentView(activeIndex, false);
    });

    return () => observer.disconnect();
  });

  async function syncContentView(
    index: number,
    isDirectClick: boolean,
  ): Promise<void> {
    handleAutoSaving.flush();
    isSwitchingTabs.set(true);

    const tabToSync = get(tabStore)[index];

    if (tabToSync === undefined) {
      await tick();
      isSwitchingTabs.set(false);
      return;
    }

    $activeTabIndexStore = index;

    if (isDirectClick) {
      window.tab.activeTabIndex(index);
    }

    noteContentStore.set("");
    if (tabToSync.noteId) {
      const noteToSelect = get(notesStore).find(
        (note) => note.id === tabToSync.noteId,
      );

      if (noteToSelect) {
        selectedNoteIdStore.set(noteToSelect.id);
        userInputCurrentNoteTitle.set(noteToSelect.title);
        getNoteContent(noteToSelect);
      }
    } else {
      selectedNoteIdStore.set(null);
      userInputCurrentNoteTitle.set("");
    }
    await tick();
    isSwitchingTabs.set(false);
  }

  let strip: HTMLDivElement | undefined;
  let canScrollLeft = false;
  let canScrollRight = false;

  function updateScrollHints(): void {
    if (!strip) {
      return;
    }
    canScrollLeft = strip.scrollLeft > 1;
    canScrollRight =
      strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1;
  }

  $: if (strip && $tabStore) {
    queueMicrotask(updateScrollHints);
  }

  function scrollTabs(event: WheelEvent): void {
    const strip = event.currentTarget as HTMLDivElement;
    if (event.deltaY === 0 || strip.scrollWidth <= strip.clientWidth) {
      return;
    }
    event.preventDefault();
    strip.scrollLeft += event.deltaY;
  }

  function createTab(): void {
    window.tab.createTab();
  }
</script>

<div class="flex h-[32px] items-end">
  {#if $sidebarCollapsed}
    <div class="drag-region h-full w-6 flex-none"></div>
  {/if}
  <div
    bind:this={strip}
    class="tab-strip flex min-w-0 shrink items-end gap-0.5 overflow-x-auto"
    class:fade-left={canScrollLeft}
    class:fade-right={canScrollRight}
    onwheel={scrollTabs}
    onscroll={updateScrollHints}
  >
    {#each $tabStore as tab, i (tab.tabId)}
      <Tab
        title={tab.title}
        active={i === $activeTabIndexStore}
        on:close={() => closeTab(i)}
        on:click={() => syncContentView(i, true)}
      />
    {/each}
  </div>
  <button
    aria-label="createTab"
    class="hover:bg-surface-raised text-text-muted hover:text-text-primary ml-1 flex h-6 w-6 flex-none items-center justify-center self-center rounded"
    onclick={createTab}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
      /></svg
    ></button
  >
  <div class="drag-region h-full min-w-12 flex-1"></div>
  <WindowControls />
</div>

<style>
  /* isolation keeps the scrolled tabs out of the window drag-region
     calculation; without it, scrolling the strip stops the sidebar header
     dragging the window. See electron/electron#52063. */
  .tab-strip {
    scrollbar-width: none;
    isolation: isolate;
  }

  .tab-strip::-webkit-scrollbar {
    display: none;
  }

  .tab-strip.fade-right {
    mask-image: linear-gradient(to right, black calc(100% - 24px), transparent);
  }

  .tab-strip.fade-left {
    mask-image: linear-gradient(to right, transparent, black 24px);
  }

  .tab-strip.fade-left.fade-right {
    mask-image: linear-gradient(
      to right,
      transparent,
      black 24px,
      black calc(100% - 24px),
      transparent
    );
  }
</style>
