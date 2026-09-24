<script lang="ts">
  import FilePlus from "@lucide/svelte/icons/file-plus";
  import Moon from "@lucide/svelte/icons/moon";
  import PanelLeft from "@lucide/svelte/icons/panel-left";
  import Sun from "@lucide/svelte/icons/sun";
  import { createEmptyNote } from "../../../store/Store";
  import { sidebarCollapsed, toggleSidebar } from "../../../store/layout";
  import { theme, toggleTheme } from "../../../store/theme";

  const isMac = window.api.platform() === "darwin";

  const railButton =
    "text-text-muted hover:text-text-primary hover:bg-surface-raised flex h-6 w-6 items-center justify-center rounded";
</script>

<div
  class="app-rail flex w-8 flex-none flex-col items-center gap-2 pt-1 pb-1.5"
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

  <div class="flex-1"></div>

  <button
    onclick={toggleTheme}
    class={railButton}
    aria-label={$theme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"}
    title={$theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
  >
    {#if $theme === "dark"}
      <Sun size={17} strokeWidth={1.5} />
    {:else}
      <Moon size={17} strokeWidth={1.5} />
    {/if}
  </button>
</div>
