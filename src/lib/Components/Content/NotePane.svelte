<script lang="ts">
  import CodeMirrorEditor from "./CodeMirrorEditor.svelte";
  import NoteTitle from "./NoteTitle.svelte";
</script>

<div class="mx-auto flex min-h-0 w-[80%] flex-1 flex-col px-8 pt-10">
  <NoteTitle />
  <CodeMirrorEditor />
</div>
