import { get, writable, derived } from "svelte/store";
import welcome from "../assets/Welcome.json" assert { type: "json" };

//store variables
export const notesStore = writable([]);

export const noteContentStore = writable("");

export const selectedNoteIndexStore = writable(null);

export const rootNotebookDirPathStore = writable(null);

export const userInputNotebookNameStore = writable(null);

export const userInputCurrentNoteTitle = writable(null);

export const ActiveNoteBookNameStore = writable(null);

export const selectedNoteStore = derived(
  [notesStore, selectedNoteIndexStore, noteContentStore],
  ([$notesStore, $selectedNoteIndexStore, $noteContentStore]) => {
    if (
      $selectedNoteIndexStore !== null &&
      $notesStore[$selectedNoteIndexStore]
    ) {
      const selectedNote = $notesStore[$selectedNoteIndexStore];
      console.log("selectedNote: ", selectedNote.title);

      return {
        ...selectedNote,
        content: $noteContentStore,
      };
    }
    return null;
  },
);

export async function handleNoteSelect(index, onSelectCallback) {
  console.log(`Note ${index} was selected`);
  selectedNoteIndexStore.set(index);

  const selectedNote = get(selectedNoteStore);
  console.log("handleNoteSelect selectedNote: ", selectedNote);

  window.notes.readNote(selectedNote.title).then((content) => {
    console.log("selectedNote read : ", get(selectedNoteIndexStore));
    console.log("content readNote: ", content);
    noteContentStore.set(content);
  });

  if (onSelectCallback) {
    onSelectCallback();
    console.log("onSelect callback executed");
  }
}

export function findNextAvailableTitle(allNotes) {
  const untitledRegex = /^Untitled(?: (\d+))?$/;
  const usedNumbers = new Set();

  allNotes.forEach((note) => {
    const match = note.title.match(untitledRegex);
    if (match) {
      usedNumbers.add(match[1] ? parseInt(match[1], 10) : 0);
    }
  });

  let i = 0;
  while (usedNumbers.has(i)) {
    i++;
  }

  return i === 0 ? "Untitled" : `Untitled ${i}`;
}

export async function createEmptyNote() {
  try {
    let notes = get(notesStore);
    if (!notes) {
      await loadNotes();
      notes = get(notesStore);
    }

    const title = findNextAvailableTitle(notes);
    console.log(`New note title will be: ${title}`);

    const newNote = {
      title: title,
      content: `{
      "type": "doc",
      "content": [
        {
          "type": "paragraph"
        }
      ]
    }`,
    };

    await window.notes.createNote(newNote);

    await loadNotes();

    handleNoteSelect(0);
  } catch (error) {
    console.error("Failed to create a new note: ", error);
  }
}

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
    createWelcomeNote();
  } catch (error) {
    console.error("Failed to create notebook directory:", error);
  }
}

async function createWelcomeNote() {
  try {
    await window.notes.createWelcomeNote(welcome);
  } catch (e) {
    console.error("Unable to create welcome note: ", e);
  }
}

export async function getActiveFolder() {
  let ActiveNoteBook = await window.main.getActiveFolder();
  console.log(ActiveNoteBook);
  ActiveNoteBookNameStore.set(ActiveNoteBook);
}

export async function loadNotes() {
  const notes = await window.notes.getNotes();
  console.log("loadnotes notes: ", notes);
  const sortedNotes = notes.sort((a, b) => b.lastEditTime - a.lastEditTime);
  console.log("sortedNotes:", sortedNotes);
  notesStore.set(sortedNotes);
  console.log("notesStore:", get(notesStore));
}
