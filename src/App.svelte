<script lang="ts">
  import { onMount } from "svelte";
  import NewNoteScreen from "./lib/Components/Content/NewNoteScreen.svelte";
  import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
  import AppRail from "./lib/Components/Rail/AppRail.svelte";
  import TabBar from "./lib/Components/Tabs/TabBar.svelte";
  import { selectedNoteIdStore, saveBeforeClose } from "./store/Store";
  import {
    loadLayout,
    setSidebarCollapsed,
    setSidebarWidth,
    sidebarCollapsed,
    sidebarDragResult,
    sidebarWidth,
  } from "./store/layout";
  import NotePane from "./lib/Components/Content/NotePane.svelte";

  const isMac = window.api.platform() === "darwin";

  let resize: { pointerId: number; startX: number; startWidth: number } | null =
    null;
  let previewWidth = 0;
  let previewCollapsed = false;

  $: width = resize ? (previewCollapsed ? 0 : previewWidth) : $sidebarWidth;

  onMount(() => {
    window.nav.onSaveBeforeClose(saveBeforeClose);
    void loadLayout();
  });

  function startResize(event: PointerEvent): void {
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    previewWidth = $sidebarWidth;
    previewCollapsed = false;
    resize = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: $sidebarWidth,
    };
  }

  function moveResize(event: PointerEvent): void {
    if (!resize || event.pointerId !== resize.pointerId) {
      return;
    }
    const result = sidebarDragResult(
      resize.startWidth + event.clientX - resize.startX,
    );
    previewCollapsed = result.collapsed;
    if (!result.collapsed) {
      previewWidth = result.width;
    }
  }

  function endResize(event: PointerEvent): void {
    if (!resize || event.pointerId !== resize.pointerId) {
      return;
    }
    if (previewCollapsed) {
      setSidebarCollapsed(true);
    } else {
      setSidebarWidth(previewWidth);
    }
    resize = null;
  }
</script>

<main class="bg-surface-base flex h-screen gap-1.5 overflow-hidden p-1.5">
  <AppRail />

  {#if !$sidebarCollapsed}
    <div
      class="sidebar-column flex flex-col overflow-hidden"
      style="width:{width}px;"
    >
      <div class="drag-region h-[26px] flex-none" class:pl-[52px]={isMac}></div>
      <MainSideBar />
    </div>

    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      class="separator"
      class:dragging={resize != null}
      onpointerdown={startResize}
      onpointermove={moveResize}
      onpointerup={endResize}
      onpointercancel={endResize}
    ></div>
  {/if}

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
    touch-action: none;
    z-index: 20;
    transition: background-color 150ms ease-in-out;
  }

  .separator:hover,
  .separator.dragging {
    background-color: var(--color-accent);
  }
</style>
