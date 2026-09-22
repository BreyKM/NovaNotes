<script lang="ts">
  const isMac = window.api.platform() === "darwin";
</script>

{#if !isMac}
  <div class="flex items-center self-stretch">
    <button
      on:click={() => window.nav.minimize()}
      class="hover:bg-surface-chrome-hover flex h-full items-center px-3 transition ease-in-out"
      aria-label="minimize"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
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
      class="hover:bg-surface-chrome-hover flex h-full items-center px-3 transition ease-in-out"
      aria-label="maximize"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="M6 20q-.825 0-1.413-.588T4 18V6q0-.825.588-1.413T6 4h12q.825 0 1.413.588T20 6v12q0 .825-.588 1.413T18 20H6Zm0-2h12V6H6v12ZM6 6v12V6Z"
        /></svg
      >
    </button>
    <button
      on:click={() => window.nav.close()}
      class="hover:bg-danger flex h-full items-center px-3 transition ease-in-out"
      aria-label="close window"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275z"
        /></svg
      >
    </button>
  </div>
{/if}
