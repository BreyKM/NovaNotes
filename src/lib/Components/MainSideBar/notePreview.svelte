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
class="cursor-pointer px-2.5 py-1 rounded-sm transition-colors duration-75 mt-0.5"
class:bg-background-secondary-hover={isActive}
class:hover:bg-background-secondary-hover={!isActive}

>
    <div class=" font-bold truncate w-full">{title}</div>
</div>