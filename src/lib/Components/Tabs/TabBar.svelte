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
  import { sidebarCollapsedView, sidebarDrag } from "../../../store/layout";

  const TAB_GAP = 2;

  onMount(() => {
    bar?.addEventListener("pointerleave", releaseTabWidth);

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

    return () => {
      bar?.removeEventListener("pointerleave", releaseTabWidth);
    };
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

  let bar: HTMLDivElement | undefined;
  let strip: HTMLDivElement | undefined;
  let lockedTabWidth: number | null = null;
  let heldWidth = 0;

  function closeTabAt(index: number): void {
    const openTab = strip?.firstElementChild;
    if (openTab && get(tabStore).length > 1) {
      const box = openTab.getBoundingClientRect();
      lockedTabWidth = box.width;
      // hold the strip's scrollable width too, or the browser clamps
      // scrollLeft the moment the tabs fit and everything jumps sideways
      heldWidth += box.width + TAB_GAP;
    }
    closeTab(index);
  }

  function releaseTabWidth(): void {
    lockedTabWidth = null;
    heldWidth = 0;
  }

  $: stripStyle = [
    lockedTabWidth === null
      ? ""
      : `--tab-width:${lockedTabWidth}px; --tab-shrink:0;`,
    lockedTabWidth !== null || $sidebarDrag ? "--tab-transition:0ms;" : "",
  ].join(" ");

  function createTab(): void {
    window.tab.createTab();
  }
</script>

<div bind:this={bar} class="flex h-[32px] items-end">
  <div
    class="drag-region sidebar-gap h-full flex-none"
    class:animated={$sidebarDrag == null}
    style="width:{$sidebarCollapsedView ? 24 : 0}px"
  ></div>
  <div
    bind:this={strip}
    class="tab-strip flex min-w-0 shrink items-end gap-0.5 overflow-hidden"
    style={stripStyle}
  >
    {#each $tabStore as tab, i (tab.tabId)}
      <Tab
        title={tab.title}
        active={i === $activeTabIndexStore}
        on:close={() => closeTabAt(i)}
        on:click={() => syncContentView(i, true)}
      />
    {/each}
    {#if heldWidth > 0}
      <div class="flex-none" style="width:{heldWidth}px"></div>
    {/if}
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
  .sidebar-gap.animated {
    transition: width 250ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-gap.animated {
      transition: none;
    }
  }

  /* isolation keeps the scrolled tabs out of the window drag-region
     calculation; without it, scrolling the strip stops the sidebar header
     dragging the window. See electron/electron#52063. */
  .tab-strip {
    isolation: isolate;
  }

  .tab-strip :global(.tab + .tab)::before {
    content: "";
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 0;
    width: 1px;
    background-color: var(--color-border);
  }

  .tab-strip :global(.tab.active)::before,
  .tab-strip :global(.tab:hover)::before {
    display: none;
  }
</style>
