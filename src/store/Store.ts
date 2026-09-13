import { get, writable, derived, type Writable } from "svelte/store";
import { throttle } from "lodash";
import type { NoteMeta, NewNote, Tab } from "../../shared/types";

const welcome = `This is your new **Notebook**.

When you're ready, delete this note and make the vault your own.`;

//store variables
export const notesStore: Writable<NoteMeta[]> = writable([]);

export const noteContentStore: Writable<string> = writable("");

export const selectedNoteIndexStore: Writable<number | null> = writable(null);

export const rootNotebookDirPathStore: Writable<string | null> = writable(null);

export const userInputNotebookNameStore: Writable<string | null> =
  writable(null);

export const userInputCurrentNoteTitle: Writable<string | null> =
  writable(null);

export const ActiveNoteBookNameStore: Writable<string | null> = writable(null);

export const tabStore: Writable<Tab[]> = writable([]);

export const noteContentCache: Writable<Record<string, string>> = writable({});

export const isSwitchingTabs: Writable<boolean> = writable(false);

export const activeTabIndexStore: Writable<number> = writable(0);

export function getNoteContent(note: NoteMeta): void {
  const cache = get(noteContentCache);

  if (cache[note.id] !== undefined) {
    noteContentStore.set(cache[note.id]);
  } else {
    noteContentStore.set("");

    window.notes.readNote(note.title).then((content) => {
      noteContentStore.set(content);

      noteContentCache.update((c) => ({
        ...c,
        [note.id]: content,
      }));
    });
  }
}

export interface selectedNote extends NoteMeta {
  content: string;
}

export const selectedNoteStore = derived(
  [notesStore, selectedNoteIndexStore, noteContentStore],
  ([
    $notesStore,
    $selectedNoteIndexStore,
    $noteContentStore,
  ]): SelectedNote | null => {
    if (
      $selectedNoteIndexStore != null &&
      $notesStore[$selectedNoteIndexStore]
    ) {
      const selectedNote = $notesStore[$selectedNoteIndexStore];

      return {
        ...selectedNote,
        content: $noteContentStore,
      };
    }
    return null;
  },
);

export async function handleNoteSelect(
  index: number,
  onSelectCallback?: () => void,
): Promise<void> {
  selectedNoteIndexStore.set(index);

  const selectedNote = get(selectedNoteStore);

  if (selectedNote) {
    userInputCurrentNoteTitle.set(selectedNote.title);
  }

  await window.tab.loadNoteIntoActiveTab(selectedNote);

  window.notes.readNote(selectedNote.title).then((content) => {
    noteContentStore.set(content);
  });

  if (onSelectCallback) {
    onSelectCallback();
  }
}

export function closeTab(indexToClose: number): void {
  const tabs = get(tabStore);
  const activeIndex = get(activeTabIndexStore);

  if (tabs.length <= 1) {
    return;
  }
  const updatedTabs = tabs.filter((_, i) => i !== indexToClose);

  const newActiveIndex =
    activeIndex >= indexToClose && activeIndex > 0
      ? activeIndex - 1
      : activeIndex;

  activeTabIndexStore.set(newActiveIndex);

  window.tab.updateTabs(updatedTabs);
  window.tab.activeTabIndex(newActiveIndex);
}

export function updateNoteContent(newContent: string): void {
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

export function findNextAvailableTitle(allNotes: NoteMeta[]): string {
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

export async function createEmptyNote(): Promise<void> {
  try {
    const notes = get(notesStore);

    const title = findNextAvailableTitle(notes);
    const newNote: NewNote = {
      title: title,
      content: "",
    };

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
      await window.tab.createTabForNewNote(newlyCreatedNote);
    } else {
      await window.tab.loadNoteIntoActiveTab(newlyCreatedNote);
    }

    selectedNoteIndexStore.set(0);
    noteContentStore.set(newNote.content);
    userInputCurrentNoteTitle.set(newlyCreatedNote.title);
  } catch (error) {
    console.error("Failed to create a new note: ", error);
  }
}

export async function rootDirSelection(): Promise<void> {
  window.directory.openRootDirSelection();
  const rootNotebookDirPath = await window.directory.getRootNotebookDirPath();
  rootNotebookDirPathStore.set(rootNotebookDirPath);
}

export async function createNotebookDir(e: Event): Promise<void> {
  e.preventDefault();
  try {
    const newNoteBookDir = await window.directory.createNotebookDir(
      get(userInputNotebookNameStore),
      get(rootNotebookDirPathStore),
    );

    createWelcomeNote();
  } catch (error) {
    console.error("Failed to create notebook directory:", error);
  }
}

async function createWelcomeNote(): Promise<void> {
  try {
    await window.notes.createWelcomeNote(welcome);
  } catch (e) {
    console.error("Unable to create welcome note: ", e);
  }
}

export async function getActiveFolder(): Promise<void> {
  const ActiveNoteBook = await window.main.getActiveFolder();
  ActiveNoteBookNameStore.set(ActiveNoteBook);
}

export async function loadNotes(): Promise<void> {
  const notes = await window.notes.getNotes();
  const sortedNotes = notes.sort((a, b) => b.lastEditTime - a.lastEditTime);
  notesStore.set(sortedNotes);
}

export async function renameNote(): Promise<void> {
  const newTitle = get(userInputCurrentNoteTitle).trim();
  const selectedNote = get(selectedNoteStore);

  if (!selectedNote || !newTitle || newTitle === selectedNote.title) {
    return;
  }

  try {
    const success = await window.notes.renameNote(selectedNote.title, newTitle);

    if (success) {
      const updatedNote = { ...selectedNote, title: newTitle };

      notesStore.update((allNotes) => {
        const index = get(selectedNoteIndexStore);
        allNotes[index] = updatedNote;
        return allNotes;
      });
    } else {
      console.error("Backend failed to rename note.");
      userInputCurrentNoteTitle.set(selectedNote.title);
    }
  } catch (error) {
    console.error("Error renaming note: ", error);
  }
}
