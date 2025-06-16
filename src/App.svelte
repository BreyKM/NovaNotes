<script>
	import Content from "./lib/Components/Content/Content.svelte";
	import NewNoteScreen from "./lib/Components/Content/NewNoteScreen.svelte";
	import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
    import Nav from "./lib/Components/Nav/Nav.svelte";

	import { selectedNoteIndexStore } from "./store/Store";

	let contentContainerRef = $state();

</script>

<Nav />
<main class="relative flex h-full">
	
	<MainSideBar />

  	{#if $selectedNoteIndexStore === null}
 	 <NewNoteScreen />

	{:else}
	 <Content bind:this={contentContainerRef} />
	 {/if}
</main>
