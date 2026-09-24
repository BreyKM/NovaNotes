<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TransitionConfig } from "svelte/transition";

  export let title: string;
  export let active = false;

  const dispatch = createEventDispatcher<{ click: void; close: void }>();

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
  class="tab group flex h-[32px] w-[var(--tab-width,180px)] min-w-0 [flex-shrink:var(--tab-shrink,1)] overflow-hidden rounded-t-md text-xs"
  class:active
  class:bg-border={active}
  class:text-text-primary={active}
  class:text-text-muted={!active}
  in:slideIn
  out:slideOut
>
  <div
    class="tab-fill flex min-w-0 flex-1 items-center justify-end overflow-hidden rounded-t-md pr-1"
    class:bg-surface-editor={active}
    class:hover:bg-surface-raised={!active}
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
</div>

<style>
  .tab {
    position: relative;
    transition: width var(--tab-transition, 250ms) ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .tab {
      transition: none;
    }
  }

  .tab.active,
  .tab:hover {
    clip-path: polygon(
      0 0,
      calc(100% - var(--facet)) 0,
      100% var(--facet),
      100% 100%,
      0 100%
    );
  }

  .tab.active {
    z-index: 1;
    margin-bottom: -1px;
    padding: 1px 1px 0;
  }

  .tab.active .tab-fill {
    clip-path: polygon(
      0 0,
      calc(100% - var(--facet)) 0,
      100% var(--facet),
      100% 100%,
      0 100%
    );
  }
</style>
