<script lang="ts">
  import { fly } from "svelte/transition";
  import { quadInOut } from "svelte/easing";
  import isValidFilename from "valid-filename";
  import {
    isSwitchingTabs,
    renameNote,
    selectedNoteStore,
    userInputCurrentNoteTitle,
  } from "../../../store/Store";

  const invalidCharacters = ' * " \\ / < > : | ?';
  let isNoteFileNameValid = true;

  $: if ($selectedNoteStore && !$isSwitchingTabs) {
    const typed = $userInputCurrentNoteTitle ?? "";
    isNoteFileNameValid =
      typed === "" ||
      typed === $selectedNoteStore.title ||
      isValidFilename(typed);
  }

  function commitTitle(): void {
    if ($isSwitchingTabs) return;

    const current = $selectedNoteStore?.title;
    if (!current) return;

    const typed = $userInputCurrentNoteTitle?.trim() ?? "";

    if (typed === "" || !isValidFilename(typed)) {
      userInputCurrentNoteTitle.set(current);
      return;
    }

    renameNote();
  }

  function handleTitleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      if ($selectedNoteStore) {
        userInputCurrentNoteTitle.set($selectedNoteStore.title);
      }
      (event.currentTarget as HTMLElement).blur();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (!isNoteFileNameValid) return;
      (event.currentTarget as HTMLElement).blur();
      return;
    }

    if (event.key === "Tab" && !isNoteFileNameValid) {
      event.preventDefault();
    }
  }
</script>

<div
  class="note-title-container relative mx-auto mb-4 w-full max-w-(--editor-width)"
>
  <div
    class="note-title text-title font-medium outline-none"
    tabindex="-1"
    onkeydown={handleTitleKeydown}
    onblur={commitTitle}
    contenteditable="true"
    role="none"
    bind:textContent={$userInputCurrentNoteTitle}
  ></div>
  {#if !isNoteFileNameValid}
    <div
      class="invalid-directory bg-danger absolute inset-x-0 top-full z-10 mx-auto w-fit rounded-lg p-2 text-sm shadow-lg"
      in:fly={{ y: "100%", duration: 150, easing: quadInOut }}
      out:fly={{ y: "100%", duration: 150, easing: quadInOut }}
    >
      File name can not contain any of these characters: {invalidCharacters}
    </div>
  {/if}
</div>
