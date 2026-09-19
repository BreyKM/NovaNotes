<script lang="ts">
  import { onDestroy } from "svelte";
  import { quadInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import AddFolderIcon from "../../../assets/addFolder.svelte";
  import OpenFolderIcon from "../../../assets/openFolder.svelte";
  import BackIcon from "../../../assets/backSvg.svelte";

  import {
    rootDirSelection,
    rootNotebookDirPathStore,
    userInputNotebookNameStore,
    createNotebookDir,
    openExistingNotebook,
  } from "../../../store/Store";

  import isValidFilename from "valid-filename";

  //variables
  let userInputNotebookName = $state("");

  let isNotebookNameValid = $state<boolean | null>(null);

  let popupMessage = $state<string | null>(null);

  let popupTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (
      isValidFilename(userInputNotebookName) &&
      !userInputNotebookName.endsWith(".")
    ) {
      isNotebookNameValid = true;
      userInputNotebookNameStore.set(userInputNotebookName);
      console.log("name is valid");
    } else {
      isNotebookNameValid = false;
      userInputNotebookNameStore.set("");
      console.log("invalid directory name");
    }
  });

  function showPopup(message: string) {
    popupMessage = message;
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      popupMessage = null;
    }, 3000);
  }

  //State for Sliding content
  let showContentA = $state(true); // Initially show Content A

  function showNextContent() {
    showContentA = false;
  }

  function showPreviousContent() {
    showContentA = true;
  }

  onDestroy(() => {
    if (popupTimer) {
      clearTimeout(popupTimer);
    }
  });
</script>

<main class="starter-container flex">
  <div class="left-container bg-background-secondary flex h-screen w-1/3">
    <div class="recent-folder-container mx-2 my-5">
      <ul class="list">
        <li>Blank</li>
        <li>Blank</li>
        <li>Blank</li>
      </ul>
    </div>
  </div>
  <!-- Vertical Divider -->
  <div class="vertical-divider bg-divider h-screen w-px"></div>
  <div
    class="main-container relative mx-10 flex w-full flex-row overflow-hidden"
  >
    {#if showContentA}
      <div
        class="content-block content-a absolute flex h-full w-full flex-col justify-center"
        in:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
      >
        <div class="my-2 flex flex-col items-center">
          <button
            onclick={showNextContent}
            class="btn-primary bg-primary hover:bg-primary-hover mb-6 flex h-24 w-24 items-center justify-center"
            aria-label="Add folder icon"
          >
            <AddFolderIcon width="4rem" height="4rem" stroke="#f2f2f2" />
          </button>
          <div class="flex w-64 flex-col items-center">
            <div class="text-center text-base">Create a new NoteBook</div>
            <div class="text-xs">Create a new folder to store notes in.</div>
          </div>
        </div>
        <div class="horizontal-divider bg-divider my-6 h-px"></div>
        <div class="my-2 flex flex-col items-center">
          <button
            onclick={openExistingNotebook}
            class="btn-primary bg-background-secondary hover:bg-background-secondary-hover mb-6 flex h-24 w-24 items-center justify-center"
            aria-label="open an existing notebook"
          >
            <OpenFolderIcon width="4rem" height="4rem" fill="#f2f2f2" />
          </button>
          <div class="flex w-64 flex-col items-center">
            <div class="text-center text-base">
              Open a folder of markdown notes
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if !showContentA}
      <div
        class="content-block content-b items absolute flex h-full w-full flex-col justify-center"
        in:fly={{ x: "100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 300, easing: quadInOut }}
      >
        <button
          onclick={showPreviousContent}
          class="group flex h-fit w-fit items-center hover:cursor-pointer"
        >
          <BackIcon
            width="1.5rem"
            height="1.5rem"
            fill="#9A9A9A"
            class="icon group-hover:fill-text-primary"
          />
          <div class="text-text-primary-hover group-hover:text-text-primary">
            back
          </div>
        </button>

        <div class="my-2 text-4xl">Create new notebook</div>
        <div class="horizontal-divider bg-divider my-1 h-px"></div>
        <div class="my-5 flex items-center justify-between">
          <div class="w-64">
            <div class="text-lg">Name your notebook</div>
            <div class="text-sm">Pick a name for your new notebook.</div>
          </div>

          <input
            class="bg-background-secondary w-48 rounded-sm px-2 py-2 text-sm"
            bind:value={userInputNotebookName}
            placeholder="Notebook name"
          />
        </div>
        <div class=" my-5 flex items-center justify-between">
          <div class="w-64">
            <div class="text-lg">Location</div>
            {#if $rootNotebookDirPathStore != null}
              <div class="text-primary text-sm wrap-break-word">
                {$rootNotebookDirPathStore}
              </div>
            {:else}
              <div class="text-xs">Choose a location for Notebook folder</div>
            {/if}
          </div>

          <button
            onclick={() => {
              rootDirSelection();
            }}
            class="bg-background-secondary hover:bg-background-secondary-hover h-8 w-24 rounded-md shadow-md hover:cursor-pointer"
            >Browse</button
          >
        </div>

        <button
          onclick={async () => {
            if (isNotebookNameValid === false) {
              showPopup("Choose a valid notebook name");
            } else if ($rootNotebookDirPathStore == null) {
              showPopup("Choose a location for the notebook");
            } else {
              const outcome = await createNotebookDir();
              switch (outcome) {
                case "created":
                  window.main.openMainWindow();
                  break;
                case "exists":
                  showPopup("A notebook with that name already exists");
                  break;
                case "invalid-name":
                  showPopup("That name can't be used for a folder");
                  break;
                case "failed":
                  showPopup(
                    "Couldn't create the notebook. Try another location",
                  );
                  break;
                default: {
                  const unhandled: never = outcome;
                  throw new Error(`Unhandled outcome: ${unhandled}`);
                }
              }
            }
          }}
          class="bg-primary hover:bg-primary-hover h-8 w-24 self-center rounded-md shadow-md hover:cursor-pointer"
          >Create</button
        >
      </div>
    {/if}
    {#if popupMessage}
      <div
        class="invalid-directory bg-background-error absolute top-4 right-0 rounded-lg p-2 text-sm shadow-lg"
        in:fly={{ x: "100%", duration: 250, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 250, easing: quadInOut }}
      >
        {popupMessage}
      </div>
    {/if}
  </div>
</main>

<style>
</style>
