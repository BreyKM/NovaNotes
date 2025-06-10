import { get, writable } from "svelte/store";

export const NoteBookDirFilePathStore = writable(null);

export const NotebookNameStore = writable(null);

export function openDirectory() {
  window.directory.openDirSelection();
}

export async function NewNotebookDir() {
  let NoteBookDirFilePath = await window.directory.getNoteBookDirFilePath();

  NoteBookDirFilePathStore.set(NoteBookDirFilePath);

  console.log("NoteBookDirFilePathStore", get(NoteBookDirFilePathStore));
}

export const createNewNotebookDir = async (e) => {
  e.preventDefault();
  try {
    await window.directory.createNewNotebookDir(get(NotebookNameStore));
  } catch (error) {
    console.error("Failed to create notebook directory:", error);
    // Consider setting an error state or showing user feedback
  }
};
