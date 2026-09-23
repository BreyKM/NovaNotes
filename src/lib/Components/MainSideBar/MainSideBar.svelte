<script lang="ts">
  import { onMount } from "svelte";
  import { getActiveFolder } from "../../../store/Store";
  import NotePreviewList from "./notePreviewList.svelte";
  import PaneHeader from "./PaneHeader.svelte";

  onMount(() => {
    getActiveFolder();
  });
</script>

<div
  class="bg-surface-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-md"
>
  <PaneHeader />
  <NotePreviewList />
</div>
