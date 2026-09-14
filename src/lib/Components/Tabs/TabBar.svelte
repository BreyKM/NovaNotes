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

  onMount(() => {
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
  });

  async function syncContentView(index: number, isDirectClick: boolean): Promise<void> {
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

  function createTab(): void {
    window.tab.createTab();
  }
</script>

<div
  class="tab-bar z-11 mr-10 flex w-6/10 max-w-6/10 items-end overflow-hidden rounded-t"
>
  {#each $tabStore as tab, i}
    <Tab
      title={tab.title}
      active={i === $activeTabIndexStore}
      on:close={() => closeTab(i)}
      on:click={() => syncContentView(i, true)}
    />
  {/each}
  <button
    aria-label="create Tab"
    class="hover:bg-background-nav-hover new-tab-btn z-[999] mb-1 ml-2 rounded p-0.5"
    onclick={createTab}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
      /></svg
    ></button
  >
</div>
