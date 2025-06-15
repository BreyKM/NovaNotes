<script>
  import { onMount } from "svelte";
  import { getActiveFolder, ActiveNoteBookNameStore, createEmptyNote } from "../../../store/Store";
    import NotePreviewList from "./notePreviewList.svelte";


  onMount(() => {
    getActiveFolder();
  });

  console.log($ActiveNoteBookNameStore);
</script>

<div class="flex flex-col left-container ite min-w-1/5 bg-background-secondary">
  <div class="Notebook-name-container mx-2 my-2">
    {#if $ActiveNoteBookNameStore}
      <div class=" text-sm hover:bg-background-secondary-hover py-px px-2 rounded-sm hover:cursor-pointer ">{$ActiveNoteBookNameStore}</div>
    {:else}
      <p>Loading...</p>
    {/if}
  </div>
  <div class="new-icons flex self-center justify-between">
    <button
    on:click={createEmptyNote}
      class=" flex items-center justify-center p-1 hover:bg-background-secondary-hover hover:cursor-pointer rounded-md"
      aria-label="Add folder icon"
      >
      <svg
        width="1.5rem"
        height="1.5rem"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="File / Note_Edit">
          <path
            id="Vector"
            d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8"
            stroke="#f2f2f2"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg></button
    >
    <button
      class=" flex items-center justify-center p-1 hover:bg-background-secondary-hover hover:cursor-pointer rounded-md"
      aria-label="Add folder icon"
      ><svg
        width="1.5rem"
        height="1.5rem"
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
  </div>
<NotePreviewList />
</div>
