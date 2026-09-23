<script lang="ts">
  import FilePlus from "@lucide/svelte/icons/file-plus";
  import PanelLeft from "@lucide/svelte/icons/panel-left";
  import { createEmptyNote } from "../../../store/Store";
  import { sidebarCollapsed, toggleSidebar } from "../../../store/layout";

  const isMac = window.api.platform() === "darwin";

  const railButton =
    "text-text-muted hover:text-text-primary hover:bg-surface-raised flex h-6 w-6 items-center justify-center rounded";
</script>

<div
  class="app-rail flex w-8 flex-none flex-col items-center gap-2 pt-1"
  class:pt-8={isMac}
>
  <button
    onclick={toggleSidebar}
    class={railButton}
    aria-label={$sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
    title={$sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
  >
    <PanelLeft size={17} strokeWidth={1.5} />
  </button>

  <div class="bg-border-subtle h-px w-4 flex-none"></div>

  <button
    onclick={() => void createEmptyNote()}
    class={railButton}
    aria-label="New note"
    title="New note"
  >
    <FilePlus size={17} strokeWidth={1.5} />
  </button>
</div>
