<script>
  import { onMount, tick } from "svelte";
  import Tab from "./Tab.svelte";
  import {
    getNoteContent,
    noteContentStore,
    notesStore,
    selectedNoteIndexStore,
    selectedNoteStore,
    tabStore,
    isSwitchingTabs,
    userInputCurrentNoteTitle,
    activeTabIndexStore,
    closeTab
  } from "../../../store/Store";
  import { get } from "svelte/store";

  onMount(() => {
    window.tab.getTabs().then(({ tabs, activeIndex }) => {
      tabStore.set(tabs);
      activeTabIndexStore.set(activeIndex)
      syncContentView(activeIndex, false);
    });

    window.tab.onTabsUpdated(({ tabs, activeIndex }) => {
      tabStore.set(tabs);
      activeTabIndexStore.set(activeIndex)
      syncContentView(activeIndex, false);
    });
  });

//   function handleTabClick(index) {
//     syncContentView(index, true);
//   }

  async function syncContentView(index, isDirectClick) {
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

    noteContentStore.set("")
    if (tabToSync.noteId) {
      const noteIndexToSelect = get(notesStore).findIndex(
        (note) => note.id === tabToSync.noteId,
      );

      if (noteIndexToSelect !== -1) {
        selectedNoteIndexStore.set(noteIndexToSelect);

        const noteToRead = get(notesStore)[noteIndexToSelect];
        userInputCurrentNoteTitle.set(noteToRead.title);
        getNoteContent(noteToRead);
      }
    } else {
      selectedNoteIndexStore.set(null);
      userInputCurrentNoteTitle.set("");
    }
    await tick();
    isSwitchingTabs.set(false);
  }

//   export function handleCloseTab(index) {
//     if ($tabStore.length <= 1) return;

//     const updatedTabs = $tabStore.filter((_, i) => i !== index);

//     const newActiveIndex =
//       activeTab >= index && activeTab > 0 ? activeTab - 1 : activeTab;

//     window.tab.updateTabs(updatedTabs);

//     window.tab.activeTabIndex(newActiveIndex);
//   }

  async function createTab() {
    await window.tab.createTab();
  }
</script>

<div
  class="tab-bar fixed top-0 flex items-end z-11 h-10 w-6/10 max-w-6/10 overflow-x-hidden overflow-hidden mr-10 rounded-t"
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
    class="mb-1 ml-2 hover:bg-background-nav-hover rounded z-[999] new-tab-btn p-0.5"
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
