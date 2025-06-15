<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher()

    function handleClick() {
        dispatch("click")
    }

    export let title;
    export let isActive = false




</script>

<div
on:click={handleClick}
role="none"
class="cursor-pointer px-2.5 py-1 rounded-md transition-colors duration-75 w-full mt-1"
class:bg-background-secondary-hover={isActive}
class:hover:bg-background-secondary-hover={!isActive}

>
    <div class="mb-1 font-bold truncate w-full">{title}</div>
</div>