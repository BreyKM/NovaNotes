<script lang="ts">
  import { onDestroy } from "svelte";
  import { quadInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import FolderPlus from "@lucide/svelte/icons/folder-plus";
  import NovaNotesIcon from "../../../assets/NovaNotesIcon.svelte";
  import WindowControls from "../Tabs/WindowControls.svelte";

  import {
    rootDirSelection,
    rootNotebookDirPathStore,
    userInputNotebookNameStore,
    createNotebookDir,
    openExistingNotebook,
  } from "../../../store/Store";

  import isValidFilename from "valid-filename";

  const primaryButton =
    "facet bg-accent-fill hover:bg-accent-hover cursor-pointer px-4 py-2 text-white";

  const secondaryButton =
    "border-border-strong hover:bg-surface-raised cursor-pointer rounded-sm border px-4 py-2";

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
    } else {
      isNotebookNameValid = false;
      userInputNotebookNameStore.set("");
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

<div
  class="drag-region absolute top-0 right-0 left-0 z-10 flex h-[32px] justify-end"
>
  <WindowControls canMaximize={false} bleed={false} />
</div>

<main
  class="starter-container text-text-secondary text-body flex h-screen overflow-hidden"
>
  <div
    class="bg-surface-panel flex w-1/3 flex-col items-center justify-center gap-4"
  >
    <div aria-hidden="true" class="opacity-15">
      <NovaNotesIcon width="120" height="120" />
    </div>
    <div class="text-text-primary text-title font-medium">NovaNotes</div>
    <div class="text-text-muted text-ui text-center">
      Markdown notes for technical work
    </div>
  </div>

  <div class="bg-border w-px"></div>

  <div
    class="main-container relative mx-10 flex min-w-0 flex-1 flex-row overflow-hidden"
  >
    {#if showContentA}
      <div
        class="content-block content-a absolute flex h-full w-full flex-col justify-center"
        in:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
        out:fly={{ x: "-100%", duration: 300, easing: quadInOut }}
      >
        <div class="my-2 flex flex-col items-center gap-4">
          <button
            onclick={showNextContent}
            class="facet bg-accent-fill hover:bg-accent-hover flex h-24 w-24 cursor-pointer items-center justify-center rounded-md text-white"
            aria-label="Create a new notebook"
          >
            <FolderPlus size={44} strokeWidth={1.25} />
          </button>
          <div class="flex w-64 flex-col items-center gap-1">
            <div class="text-text-primary text-center text-2xl">
              Create a new NoteBook
            </div>
            <div class="text-text-muted text-ui text-center">
              A folder to keep your notes in.
            </div>
          </div>
        </div>

        <div class="bg-border-subtle my-6 h-px"></div>

        <div class="my-2 flex flex-col items-center gap-4">
          <button
            onclick={openExistingNotebook}
            class="border-border-strong hover:bg-surface-raised text-text-muted hover:text-text-primary flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border"
            aria-label="Open an existing notebook"
          >
            <FolderOpen size={44} strokeWidth={1.25} />
          </button>
          <div class="flex w-64 flex-col items-center gap-1">
            <div class="text-text-primary text-center text-2xl">
              Open a folder of markdown notes
            </div>
            <div class="text-text-muted text-ui text-center">
              Your existing notes stay where they are.
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
          class="group text-text-muted hover:text-text-primary flex h-fit w-fit cursor-pointer items-center gap-1"
        >
          <ChevronLeft size={17} strokeWidth={1.5} />
          <div>back</div>
        </button>

        <div class="text-text-primary text-title my-2 font-medium">
          Create new notebook
        </div>
        <div class="bg-border-subtle my-1 h-px"></div>

        <div class="my-5 flex items-center justify-between">
          <div class="w-64">
            <div class="text-text-primary">Name your notebook</div>
            <div class="text-text-muted">
              Pick a name for your new notebook.
            </div>
          </div>

          <input
            class="bg-surface-sunken border-border-strong focus:border-accent focus:border-accent w-56 rounded-none rounded-sm border border-0 border-b-2 px-3 py-2 outline-none"
            bind:value={userInputNotebookName}
            placeholder="Notebook name"
          />
        </div>

        <div class=" my-5 flex items-center justify-between">
          <div class="w-64">
            <div class="text-text-primary">Location</div>
            {#if $rootNotebookDirPathStore != null}
              <div class="text-accent text-ui wrap-break-word">
                {$rootNotebookDirPathStore}
              </div>
            {:else}
              <div class="text-text-muted text-ui">
                Choose a location for Notebook folder
              </div>
            {/if}
          </div>

          <button
            onclick={() => {
              rootDirSelection();
            }}
            class={secondaryButton}>Browse</button
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
          class={`${primaryButton} self-center rounded-md`}>Create</button
        >
      </div>
    {/if}

    {#if popupMessage}
      <div
        class="facet-sm bg-danger text-ui absolute top-4 right-0 p-2 text-white"
        in:fly={{ x: "100%", duration: 250, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 250, easing: quadInOut }}
      >
        {popupMessage}
      </div>
    {/if}
  </div>
</main>
