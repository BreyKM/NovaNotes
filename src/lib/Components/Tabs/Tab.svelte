<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TransitionConfig } from "svelte/transition";

  export let title: string;
  export let active = false;

  const dispatch = createEventDispatcher<{ click: void; close: void }>();

  let element: HTMLElement | undefined;

  $: if (active && element) {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function slideIn(node: HTMLElement): TransitionConfig {
    node.classList.add("animate-expand-in");
    return { duration: 150 };
  }

  function slideOut(node: HTMLElement): TransitionConfig {
    node.classList.add("animate-shrink-out");
    return { duration: 150 };
  }
</script>

<div
  bind:this={element}
  class="group flex h-[26px] w-[180px] min-w-[48px] shrink items-center overflow-hidden rounded-t-md pr-1 text-xs"
  class:bg-surface-panel={active}
  class:text-text-primary={active}
  class:text-text-muted={!active}
  class:hover:bg-surface-raised={!active}
  in:slideIn
  out:slideOut
>
  <button
    class="min-w-0 flex-1 cursor-pointer self-stretch truncate pr-1 pl-2 text-left"
    on:click={() => dispatch("click")}
  >
    {title}
  </button>
  <button
    class="hover:bg-text-primary/10 hover:text-text-primary active:bg-text-primary/20 flex-none rounded-sm p-0.5 opacity-0 transition group-hover:opacity-100"
    class:opacity-100={active}
    aria-label="close tab"
    on:click|stopPropagation={() => dispatch("close")}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="m12 13.4l-2.917 2.925q-.276.275-.704.275t-.704-.275q-.275-.275-.275-.7t.275-.7L10.6 12L7.675 9.108Q7.4 8.832 7.4 8.404q0-.427.275-.704q.275-.275.7-.275t.7.275L12 10.625L14.892 7.7q.276-.275.704-.275q.427 0 .704.275q.3.3.3.712t-.3.688L13.375 12l2.925 2.917q.275.276.275.704t-.275.704q-.3.3-.712.3t-.688-.3z"
      /></svg
    >
  </button>
</div>
