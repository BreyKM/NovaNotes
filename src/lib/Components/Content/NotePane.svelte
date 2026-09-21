<script lang="ts">
  import CodeMirrorEditor from "./editor/CodeMirrorEditor.svelte";
  import NoteTitle from "./NoteTitle.svelte";
</script>

<div class="flex min-h-0 flex-1 flex-col pt-10">
  <div class="px-8">
    <NoteTitle />
  </div>
  <CodeMirrorEditor />
</div>
