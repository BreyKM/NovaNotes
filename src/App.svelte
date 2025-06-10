<script>
	import Content from "./lib/Components/Content.svelte";
	import NewNoteScreen from "./lib/Components/NewNoteScreen.svelte";

	let contentContainerRef;

	let showNoNoteScreen = $state(false)

</script>

<main class="relative flex h-full">
	
	
	<div class="left-container min-w-1/5 bg-background-secondary">
    <div class="recent-folder-container">
    </div>
	
	 
  </div>
  	{#if (showNoNoteScreen)}
 	 <NewNoteScreen />
  
	 <!--<Content bind:this={contentContainerRef} />-->
	{:else}
	 <Content bind:this={contentContainerRef} />
	 {/if}
</main>
