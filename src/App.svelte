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
    sidebarCollapsedView,
    sidebarDrag,
    sidebarDragResult,
    sidebarWidth,
    sidebarWidthView,
  } from "./store/layout";
  import NotePane from "./lib/Components/Content/NotePane.svelte";

  const isMac = window.api.platform() === "darwin";

  let resize: { pointerId: number; startX: number; startWidth: number } | null =
    null;

  $: width = $sidebarCollapsedView ? 0 : $sidebarWidthView;

  onMount(() => {
    window.nav.onSaveBeforeClose(saveBeforeClose);
    void loadLayout();
  });

  function startResize(event: PointerEvent): void {
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    sidebarDrag.set({ collapsed: false, width: $sidebarWidth });
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
    sidebarDrag.set(
      sidebarDragResult(resize.startWidth + event.clientX - resize.startX),
    );
  }

  function endResize(event: PointerEvent): void {
    if (!resize || event.pointerId !== resize.pointerId) {
      return;
    }
    const result = $sidebarDrag;
    if (result?.collapsed) {
      setSidebarCollapsed(true);
    } else if (result) {
      setSidebarWidth(result.width);
    }
    sidebarDrag.set(null);
    resize = null;
  }
</script>

<main class="bg-surface-base flex h-screen gap-1.5 overflow-hidden p-1.5">
  <AppRail />

  <div
    class="sidebar-column flex flex-col overflow-hidden"
    class:animated={resize == null}
    class:-mr-1.5={$sidebarCollapsedView}
    style="width:{width}px;"
  >
    <div
      class="flex min-h-0 flex-1 flex-col"
      style="width:{$sidebarWidthView}px;"
    >
      <div class="drag-region h-[32px] flex-none" class:pl-[52px]={isMac}></div>
      <MainSideBar />
    </div>
  </div>

  <div
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize sidebar"
    class="separator"
    class:dragging={resize != null}
    class:invisible={$sidebarCollapsedView && resize == null}
    onpointerdown={startResize}
    onpointermove={moveResize}
    onpointerup={endResize}
    onpointercancel={endResize}
  ></div>

  <div class="editor-column flex min-w-80 flex-1 flex-col">
    <TabBar />
    <div
      class="bg-surface-editor border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-tr-md rounded-b-md border"
      class:rounded-tl-md={$sidebarCollapsedView}
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
  .sidebar-column.animated {
    transition:
      width 150ms ease-out,
      margin-right 150ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-column.animated {
      transition: none;
    }
  }

  .separator {
    position: relative;
    align-self: stretch;
    width: 3px;
    margin: 0px -3px;
    border: 0;
    background-color: var(--color-border);
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
