<script lang="ts">
  import { onMount } from "svelte";
  import NewNoteScreen from "./lib/Components/Content/NewNoteScreen.svelte";
  import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
  import TabBar from "./lib/Components/Tabs/TabBar.svelte";
  import { selectedNoteIdStore, saveBeforeClose } from "./store/Store";
  import { onDrag } from "./lib/placeholder/dragMe";
  import NotePane from "./lib/Components/Content/NotePane.svelte";

  const MIN_SIDEBAR_WIDTH = 160;
  const MAX_SIDEBAR_WIDTH = 420;
  const isMac = window.api.platform() === "darwin";

  let sidebarWidth = 220;
  let resizeWidth = sidebarWidth;
  let isDragging = false;

  onMount(() => {
    window.nav.onSaveBeforeClose(saveBeforeClose);
  });

  function handleDrag(
    event: CustomEvent<{ delta: number; initialWidth: number }>,
  ): void {
    const { delta, initialWidth } = event.detail;
    resizeWidth = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, initialWidth + delta),
    );
  }

  function handleDragStart(): void {
    isDragging = true;
  }

  function handleDragEnd(): void {
    isDragging = false;
    sidebarWidth = resizeWidth;
  }
</script>

<main class="bg-surface-base flex h-screen gap-1.5 overflow-hidden p-1.5">
  <div
    class="sidebar-column flex flex-col"
    style="width:{resizeWidth}px; flex-shrink: 0"
  >
    <div class="drag-region h-[26px] flex-none" class:pl-[78px]={isMac}></div>
    <MainSideBar />
  </div>
  <div
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize sidebar"
    class="separator"
    class:dragging={isDragging}
    use:onDrag={{ orientation: "vertical", initialWidth: sidebarWidth }}
    on:dragStart={handleDragStart}
    on:drag={handleDrag}
    on:dragEnd={handleDragEnd}
  ></div>

  <div class="editor-column flex min-w-0 flex-1 flex-col">
    <TabBar />
    <div
      class="bg-surface-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-tr-md rounded-b-md"
    >
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
    position: relative;
    align-self: stretch;
    width: 3px;
    margin: 0px -3px;
    border: 0;
    background-color: var(--color-surface-raised);
    background-clip: content-box;
    padding: 0 1px;
    cursor: col-resize;
    z-index: 20;
    transition: background-color 150ms ease-in-out;
  }

  .separator:hover,
  .separator.dragging {
    background-color: var(--color-accent);
  }
</style>
