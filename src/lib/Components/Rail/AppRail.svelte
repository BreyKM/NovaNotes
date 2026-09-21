<script lang="ts">
  import PanelLeft from "@lucide/svelte/icons/panel-left";
  import { sidebarCollapsed, toggleSidebar } from "../../../store/layout";

  const isMac = window.api.platform() === "darwin";
</script>

<div
  class="app-rail flex w-[26px] flex-none flex-col items-center gap-3 pt-1.5"
  class:pt-8={isMac}
>
  <button
    onclick={toggleSidebar}
    class="hover:bg-surface-raised text-text-muted hover:text-text-primary rounded p-1"
    aria-label={$sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
    title={$sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
  >
    <PanelLeft size={15} strokeWidth={1.5} />
  </button>
</div>
