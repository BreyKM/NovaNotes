import { get, writable } from "svelte/store";

export const NoteBookDirFilePathStore = writable(null);


export function openDirectory() {
    window.directory.openDirSelection();
}

export async function NewNotebookDir() {
    let NoteBookDirFilePath = await window.directory.getNoteBookDirFilePath();
    NoteBookDirFilePathStore.set(NoteBookDirFilePath);
    console.log("NoteBookDirFilePathStore", get(NoteBookDirFilePathStore));
}