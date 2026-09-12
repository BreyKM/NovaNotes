<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
  }

  export let title;
  export let isActive = false;
</script>

<div
  on:click={handleClick}
  role="none"
  class="mt-0.5 cursor-pointer rounded-sm px-2.5 py-1 transition-colors duration-75"
  class:bg-background-secondary-hover={isActive}
  class:hover:bg-background-secondary-hover={!isActive}
>
  <div class=" w-full truncate font-bold">{title}</div>
</div>
