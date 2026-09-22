<script lang="ts">
  import { editorStatsStore, isTypingStore } from "./editor/editorStatus";
  import { lastSavedAtStore, saveStatusStore } from "../../../store/Store";

  const savedAtFormat = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  const chip =
    "bg-surface-raised border-border rounded-sm border px-1.5 py-px transition-opacity duration-150 ease-out";
  const hidden = "pointer-events-none opacity-0";

  let showCharacters = $state(false);
</script>

{#if $editorStatsStore}
  <div
    class="text-text-muted absolute right-4 bottom-2 z-10 flex gap-1 font-mono text-[11px]"
  >
    <span class={[chip, $isTypingStore && hidden]}>
      ln {$editorStatsStore.line}
    </span>
    <button
      class={[
        chip,
        "hover:text-text-primary cursor-pointer",
        $isTypingStore && hidden,
      ]}
      title={showCharacters ? "Show word count" : "Show character count"}
      onclick={() => (showCharacters = !showCharacters)}
    >
      {showCharacters
        ? `${$editorStatsStore.characters} chars`
        : `${$editorStatsStore.words} words`}
    </button>
    {#if $saveStatusStore === "failed"}
      <span class={[chip, "text-danger"]} title="The last save failed">
        not saved
      </span>
    {:else}
      <span
        class={[
          chip,
          $saveStatusStore === "saved" && "text-accent",
          $isTypingStore && hidden,
        ]}
        title={$lastSavedAtStore
          ? `Last saved ${savedAtFormat.format($lastSavedAtStore)}`
          : "No changes since opening"}
      >
        saved
      </span>
    {/if}
  </div>
{/if}
