<script>
import { closeTab, createEmptyNote, activeTabIndexStore } from "../../../store/Store";
</script>

<div class="relative h-screen flex flex-col justify-center items-center">
    <div class="mb-6">
        <div class="text-3xl">No file is open</div>
    </div>
    <div class="mb-4 text-md">
        <button class="text-primary hover:cursor-pointer"
                on:click={() => createEmptyNote()}
        >
            Create new note (Crtl + N)
        </button>
    </div>
    <div class="close">
        <button class="text-primary hover:cursor-pointer"
                on:click={() => closeTab($activeTabIndexStore)}
        >
            Close
        </button>
    </div>
</div>