<script>
  import { createEventDispatcher } from "svelte";
  import { quintOut, quadInOut } from "svelte/easing";
  import { fly, slide } from "svelte/transition";

  export let title;
  export let active = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
  }

  function slideIn(node) {
    node.classList.add("animate-expand-in");
    return {
      duration: 400,
    };
  }

  function slideOut(node) {
    node.classList.add("animate-shrink-out");
    return {
      duration: 300,
    };
  }
</script>

<button
  class="tab flex basis-48 shrink grow-0 h-8 pt-1 mr-[-11px] z-12 min-w-0 animate-slide-in-right"
  in:slideIn
  out:slideOut
  class:active
  on:click={handleClick}
  aria-label="tab"
>
  <div
    class="inner sides left cursor-pointer h-[calc(32px*0.8)] basis-2 min-w-0"
  ></div>
  <div
    class="inner center cursor-pointer h-[calc(32px*0.8)] flex items-center basis-44 rounded-lg min-w-0 hover:bg-background-nav-hover"
  >
    <div class="tab-text w-[calc(100%-20px)] min-w-0 p-1.5 truncate">
      {title}
    </div>

    <div class="tab-close p-1.5">
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
          {...$$props}
          ><path
            d="m12 13.4l-2.917 2.925q-.276.275-.704.275t-.704-.275q-.275-.275-.275-.7t.275-.7L10.6 12L7.675 9.108Q7.4 8.832 7.4 8.404q0-.427.275-.704q.275-.275.7-.275t.7.275L12 10.625L14.892 7.7q.276-.275.704-.275q.427 0 .704.275q.3.3.3.712t-.3.688L13.375 12l2.925 2.917q.275.276.275.704t-.275.704q-.3.3-.712.3t-.688-.3z"
          /></svg
        >
      </span>
    </div>
  </div>
  <div class="inner cursor-pointer h-[calc(32px*0.8)] sides right"></div>
</button>
