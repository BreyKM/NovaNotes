<script>
	import Content from "./lib/Components/Content.svelte";

	let contentContainerRef;

</script>

<main class="relative flex h-full">
	<div class="left-container min-w-1/6 bg-background-secondary">
    <div class="recent-folder-container">
    </div>
  </div>
	<Content bind:this={contentContainerRef} />
</main>
