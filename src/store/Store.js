import { get, writable } from "svelte/store";
import  welcome  from "../assets/Welcome.json" assert { type: 'json' }

//store variables
export const notesStore = writable(null);

export const rootNotebookDirPathStore = writable(null);

export const userInputNotebookNameStore = writable(null);

export const userInputCurrentNoteTitle = writable(null);

export const ActiveNoteBookNameStore = writable(null);

export async function rootDirSelection() {
  window.directory.openRootDirSelection();
  let rootNotebookDirPath = await window.directory.getRootNotebookDirPath();
  rootNotebookDirPathStore.set(rootNotebookDirPath);
  console.log("NoteBookDirFilePathStore", get(rootNotebookDirPathStore));
}

export async function createNotebookDir(e) {
  e.preventDefault();
  try {
    console.log(get(userInputNotebookNameStore));
    let NewNoteBookDir = await window.directory.createNotebookDir(
      get(userInputNotebookNameStore),
      get(rootNotebookDirPathStore),
    );
    
    console.log(NewNoteBookDir.fullPath, NewNoteBookDir.name);
    createWelcomeNote()
  } catch (error) {
    console.error("Failed to create notebook directory:", error);
  }
};

async function createWelcomeNote() {
  try {
    await window.notes.createWelcomeNote(welcome)
  } catch (e) {
    console.error("Unable to create welcome note: ", e)
  }
}

export async function getActiveFolder() {
  let ActiveNoteBook = await window.main.getActiveFolder();
  console.log(ActiveNoteBook);
  ActiveNoteBookNameStore.set(ActiveNoteBook);
}
