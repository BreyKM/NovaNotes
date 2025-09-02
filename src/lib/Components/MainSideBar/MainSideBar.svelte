<script>
  import { onMount } from "svelte";
  import {
    getActiveFolder,
    ActiveNoteBookNameStore,
    createEmptyNote,
  } from "../../../store/Store";
  import NotePreviewList from "./notePreviewList.svelte";

  export let style = ''

  export let containerElement;

  onMount(() => {
    getActiveFolder();
  });

  console.log($ActiveNoteBookNameStore);
</script>

<div
  bind:this={containerElement}
  class="flex flex-col left-container min-w-1/5 max-w-3/4 h-100% bg-background-secondary"
  style={style}
>
<div class="titlebar-title flex h-10 text-center text-[1.75rem] px-3 bg-background-nav z-100">
        <svg
          width="40"
          height="40"
          viewBox="0 0 256 256"
          version="1.1"
          id="svg1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:svg="http://www.w3.org/2000/svg"
        >
          <defs id="defs1" />
          <g id="layer1">
            <path
              style="fill:#3e90cb;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 125.99998,12.183843 1e-5,134.587167 -39.35059,-12.78577 z"
              id="path12"
            />
            <path
              style="fill:#69b6ec;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 255.97866,105.1157 -127.97867,41.65531 -0.0212,-41.37566 z"
              id="path14"
            />
            <path
              style="fill:#2a6f9f;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 207.16414,255.61377 127.99999,146.77102 167.34402,133.96507 Z"
              id="path25"
            />
            <path
              style="fill:#0f3b5b;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 48.83584,255.61377 79.16414,-108.84274 24.30285,33.48606 z"
              id="path27"
            />
            <path
              style="fill:#2c93f9;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m -1e-5,105.18124 127.99998,41.58978 -24.32001,33.47361 z"
              id="path29"
            />
            <g
              id="g34"
              style="opacity:0.3"
              transform="translate(-256.00001,12.183788)"
            >
              <path
                style="fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="M 381.99999,5.5334558e-5 382,134.58722 342.64941,121.80145 Z"
                id="path30"
              />
              <path
                style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:1;stroke-opacity:1"
                d="M 511.97867,92.931914 384,134.58723 383.97879,93.211564 Z"
                id="path31"
              />
              <path
                style="fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="M 463.16415,243.42998 384,134.58723 423.34403,121.78128 Z"
                id="path32"
              />
              <path
                style="fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="m 304.83585,243.42998 79.16414,-108.84274 24.30285,33.48606 z"
                id="path33"
              />
              <path
                style="fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="m 256,92.997451 127.99998,41.589779 -24.32001,33.47361 z"
                id="path34"
              />
            </g>
            <path
              style="fill:#2c93f9;fill-opacity:1;stroke:none;stroke-width:1;stroke-opacity:1"
              d="m 0,105.18123 127.99995,41.5898 3e-5,-41.37565 z"
              id="path28"
            />
            <path
              style="fill:#3e90cb;fill-opacity:1;stroke:none;stroke-width:1.01019;stroke-opacity:1"
              d="m 125.99999,12.183847 -1e-5,137.342933 39.35059,-13.04757 z"
              id="path11"
            />
            <path
              style="fill:#69b6ec;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 255.97866,105.11571 127.99998,146.771 152.33712,180.23215 Z"
              id="path13"
            />
            <path
              style="fill:#2a6f9f;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 207.16413,255.61377 128,146.77102 103.69715,180.25708 Z"
              id="path24"
            />
            <path
              style="fill:#0f3b5b;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 48.83583,255.61376 127.99999,146.77103 88.65597,133.96507 Z"
              id="path26"
            />
            <g id="g37" transform="translate(-256.00001,12.183788)">
              <path
                style="opacity:0.35;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="M 381.99999,5.5334558e-5 382,93.210937 370.43522,93.188894 Z"
                id="path35"
              />
              <path
                style="opacity:0.3;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="M 382,5.8834558e-5 381.99999,133.94141 384,134.58724 l 2.86609,-0.93288 z"
                id="path36"
              />
              <path
                style="opacity:0.35;fill:#ffffff;fill-opacity:1;stroke:none;stroke-opacity:1"
                d="M 382,5.8834558e-5 420.81129,122.60566 l -11.22328,3.653 z"
                id="path37"
              />
            </g>
            <path
              style="opacity:0.35;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 255.97866,105.1157 -91.16738,29.67375 -3.60859,-11.41202 z"
              id="path38"
            />
            <path
              style="opacity:0.3;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.985565;stroke-opacity:1"
              d="M 255.97866,105.11571 129.43303,146.30459 128,146.77103 l 2.96647,4.11326 z"
              id="path39"
            />
            <path
              style="opacity:0.35;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:1.00035;stroke-opacity:1"
              d="m 255.97866,105.11571 -103.57653,75.14138 -6.74998,-9.76766 z"
              id="path40"
            />
            <path
              style="opacity:0.35;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.994684;stroke-opacity:1"
              d="m 207.16413,255.61377 -54.762,-75.35668 9.24679,-6.70824 z"
              id="path41"
            />
            <path
              style="opacity:0.3;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 207.16413,255.61377 128,146.77103 l -1.13529,1.56088 -2.7808,3.82333 z"
              id="path42"
            />
            <path
              style="opacity:0.35;fill:#ffffff;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 207.16413,255.61377 -103.46698,-75.35669 7.14702,-9.89853 z"
              id="path43"
            />
            <path
              style="opacity:0.35;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 48.83584,255.61377 54.84412,-75.36914 8.82643,6.42836 z"
              id="path44"
            />
            <path
              style="opacity:0.3;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 48.83583,255.61376 128,146.77103 l -3.63881,-1.14647 -2.88321,-0.87854 z"
              id="path45"
            />
            <path
              style="opacity:0.35;fill:#ffffff;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 48.83583,255.61376 39.82014,-121.64869 10.58353,3.4611 z"
              id="path46"
            />
            <path
              style="opacity:0.35;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 0,105.18123 88.65597,28.78384 -3.94442,12.05002 z"
              id="path47"
            />
            <path
              style="opacity:0.3;fill:#000000;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="M 0,105.18123 125.99998,146.1252 V 144.51534 140.308 Z"
              id="path48"
            />
            <path
              style="opacity:0.35;fill:#ffffff;fill-opacity:1;stroke:none;stroke-opacity:1"
              d="m 0,105.18123 125.99999,0.21349 -1e-5,12.60904 z"
              id="path49"
            />
          </g>
        </svg>
        <div class="text-center ml-2 mt-1 h-full self-center">Nova</div>
      </div>
<div class="sidebar-main flex flex-col relative overflow-hidden isolate">
  <div class="Notebook-name-container mx-2 my-2">
    {#if $ActiveNoteBookNameStore}
      <div
        class=" text-sm hover:bg-background-secondary-hover py-px px-2 rounded-sm hover:cursor-pointer"
      >
        {$ActiveNoteBookNameStore}
      </div>
    {:else}
      <p>Loading...</p>
    {/if}
  </div>
  <div class="new-icons flex self-center justify-center">
    <button
      on:click={createEmptyNote}
      class=" create-note flex items-center justify-center p-1 hover:bg-background-secondary-hover hover:cursor-pointer rounded-md"
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
  </div>
  <NotePreviewList />
  </div>
</div>
