<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TransitionConfig } from "svelte/transition";

  export let title: string;
  export let active = false;

  const dispatch = createEventDispatcher<{ click: void; close: void }>();

  function handleClick(): void {
    dispatch("click");
  }

  function slideIn(node: HTMLElement): TransitionConfig {
    node.classList.add("animate-expand-in");
    return {
      duration: 400,
    };
  }

  function slideOut(node: HTMLElement): TransitionConfig {
    node.classList.add("animate-shrink-out");
    return {
      duration: 300,
    };
  }
</script>

<button
  class="tab z-12 mr-[-11px] flex min-w-0 pt-1"
  in:slideIn
  out:slideOut
  class:active
  on:click={handleClick}
  aria-label="tab"
>
  <div
    class="inner sides left h-[calc(32px*0.8)] min-w-10 basis-2 cursor-pointer"
  ></div>
  <div
    class="inner center hover:bg-surface-chrome-hover flex h-[calc(32px*0.8)] min-w-0 basis-44 cursor-pointer rounded-lg p-1.5"
  >
    <div class="tab-text w-[calc(100%-20px)] truncate">
      {title}
    </div>

    <div class="tab-close">
      <span>
        <svg
          class="tab-close-svg"
          on:click={(event) => {
            event.stopPropagation();
            dispatch("close");
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          {...$$restProps}
          ><path
            d="m12 13.4l-2.917 2.925q-.276.275-.704.275t-.704-.275q-.275-.275-.275-.7t.275-.7L10.6 12L7.675 9.108Q7.4 8.832 7.4 8.404q0-.427.275-.704q.275-.275.7-.275t.7.275L12 10.625L14.892 7.7q.276-.275.704-.275q.427 0 .704.275q.3.3.3.712t-.3.688L13.375 12l2.925 2.917q.275.276.275.704t-.275.704q-.3.3-.712.3t-.688-.3z"
          /></svg
        >
      </span>
    </div>
  </div>
  <div class="inner sides right h-[calc(32px*0.8)] cursor-pointer"></div>
</button>
