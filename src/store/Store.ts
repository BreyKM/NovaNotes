import { get, writable, derived, type Writable } from "svelte/store";
import { throttle } from "lodash";
import type { NoteMeta, NewNote, Tab } from "../../shared/types";

const welcome = `This is your new **Notebook**.

When you're ready, delete this note and make the vault your own.`;

//store variables
export const notesStore: Writable<NoteMeta[]> = writable([]);

export const noteContentStore: Writable<string> = writable("");

export const selectedNoteIdStore: Writable<string | null> = writable(null);

export const rootNotebookDirPathStore: Writable<string | null> = writable(null);

export const userInputNotebookNameStore: Writable<string | null> =
  writable(null);

export const userInputCurrentNoteTitle: Writable<string | null> =
  writable(null);

export const activeNotebookNameStore: Writable<string | null> = writable(null);

export const tabStore: Writable<Tab[]> = writable([]);

export const noteContentCache: Writable<Record<string, string>> = writable({});

export const noteFrontmatterStore: Writable<Record<string, string>> = writable(
  {},
);

export const isSwitchingTabs: Writable<boolean> = writable(false);

export const activeTabIndexStore: Writable<number> = writable(0);

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---(\r?\n|$)(\r?\n)*/;

export function splitFrontmatter(raw: string): {
  frontmatter: string;
  body: string;
} {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { frontmatter: "", body: raw };
  }
  return { frontmatter: match[0], body: raw.slice(match[0].length) };
}

let latestLoad = 0;

export function getNoteContent(note: NoteMeta): void {
  const load = ++latestLoad;
  const cache = get(noteContentCache);

  if (cache[note.id] !== undefined) {
    noteContentStore.set(cache[note.id]);
    return;
  }

  noteContentStore.set("");

  window.notes.readNote(note.title).then((raw) => {
    if (load !== latestLoad) {
      return;
    }

    const { frontmatter, body } = splitFrontmatter(raw);
    noteFrontmatterStore.update((m) => ({ ...m, [note.id]: frontmatter }));
    noteContentStore.set(body);
    noteContentCache.update((c) => ({ ...c, [note.id]: body }));
  });
}

export interface SelectedNote extends NoteMeta {
  content: string;
}

export const selectedNoteStore = derived(
  [notesStore, selectedNoteIdStore, noteContentStore],
  ([
    $notesStore,
    $selectedNoteIdStore,
    $noteContentStore,
  ]): SelectedNote | null => {
    if ($selectedNoteIdStore != null) {
      const selectedNote = $notesStore.find(
        (note) => note.id === $selectedNoteIdStore,
      );
      if (selectedNote) {
        return {
          ...selectedNote,
          content: $noteContentStore,
        };
      }
    }
    return null;
  },
);

export async function handleNoteSelect(
  id: string,
  onSelectCallback?: () => void,
): Promise<void> {
  handleAutoSaving.flush();

  selectedNoteIdStore.set(id);

  const selectedNote = get(selectedNoteStore);

  if (!selectedNote) {
    return;
  }

  userInputCurrentNoteTitle.set(selectedNote.title);

  await window.tab.loadNoteIntoActiveTab(selectedNote);

  getNoteContent(selectedNote);

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
    const frontmatter = get(noteFrontmatterStore)[selectedNote.id] ?? "";
    handleAutoSaving(selectedNote.title, frontmatter + newContent);
  }
}

let pendingWrite: Promise<void> = Promise.resolve();

function writeInOrder(title: string, content: string): Promise<void> {
  pendingWrite = pendingWrite
    .then(() => window.notes.writeNote(title, content))
    .catch((err) => console.error("Auto-save failed:", err));
  return pendingWrite;
}

export const handleAutoSaving = throttle(
  (title: string, content: string) => {
    void writeInOrder(title, content);
  },
  2000,
  {
    leading: false,
    trailing: true,
  },
);

export async function saveNow(): Promise<void> {
  handleAutoSaving.flush();
  await pendingWrite;
}

export async function saveBeforeClose(): Promise<void> {
  await saveNow();
  window.nav.readyToClose();
}

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

    selectedNoteIdStore.set(newlyCreatedNote.id);
    noteContentStore.set(newNote.content);
    userInputCurrentNoteTitle.set(newlyCreatedNote.title);
  } catch (error) {
    console.error("Failed to create a new note: ", error);
  }
}

export async function rootDirSelection(): Promise<void> {
  window.directory.openRootDirSelection();
  const rootNotebookDirPath = await window.directory.getRootNotebookDirPath();
  rootNotebookDirPathStore.set(rootNotebookDirPath ?? null);
}

export async function createNotebookDir(e: Event): Promise<void> {
  e.preventDefault();

  const notebookName = get(userInputNotebookNameStore);
  const rootPath = get(rootNotebookDirPathStore);

  if (!notebookName || !rootPath) {
    console.error(
      "createNotebookDir called without a valid notebook name or root path.",
    );
    return;
  }

  try {
    await window.directory.createNotebookDir(notebookName, rootPath);

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
  activeNotebookNameStore.set(ActiveNoteBook ?? null);
}

export async function loadNotes(): Promise<void> {
  const notes = await window.notes.getNotes();
  const sortedNotes = notes.sort((a, b) => b.lastEditTime - a.lastEditTime);
  notesStore.set(sortedNotes);
}

function rekey<T>(
  map: Record<string, T>,
  oldKey: string,
  newKey: string,
): Record<string, T> {
  if (!(oldKey in map)) {
    return map;
  }
  const { [oldKey]: value, ...rest } = map;
  return { ...rest, [newKey]: value };
}

export async function renameNote(): Promise<void> {
  const newTitle = get(userInputCurrentNoteTitle)?.trim();
  const selectedNote = get(selectedNoteStore);

  if (!selectedNote || !newTitle || newTitle === selectedNote.title) {
    return;
  }

  try {
    await saveNow();
    const success = await window.notes.renameNote(selectedNote.title, newTitle);

    if (success) {
      const oldId = selectedNote.id;
      const newId = `${newTitle}.md`;

      notesStore.update((allNotes) =>
        allNotes.map((note) =>
          note.id === oldId ? { ...note, title: newTitle, id: newId } : note,
        ),
      );

      noteContentCache.update((cache) => rekey(cache, oldId, newId));
      noteFrontmatterStore.update((map) => rekey(map, oldId, newId));

      const tabs = get(tabStore).map((tab) =>
        tab.noteId === oldId ? { ...tab, noteId: newId, title: newTitle } : tab,
      );
      void window.tab.updateTabs(tabs);

      selectedNoteIdStore.set(newId);
    } else {
      console.error("Backend failed to rename note.");
      userInputCurrentNoteTitle.set(selectedNote.title);
    }
  } catch (error) {
    console.error("Error renaming note: ", error);
  }
}
