<script lang="ts">
  import CodeMirrorEditor from "./editor/CodeMirrorEditor.svelte";
  import NoteTitle from "./NoteTitle.svelte";
  import StatusChips from "./StatusChips.svelte";
</script>

<div class="flex min-h-0 flex-1 flex-col pt-10">
  <div class="pr-[calc(2rem+var(--scrollbar-size))] pl-8">
    <NoteTitle />
  </div>
  <CodeMirrorEditor />
  <StatusChips />
</div>
