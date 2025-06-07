<script>
  import { slide, fade } from "svelte/transition";
  import { quintOut, quadInOut } from "svelte/easing";
  import { fly } from "svelte/transition";


  import { openDirectory, NewNotebookDir, NoteBookDirFilePathStore } from "../../../store/Store";


  let noteBookName = $state("");

  //State for Sliding content
  let showContentA = $state(false); // Initially show Content A

  function showNextContent() {
    showContentA = false;
  }

  function showPreviousContent() {
    showContentA = true;
  }
</script>

<main class="starter-container flex">
  <div class="left-container flex w-1/3 h-screen bg-background-secondary">
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
  <div
    class="main-container w-full overflow-hidden relative flex flex-row mx-10"
  >
    {#if showContentA}
      <div
        class="content-block absolute w-full h-full content-a flex flex-col justify-center"
        in:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
      >
        <div class="flex flex-col my-2 items-center">
          <button
            onclick={showNextContent}
            class="btn-primary w-24 h-24 mb-6 bg-primary hover:bg-primary-hover flex items-center justify-center"
            aria-label="Add folder icon"
            ><svg
              width="4rem"
              height="4rem"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7L11.8845 4.76892C11.5634 4.1268 11.4029 3.80573 11.1634 3.57116C10.9516 3.36373 10.6963 3.20597 10.4161 3.10931C10.0992 3 9.74021 3 9.02229 3H5.2C4.0799 3 3.51984 3 3.09202 3.21799C2.71569 3.40973 2.40973 3.71569 2.21799 4.09202C2 4.51984 2 5.0799 2 6.2V7M2 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7ZM12 17V11M9 14H15"
                stroke="#f2f2f2"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg></button
          >
          <div class="flex flex-col items-center w-64">
            <div class="text-base">Create a new NoteBook</div>
            <div class="text-xs">Create a new folder to store notes in.</div>
          </div>
        </div>
        <div class="horizontal-divider h-px bg-divider my-6"></div>
        <div class="flex flex-col my-2 justify-between items-center">
          <button
            class="btn-primary w-24 h-24 mb-6 bg-background-secondary hover:bg-background-secondary-hover flex items-center justify-center"
            aria-label="open folder icon"
          >
            <svg
              width="4rem"
              height="4rem"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M2 6C2 4.34315 3.34315 3 5 3H7.75093C8.82997 3 9.86325 3.43595 10.6162 4.20888L9.94852 4.85927L10.6162 4.20888L11.7227 5.34484C11.911 5.53807 12.1693 5.64706 12.4391 5.64706H16.4386C18.5513 5.64706 20.281 7.28495 20.4284 9.35939C21.7878 9.88545 22.5642 11.4588 21.977 12.927L20.1542 17.4853C19.5468 19.0041 18.0759 20 16.4402 20H6C4.88522 20 3.87543 19.5427 3.15116 18.8079C2.44035 18.0867 2 17.0938 2 16V6ZM18.3829 9.17647C18.1713 8.29912 17.3812 7.64706 16.4386 7.64706H12.4391C11.6298 7.64706 10.8548 7.3201 10.2901 6.7404L9.18356 5.60444L9.89987 4.90666L9.18356 5.60444C8.80709 5.21798 8.29045 5 7.75093 5H5C4.44772 5 4 5.44772 4 6V14.4471L5.03813 11.25C5.43958 10.0136 6.59158 9.17647 7.89147 9.17647H18.3829ZM5.03034 17.7499L6.94036 11.8676C7.07417 11.4555 7.45817 11.1765 7.89147 11.1765H19.4376C19.9575 11.1765 20.3131 11.7016 20.12 12.1844L18.2972 16.7426C17.9935 17.502 17.258 18 16.4402 18H6C5.64785 18 5.31756 17.9095 5.03034 17.7499Z"
                fill="#f2f2f2"
              />
            </svg></button
          >
          <div class="flex flex-col items-center w-64">
            <div class="text-base">Open an existing NoteBook</div>
            <div class="text-xs">This is the initial content.</div>
          </div>
        </div>
      </div>
    {/if}

    {#if !showContentA}
      <div
        class="content-block absolute w-full h-full content-b flex flex-col justify-center items"
        in:fly={{ x: "100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 300, easing: quadInOut }}
      >
        <button
          onclick={showPreviousContent}
          class="flex items-center hover:cursor-pointer w-fit h-fit group"
        >
          <svg
            width="1.5rem"
            height="1.5rem"
            viewBox="0 0 1024 1024"
            fill="#9A9A9A"
            class="icon group-hover:fill-text-primary"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z"
              fill=""
            />
          </svg>
          <div class="text-text-primary-hover group-hover:text-text-primary">
            back
          </div>
        </button>

        <div class="my-2 text-4xl">Create new notebook</div>
        <div class="horizontal-divider h-px bg-divider my-1"></div>
        <div class="flex my-5 justify-between items-center">
          <div class="w-64">
            <div class="text-lg">Name your notebook</div>
            <div class="text-sm">Pick a name for your new notebook.</div>
          </div>

          <input
            class="w-48 bg-background-secondary rounded-sm px-2 py-2 text-sm"
            bind:value={noteBookName}
            placeholder="Notebook name"
          />
        </div>
        <div class=" flex my-5 justify-between items-center">
          <div class="w-64">
            <div class="text-lg">Location</div>
            {#if $NoteBookDirFilePathStore != null}
            <div class="text-sm wrap-break-word text-primary">{$NoteBookDirFilePathStore}</div>
            {:else}
            <div class="text-xs">Choose a location for Notebook folder</div>
            {/if}
          </div>

          <button
            onclick={() => {
              openDirectory()
              NewNotebookDir()
            }}
            
            class="rounded-md hover:cursor-pointer shadow-md h-8 w-24 bg-background-secondary hover:bg-background-secondary-hover"
            >Browse</button
          >
        </div>

        <button
          class="rounded-md shadow-md h-8 w-24 hover:cursor-pointer bg-primary hover:bg-primary-hover self-center"
          >Create</button
        >
      </div>
    {/if}
  </div>
</main>

<style>
</style>
