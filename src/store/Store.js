import { get, writable, derived } from "svelte/store";
import { throttle } from "lodash";

const welcome = `This is your new **Notebook**.

When you're ready, delete this note and make the vault your own.`;

//store variables
export const notesStore = writable([]);

export const noteContentStore = writable("");

export const selectedNoteIndexStore = writable(null);

export const rootNotebookDirPathStore = writable(null);

export const userInputNotebookNameStore = writable(null);

export const userInputCurrentNoteTitle = writable(null);

export const ActiveNoteBookNameStore = writable(null);

export const tabStore = writable([]);

export const noteContentCache = writable({});

export const isSwitchingTabs = writable(false);

export const activeTabIndexStore = writable(0);

export function getNoteContent(note) {
  const cache = get(noteContentCache);

  console.log('cache: ', cache[note.id], note.id)

  if (cache[note.id] !== undefined) {
    console.log(`Cache HIT for note: ${note.title}`);
    noteContentStore.set(cache[note.id]);
  } else {
    console.log(`Cache MISS for note: ${note.title}. Reading from disk.`);
    noteContentStore.set("");
    console.log("getNoteContent: ", note.title);

    window.notes.readNote(note.title).then((content) => {
      noteContentStore.set(content);

      noteContentCache.update((c) => ({
        ...c,
        [note.id]: content,
      }));
    });
  }
}

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

  if (selectedNote) {
    userInputCurrentNoteTitle.set(selectedNote.title);
  }

  await window.tab.loadNoteIntoActiveTab(selectedNote);

  window.notes.readNote(selectedNote.title).then((content) => {
    noteContentStore.set(content);
  });

  if (onSelectCallback) {
    onSelectCallback();
    console.log("onSelect callback executed");
  }
}

export function closeTab(indexToClose) {
  const tabs = get(tabStore);
  const activeIndex = get(activeTabIndexStore);

  if (tabs.length <= 1) {
    return;
  }
  const updatedTabs = tabs.filter((_, i) => i !== indexToClose);
  console.log(updatedTabs);

  const newActiveIndex =
    activeIndex >= indexToClose && activeIndex > 0
      ? activeIndex - 1
      : activeIndex;

  activeTabIndexStore.set(newActiveIndex);

  window.tab.updateTabs(updatedTabs);
  window.tab.activeTabIndex(newActiveIndex);
}

export function updateNoteContent(newContent) {
  noteContentStore.set(newContent);

  const selectedNote = get(selectedNoteStore);
  if (selectedNote) {
    noteContentCache.update((c) => {
      c[selectedNote.id] = newContent;
      return c;
    });
  }
  handleAutoSaving(newContent);
}

export const handleAutoSaving = throttle(
  (content) => {
    const selectedNote = get(selectedNoteStore);
    if (!selectedNote) return;

    void window.notes
      .writeNote(selectedNote.title, content)
      .catch((err) => console.error("Auto-save failed:", err));
  },
  2000,
  {
    leading: false,
    trailing: true,
  },
);

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
    console.log("createEmptyNote notes: ", notes);

    const title = findNextAvailableTitle(notes);
    console.log(`New note title will be: ${title}`);
    const newNote = {
      title: title,
      content: "",
    };

    // 1. Create the note file on disk
    await window.notes.createNote(newNote);
    await loadNotes();
    const newlyCreatedNote = get(notesStore)[0];

    if (!newlyCreatedNote) {
      console.error("Could not find the newly created note after loading.");
      return;
    }

    const allTabs = get(tabStore);
    const activeIndex = get(activeTabIndexStore);
    const activeTab = allTabs[activeIndex];

    if (activeTab && activeTab.noteId !== null) {
      console.log("Active tab has a note. Creating a new tab.");
      await window.tab.createTabForNewNote(newlyCreatedNote);
    } else {
      console.log("Active tab is empty. Loading note into the current tab.");
      await window.tab.loadNoteIntoActiveTab(newlyCreatedNote);
    }

    selectedNoteIndexStore.set(0); // Selects the new note in the NotePreviewList
    noteContentStore.set(newNote.content); // Populates the editor with the new note's content
    userInputCurrentNoteTitle.set(newlyCreatedNote.title); // Updates the title input field
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
  console.log("loadNotes notes: ", notes);
  const sortedNotes = notes.sort((a, b) => b.lastEditTime - a.lastEditTime);
  console.log("sortedNotes:", sortedNotes);
  notesStore.set(sortedNotes);
  console.log("notesStore:", get(notesStore));
}

export async function renameNote() {
  const newTitle = get(userInputCurrentNoteTitle).trim();
  const selectedNote = get(selectedNoteStore);

  if (!selectedNote || !newTitle || newTitle === selectedNote.title) {
    return;
  }

  try {
    const success = await window.notes.renameNote(selectedNote.title, newTitle);

    if (success) {
      console.log(
        `Successfully renamed "${selectedNote.title}" to "${newTitle}"`,
      );

      const updatedNote = { ...selectedNote, title: newTitle };

      notesStore.update((allNotes) => {
        const index = get(selectedNoteIndexStore);
        allNotes[index] = updatedNote;
        return allNotes;
      });

      console.log("renameNotes notesStore", get(notesStore));
    } else {
      console.error("Backend failed to rename note.");
      userInputCurrentNoteTitle.set(selectedNote.title);
    }
  } catch (error) {
    console.error("Error renaming note: ", error);
  }
}


