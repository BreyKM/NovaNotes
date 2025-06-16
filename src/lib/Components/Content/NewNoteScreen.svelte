<script>
import { createEmptyNote } from "../../../store/Store";
</script>

<div class="relative w- h-screen flex flex-col justify-center items-center">
    <div class="mb-6">
        <div class="text-3xl">No file is open</div>
    </div>
    <div class="mb-4 text-md">
        <button class="text-primary hover:cursor-pointer"
                on:click={createEmptyNote}
        >
            Create new note (Crtl + N)
        </button>
    </div>
    <div class="mb-4">
        <a href="/">See recent files (Crtl + O)</a>
    </div>
    <div class="close">
        <a href="/">Close</a>
    </div>
</div>