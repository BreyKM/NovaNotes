<script lang="ts">
  import {
    closeTab,
    createEmptyNote,
    activeTabIndexStore,
  } from "../../../store/Store";
</script>

<div
  class="relative mt-10 flex h-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto"
>
  <div class="mb-6">
    <div class="text-3xl">No file is open</div>
  </div>
  <div class="text-md mb-4">
    <button
      class="text-primary hover:cursor-pointer"
      on:click={() => createEmptyNote()}
    >
      Create new note (Crtl + N)
    </button>
  </div>
  <div class="close">
    <button
      class="text-primary hover:cursor-pointer"
      on:click={() => closeTab($activeTabIndexStore)}
    >
      Close
    </button>
  </div>
</div>
