<script>
  import { onMount } from "svelte";
  import Content from "./lib/Components/Content/Content.svelte";
  import NewNoteScreen from "./lib/Components/Content/NewNoteScreen.svelte";
  import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
  import Nav from "./lib/Components/Nav/Nav.svelte";

  import TabBar from "./lib/Components/Tabs/TabBar.svelte";

  import { selectedNoteIndexStore } from "./store/Store";

  import { onDrag } from "./lib/placeholder/dragMe";
  import ContentCopy from "./lib/Components/Content/ContentCopy.svelte";

  let width;
  let resizeWidth = width;
  let isDragging = false;

  let mainSideBarRef;
  let minWidthInPixels = 0;

  onMount(() => {
    if (mainSideBarRef) {
      const rect = mainSideBarRef.getBoundingClientRect();
      minWidthInPixels = rect.width;

      width = rect.width;
      resizeWidth = rect.width;
    }
  });

  function handleDrag(event) {
    const { delta, initialWidth } = event.detail;
    const newWidth = initialWidth + delta;

    resizeWidth = Math.max(minWidthInPixels, newWidth);
  }

  function handleDragEnd() {
    isDragging = false;
    width = resizeWidth;
  }

  function handleDragStart() {
    isDragging = true;
  }

  let contentContainerRef = null;
</script>


<main class="relative flex h-screen overflow-hidden">
  <Nav />
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
  <div class="MainContent w-full overflow-x-hidden h-full flex flex-col">
    <!-- <div style="position:absolute; top: 10px; left: 10px; background: black; color: white; padding: 5px; z-index: 1000;">
      Live Width: {Math.round(resizeWidth)}px
    </div> -->
    <TabBar />
    {#if $selectedNoteIndexStore === null}
      <NewNoteScreen />
    {:else}
      <ContentCopy bind:this={contentContainerRef} />
    {/if}
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
