<script>
  import TabBar from "../Tabs/TabBar.svelte";
</script>

<div class="nav-container fixed top-0 right-0 left-0 flex h-10">
  <nav class="w-full">
    <div
      class="titlebar bg-background-nav z-1 flex h-full w-full justify-between"
    >
      <div
        class="titlebar-buttons colors-white pointer-events-auto absolute top-0 right-0 flex h-full items-center"
      >
        <button
          on:click={() => window.nav.minimize()}
          class="titlebar-button hover:bg-background-nav-hover h-full px-3 transition ease-in-out"
          aria-label="minimize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
            {...$$props}
            ><g fill="none"
              ><path
                d="M3.755 12.5h16.492a.75.75 0 1 0 0-1.5H3.755a.75.75 0 0 0 0 1.5z"
                fill="currentColor"
              /></g
            ></svg
          >
        </button>
        <button
          on:click={() => window.nav.maximize()}
          class="titlebar-button hover:bg-background-nav-hover h-full px-3 transition ease-in-out"
          aria-label="maximize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
            {...$$props}
            ><path
              fill="currentColor"
              d="M6 20q-.825 0-1.413-.588T4 18V6q0-.825.588-1.413T6 4h12q.825 0 1.413.588T20 6v12q0 .825-.588 1.413T18 20H6Zm0-2h12V6H6v12ZM6 6v12V6Z"
            /></svg
          >
        </button>
        <button
          on:click={() => window.nav.close()}
          class="titlebar-button hover:bg-background-error h-full px-3 transition ease-in-out"
          aria-label="close window"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
            {...$$props}
            ><path
              fill="currentColor"
              d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275z"
            /></svg
          >
        </button>
      </div>
    </div>
  </nav>
</div>
