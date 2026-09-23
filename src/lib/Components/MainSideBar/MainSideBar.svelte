<script lang="ts">
  import { onMount } from "svelte";
  import BookIcon from "@lucide/svelte/icons/book";
  import {
    getActiveFolder,
    activeNotebookNameStore,
  } from "../../../store/Store";
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
  <div
    class="border-border-subtle text-text-muted text-ui flex h-[30px] flex-none items-center
gap-1.5 border-t px-3"
  >
    <BookIcon size={14} strokeWidth={1.5} />
    <span class="truncate">{$activeNotebookNameStore ?? ""}</span>
  </div>
</div>
