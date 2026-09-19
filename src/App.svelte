<script lang="ts">
  import { onMount } from "svelte";
  import NewNoteScreen from "./lib/Components/Content/NewNoteScreen.svelte";
  import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
  import Nav from "./lib/Components/Nav/Nav.svelte";
  import TabBar from "./lib/Components/Tabs/TabBar.svelte";
  import { selectedNoteIdStore, saveBeforeClose } from "./store/Store";
  import { onDrag } from "./lib/placeholder/dragMe";
  import NotePane from "./lib/Components/Content/NotePane.svelte";

  let width = 0;
  let resizeWidth = width;
  let isDragging = false;

  let mainSideBarRef: HTMLDivElement | undefined;
  let minWidthInPixels = 0;

  onMount(() => {
    window.nav.onSaveBeforeClose(saveBeforeClose);

    if (mainSideBarRef) {
      const rect = mainSideBarRef.getBoundingClientRect();
      minWidthInPixels = rect.width;

      width = rect.width;
      resizeWidth = rect.width;
    }
  });

  function handleDrag(
    event: CustomEvent<{ delta: number; initialWidth: number }>,
  ): void {
    const { delta, initialWidth } = event.detail;
    const newWidth = initialWidth + delta;

    resizeWidth = Math.max(minWidthInPixels, newWidth);
  }

  function handleDragEnd(): void {
    isDragging = false;
    width = resizeWidth;
  }

  function handleDragStart(): void {
    isDragging = true;
  }
</script>

<main class="relative flex h-screen flex-col overflow-hidden">
  <Nav />
  <div class="content-wrapper flex h-full w-full">
    <MainSideBar
      bind:containerElement={mainSideBarRef}
      style="width:{resizeWidth}px; flex-shrink: 0;"
    />
    <hr
      aria-orientation="vertical"
      style=" cursor: col-resize; z-index: 999;"
      class="separator"
      class:dragging={isDragging}
      use:onDrag={{ orientation: "vertical", initialWidth: width }}
      on:dragStart={handleDragStart}
      on:drag={handleDrag}
      on:dragEnd={handleDragEnd}
    />
    <div class="MainContent flex h-full w-full flex-col overflow-x-hidden">
      <!-- <div style="position:absolute; top: 10px; left: 10px; background: black; color: white; padding: 5px; z-index: 1000;">
      Live Width: {Math.round(resizeWidth)}px
    </div> -->
      <TabBar />
      {#if $selectedNoteIdStore === null}
        <NewNoteScreen />
      {:else}
        <NotePane />
      {/if}
    </div>
  </div>
</main>

<style>
  .separator {
    height: 100%;
    position: relative;
    background-color: transparent;
    border-color: var(--color-background-nav);
    width: 3px;
    border-width: 0px;
    border-left-width: 1px;

    margin-top: 40px;
    transition:
      background-color 200ms,
      ease-in-out,
      border-color 200ms ease-in-out,
      margin-top 50ms ease-in-out;
  }

  .separator:hover,
  .separator.dragging {
    width: 3px;
    background-color: var(--color-primary);
    margin-top: 0px;
    border-color: var(--color-primary);
  }
</style>
