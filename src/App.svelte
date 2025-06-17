<script>
	import Content from "./lib/Components/Content.svelte";
	import NewNoteScreen from "./lib/Components/NewNoteScreen.svelte";
	import MainSideBar from "./lib/Components/MainSideBar/MainSideBar.svelte";
    import Nav from "./lib/Components/Nav/Nav.svelte";

    import TabBar from "./lib/Components/Tabs/TabBar.svelte";

	import { selectedNoteIndexStore } from "./store/Store";

	let contentContainerRef = $state();

</script>

<Nav />
<main class="relative flex h-full">
	
	<MainSideBar />
	<div class="MainContent w-full h-full overflow-hidden">
		<TabBar />
=======

	
  	{#if $selectedNoteIndexStore === null}
 	 <NewNoteScreen />

	{:else}
	 <Content bind:this={contentContainerRef} />
	 {/if}
	</div>
	
</main>
