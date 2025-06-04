<script>
import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

let showContentA = true; // Initially show Content A

function showNextContent() {
    showContentA = false;
  }

function showPreviousContent() {
    showContentA = true;
  }


</script>

<main class="starter-container flex justify-between">
    <div class="left-container flex w-1/5">
        <div class="recent-folder-container h-screen ">
            <div class="list flex flex-col h-full items-center">
                <li>Blank</li>
                <li>Blank</li>
                <li>Blank</li>
            </div>
      </div>
    </div>
    <div class="main-area flex flex-row h-screen">
        {#if showContentA}
        <div>
            <div
        class="content-block content-a flex flex-col h-screen w-full items-center justify-center absolute"
        transition:slide={{ duration: 1000, easing: quintOut, axis: 'x' }}
      >
        <h2>Content A</h2>
        <p>This is the initial content.</p>
        <button on:click={showNextContent}>Go to Content B</button>
      </div>
        </div>
        {/if}

        {#if !showContentA}
      <div
        class="content-block content-b flex flex-col h-full w-full items-center justify-center absolute"
        transition:slide={{ duration: 1000, easing: quintOut, axis: 'x' }}
      >
        <h2>Content B</h2>
        <p>This is the new content that slid in.</p>
        <button on:click={showPreviousContent}>Go Back to Content A</button>
      </div>
    {/if}
    </div>
</main>

<style>
  .main-area {
    position: relative; /* Important for positioning the absolute content blocks */
    overflow: hidden; /* Crucial to hide the content that slides out */
    width: 100%; /* Or your desired width */
    height: 300px; /* Or your desired height - adjust as needed */
  }

  .content-block {
    position: absolute; /* Allows content blocks to overlap and slide */
    width: 100%;
    height: 100%;
    /* Add any other common styling for content blocks here */
  }
</style>