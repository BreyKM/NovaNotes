<script>
	import Content from "./lib/Components/Content.svelte";
	import NewNoteScreen from "./lib/Components/NewNoteScreen.svelte";
	import MainSideBar from "./lib/Components/MainSideBar.svelte";

	let contentContainerRef;

	let showNoNoteScreen = $state(false)

</script>

<main class="relative flex h-full">
	
	<MainSideBar />

  	{#if (showNoNoteScreen)}
 	 <NewNoteScreen />
  
	 <!--<Content bind:this={contentContainerRef} />-->
	{:else}
	 <Content bind:this={contentContainerRef} />
	 {/if}
</main>
