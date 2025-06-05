<script>
  import { slide, fade } from "svelte/transition";
  import { quintOut, quadInOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let showContentA = false; // Initially show Content A

  function showNextContent() {
    showContentA = false;
  }

  function showPreviousContent() {
    showContentA = true;
  }
</script>

<main class="starter-container flex">
  <div class="left-container flex w-1/3  h-screen">
    <div class="recent-folder-container mx-2 my-5">
      <ul class="list">
        <li>Blank</li>
        <li>Blank</li>
        <li>Blank</li>
      </ul>
    </div>
  </div>
  <!-- Vertical Divider -->
  <div class="vertical-divider w-px bg-divider h-screen"></div>
  <div class="main-area flex flex-row">
    {#if showContentA}
      <div
        class="content-block content-a flex flex-col justify-center"
        in:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
      >
        <div class="flex my-5 justify-between mx-10 items-center">
          <div class="w-64">
            <div class="text-lg">Create a new NoteBook</div>
            <div class="text-sm">Create a new folder to store notes in.</div>
          </div>

          <button on:click={showNextContent} class="btn-primary w-24 h-7 bg-test text-sm"
            >Create</button
          >
        </div>
        <div class="horizontal-divider h-px bg-divider my-1 mx-10"></div>
        <div class="flex my-5 justify-between mx-10 items-center">
          <div class="w-64">
            <div class="text-base">Open an existing NoteBook</div>
            <div class="text-xs">This is the initial content.</div>
          </div>

          <button class="btn-primary w-24">Open</button>
        </div>
      </div>
    {/if}

    {#if !showContentA}
      <div
        class="content-block content-b flex flex-col h-full items-center justify-center"
        in:fly={{ x: "100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 300, easing: quadInOut }}
      >
        <div>Content B</div>
        <div>This is the new content that slid in.</div>
        <button class="btn-primary bg-test" on:click={showPreviousContent}>Go Back to Content A</button>
      </div>
    {/if}
  </div>
  
</main>

<style>
  .main-area {
    position: relative; /* Important for positioning the absolute content blocks */
    overflow: hidden; /* Crucial to hide the content that slides out */
    width: 100%; /* Or your desired width */ /* Or your desired height - adjust as needed */
  }

  .content-block {
    position: absolute; /* Allows content blocks to overlap and slide */
    width: 100%;
    height: 100%;
    /* Add any other common styling for content blocks here */
  }
</style>
