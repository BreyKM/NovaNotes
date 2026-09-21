import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { get } from "svelte/store";
import {
  notesStore,
  noteContentStore,
  noteFrontmatterStore,
  noteContentCache,
  selectedNoteIdStore,
  userInputCurrentNoteTitle,
  handleNoteSelect,
  updateNoteContent,
  handleAutoSaving,
  renameNote,
  saveNow,
  saveBeforeClose,
  tabStore,
  createNotebookDir,
  userInputNotebookNameStore,
  rootNotebookDirPathStore,
  openExistingNotebook,
  createEmptyNote,
} from "./Store";
import type { NoteMeta } from "../../shared/types";

const noteFixture = (title: string): NoteMeta => ({
  title,
  creationTime: 0,
  lastEditTime: 0,
  id: `${title}.md`,
});

const readNote = vi.fn();
const writeNote = vi.fn().mockResolvedValue(undefined);
const loadNoteIntoActiveTab = vi.fn().mockResolvedValue(undefined);
const renameNoteIpc = vi.fn();
const updateTabs = vi.fn().mockResolvedValue(undefined);
const readyToClose = vi.fn();
const createNotebookDirIpc = vi.fn();
const createWelcomeNote = vi.fn().mockResolvedValue(undefined);
const openExistingNotebookIpc = vi.fn();
const openMainWindow = vi.fn();
const createNoteIpc = vi.fn().mockResolvedValue(undefined);
const getNotes = vi.fn();
const createTabForNewNote = vi.fn().mockResolvedValue(undefined);

let finishHeldWrite: () => void = () => {};

function holdNextWrite(): void {
  writeNote.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishHeldWrite = resolve;
      }),
  );
}

beforeEach(() => {
  vi.stubGlobal("window", {
    notes: {
      readNote,
      writeNote,
      renameNote: renameNoteIpc,
      createWelcomeNote,
      createNote: createNoteIpc,
      getNotes,
    },
    tab: {
      loadNoteIntoActiveTab,
      updateTabs,
      createTabForNewNote,
    },
    nav: { readyToClose },
    directory: {
      createNotebookDir: createNotebookDirIpc,
      openExistingNotebook: openExistingNotebookIpc,
    },
    main: { openMainWindow },
  });

  handleAutoSaving.cancel();
  notesStore.set([]);
  noteContentStore.set("");
  noteFrontmatterStore.set({});
  noteContentCache.set({});
  selectedNoteIdStore.set(null);
  userInputCurrentNoteTitle.set(null);
  tabStore.set([]);
  userInputNotebookNameStore.set(null);
  rootNotebookDirPathStore.set(null);

  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  finishHeldWrite();
  handleAutoSaving.cancel();
  vi.unstubAllGlobals();
});

describe("handleNoteSelect", () => {
  it("loads only the body into the editor and stashes the frontmatter", async () => {
    const target = noteFixture("Test");
    notesStore.set([target]);
    readNote.mockResolvedValue("---\ntitle: Test\n---\n\nBody text.");

    await handleNoteSelect(target.id);
    await vi.waitFor(() => expect(get(noteContentStore)).toBe("Body text."));

    expect(get(noteFrontmatterStore)[target.id]).toBe(
      "---\ntitle: Test\n---\n\n",
    );
  });

  it("does nothing when the id is not in the notes list", async () => {
    await handleNoteSelect("id-missing");

    expect(loadNoteIntoActiveTab).not.toHaveBeenCalled();
    expect(readNote).not.toHaveBeenCalled();
  });

  it("ignores a slow read for a note that is no longer selected", async () => {
    const slow = noteFixture("Slow");
    const fast = noteFixture("Fast");
    notesStore.set([slow, fast]);

    let finishSlowRead: (raw: string) => void = () => {};
    readNote.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finishSlowRead = resolve;
        }),
    );
    readNote.mockResolvedValueOnce("Fast body.");

    await handleNoteSelect(slow.id);
    await handleNoteSelect(fast.id);
    await vi.waitFor(() => expect(get(noteContentStore)).toBe("Fast body."));

    finishSlowRead("Slow body.");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(get(noteContentStore)).toBe("Fast body.");
  });
});

describe("updateNoteContent", () => {
  it("re-attaches frontmatter when saving", async () => {
    const target = noteFixture("Test");
    const frontmatter = "---\ntitle: Test\ntags: [a, b]\n---\n\n";
    notesStore.set([target]);
    readNote.mockResolvedValue(`${frontmatter}Original body.`);

    await handleNoteSelect(target.id);
    await vi.waitFor(() =>
      expect(get(noteContentStore)).toBe("Original body."),
    );

    updateNoteContent("Edited body.");
    await saveNow();

    expect(writeNote).toHaveBeenCalledWith(
      "Test",
      `${frontmatter}Edited body.`,
    );
  });

  it("writes the body unchanged when the note has no frontmatter", async () => {
    const target = noteFixture("Plain");
    notesStore.set([target]);
    readNote.mockResolvedValue("Just a body.");

    await handleNoteSelect(target.id);
    await vi.waitFor(() => expect(get(noteContentStore)).toBe("Just a body."));

    updateNoteContent("Edited.");
    await saveNow();

    expect(writeNote).toHaveBeenCalledWith("Plain", "Edited.");
  });

  it("does not leak one note's frontmatter onto another", async () => {
    const withMeta = noteFixture("WithMeta");
    const without = noteFixture("Without");
    notesStore.set([withMeta, without]);

    readNote.mockResolvedValue("---\ntitle: WithMeta\n---\n\nFirst body.");
    await handleNoteSelect(withMeta.id);
    await vi.waitFor(() => expect(get(noteContentStore)).toBe("First body."));

    readNote.mockResolvedValue("Second body.");
    await handleNoteSelect(without.id);
    await vi.waitFor(() => expect(get(noteContentStore)).toBe("Second body."));

    updateNoteContent("Edited second.");
    await saveNow();

    expect(writeNote).toHaveBeenCalledWith("Without", "Edited second.");
  });

  it("does not write when no note is selected", async () => {
    updateNoteContent("orphan content");
    await saveNow();

    expect(writeNote).not.toHaveBeenCalled();
  });
});

describe("saveNow", () => {
  it("does not start a write until the previous one finishes", async () => {
    const target = noteFixture("Test");
    notesStore.set([target]);
    selectedNoteIdStore.set(target.id);

    holdNextWrite();

    updateNoteContent("first");
    handleAutoSaving.flush();
    updateNoteContent("second");
    handleAutoSaving.flush();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(writeNote).toHaveBeenCalledTimes(1);

    finishHeldWrite();
    await saveNow();

    expect(writeNote).toHaveBeenCalledTimes(2);
    expect(writeNote).toHaveBeenCalledWith("Test", "second");
  });
});

describe("saveBeforeClose", () => {
  it("lets the window close only after pending saves finish", async () => {
    const target = noteFixture("Test");
    notesStore.set([target]);
    selectedNoteIdStore.set(target.id);
    holdNextWrite();

    updateNoteContent("last words");
    const closing = saveBeforeClose();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(writeNote).toHaveBeenCalledWith("Test", "last words");
    expect(readyToClose).not.toHaveBeenCalled();

    finishHeldWrite();
    await closing;

    expect(readyToClose).toHaveBeenCalledTimes(1);
  });
});

describe("renameNote", () => {
  const selectNote = (note: NoteMeta, typedTitle: string) => {
    notesStore.set([note]);
    selectedNoteIdStore.set(note.id);
    userInputCurrentNoteTitle.set(typedTitle);
  };

  it("does nothing when no note is selected", async () => {
    userInputCurrentNoteTitle.set("New title");

    await renameNote();

    expect(renameNoteIpc).not.toHaveBeenCalled();
  });

  it("does nothing when the title is unchanged", async () => {
    selectNote(noteFixture("Test"), "Test");

    await renameNote();

    expect(renameNoteIpc).not.toHaveBeenCalled();
  });

  it("does nothing when the title is only whitespace", async () => {
    selectNote(noteFixture("Test"), "   ");

    await renameNote();

    expect(renameNoteIpc).not.toHaveBeenCalled();
  });

  it("does nothing when the title is null", async () => {
    const target = noteFixture("Test");
    notesStore.set([target]);
    selectedNoteIdStore.set(target.id);
    userInputCurrentNoteTitle.set(null);

    await renameNote();

    expect(renameNoteIpc).not.toHaveBeenCalled();
  });

  it("updates the note in the store when the rename succeeds", async () => {
    const target = noteFixture("Old");
    selectNote(target, "New");
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();

    expect(renameNoteIpc).toHaveBeenCalledWith("Old", "New");
    expect(get(notesStore)[0].title).toBe("New");
  });

  it("only updates the renamed note", async () => {
    const target = noteFixture("Old");
    const other = noteFixture("Other");
    notesStore.set([target, other]);
    selectedNoteIdStore.set(target.id);
    userInputCurrentNoteTitle.set("New");
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();

    expect(get(notesStore).map((n) => n.title)).toEqual(["New", "Other"]);
  });

  it("restores the previous title when the rename fails", async () => {
    const target = noteFixture("Old");
    selectNote(target, "Taken");
    renameNoteIpc.mockResolvedValue(false);

    await renameNote();

    expect(get(userInputCurrentNoteTitle)).toBe("Old");
    expect(get(notesStore)[0].title).toBe("Old");
  });

  it("leaves the store unchanged when the rename throws", async () => {
    const target = noteFixture("Old");
    selectNote(target, "New");
    renameNoteIpc.mockRejectedValue(new Error("disk on fire"));

    await renameNote();

    expect(get(notesStore)[0].title).toBe("Old");
  });

  it("changes the note id along with the title", async () => {
    const target = noteFixture("Old");
    selectNote(target, "New");
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();
    expect(get(notesStore)[0].id).toBe("New.md");
  });

  it("points the selection at the new id", async () => {
    const target = noteFixture("Old");
    selectNote(target, "New");
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();

    expect(get(selectedNoteIdStore)).toBe("New.md");
  });

  it("re-keys cached content and frontmatter to the new id", async () => {
    const target = noteFixture("Old");
    selectNote(target, "New");
    noteContentCache.set({ [target.id]: "cached body" });
    noteFrontmatterStore.set({ [target.id]: "---\na: 1\n---\n\n" });
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();

    expect(get(noteContentCache)).toEqual({ "New.md": "cached body" });
    expect(get(noteFrontmatterStore)).toEqual({
      "New.md": "---\na: 1\n---\n\n",
    });
  });

  it("updates every tab holding the renamed note", async () => {
    const target = noteFixture("Old");
    const other = noteFixture("Other");
    notesStore.set([target, other]);
    selectedNoteIdStore.set(target.id);
    userInputCurrentNoteTitle.set("New");
    tabStore.set([
      { tabId: 1, noteId: target.id, title: "Old" },
      { tabId: 2, noteId: other.id, title: "Other" },
      { tabId: 3, noteId: target.id, title: "Old" },
    ]);
    renameNoteIpc.mockResolvedValue(true);

    await renameNote();

    expect(updateTabs).toHaveBeenCalledWith([
      { tabId: 1, noteId: "New.md", title: "New" },
      { tabId: 2, noteId: "Other.md", title: "Other" },
      { tabId: 3, noteId: "New.md", title: "New" },
    ]);
  });

  it("finishes pending saves before renaming the file", async () => {
    selectNote(noteFixture("Old"), "New");
    renameNoteIpc.mockResolvedValue(true);

    holdNextWrite();

    updateNoteContent("typed just before renaming");
    const renaming = renameNote();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(writeNote).toHaveBeenCalledWith("Old", "typed just before renaming");
    expect(renameNoteIpc).not.toHaveBeenCalled();

    finishHeldWrite();
    await renaming;

    expect(renameNoteIpc).toHaveBeenCalledWith("Old", "New");
  });

  it("leaves ids and caches untouched when the rename fails", async () => {
    const target = noteFixture("Old");
    selectNote(target, "Taken");
    noteContentCache.set({ [target.id]: "cached body" });
    renameNoteIpc.mockResolvedValue(false);

    await renameNote();

    expect(get(notesStore)[0].id).toBe("Old.md");
    expect(get(selectedNoteIdStore)).toBe("Old.md");
    expect(get(noteContentCache)).toEqual({ "Old.md": "cached body" });
    expect(updateTabs).not.toHaveBeenCalled();
  });
});

describe("createNotebookDir", () => {
  beforeEach(() => {
    userInputNotebookNameStore.set("Work");
    rootNotebookDirPathStore.set("C:/Notes");
  });

  it("writes the welcome note before reporting success", async () => {
    createNotebookDirIpc.mockResolvedValue({
      ok: true,
      fullPath: "C:/Notes/Work",
      name: "Work",
    });
    let finishWelcomeNote: () => void = () => {};
    createWelcomeNote.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishWelcomeNote = resolve;
        }),
    );

    let outcome: string | undefined;
    const creating = createNotebookDir().then((result) => {
      outcome = result;
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createNotebookDirIpc).toHaveBeenCalledWith("Work", "C:/Notes");
    expect(outcome).toBeUndefined();

    finishWelcomeNote();
    await creating;

    expect(outcome).toBe("created");
  });

  it("reports an existing folder without writing a welcome note", async () => {
    createNotebookDirIpc.mockResolvedValue({ ok: false, reason: "exists" });

    expect(await createNotebookDir()).toBe("exists");
    expect(createWelcomeNote).not.toHaveBeenCalled();
  });

  it("reports a failure when the main process throws", async () => {
    createNotebookDirIpc.mockRejectedValue(new Error("disk full"));

    expect(await createNotebookDir()).toBe("failed");
    expect(createWelcomeNote).not.toHaveBeenCalled();
  });

  it("does not ask the main process when no location is chosen", async () => {
    rootNotebookDirPathStore.set(null);

    expect(await createNotebookDir()).toBe("invalid-name");
    expect(createNotebookDirIpc).not.toHaveBeenCalled();
  });
});

describe("openExistingNotebook", () => {
  it("opens the main window when a folder is chosen", async () => {
    openExistingNotebookIpc.mockResolvedValue(true);

    await openExistingNotebook();

    expect(openMainWindow).toHaveBeenCalledTimes(1);
  });

  it("stays on the starter window when the picker is cancelled", async () => {
    openExistingNotebookIpc.mockResolvedValue(false);

    await openExistingNotebook();

    expect(openMainWindow).not.toHaveBeenCalled();
  });
});

describe("createEmptyNote", () => {
  it("selects the note it created, not whichever note sorts first", async () => {
    const existing = { ...noteFixture("Zeta"), lastEditTime: 200 };
    const created = { ...noteFixture("Untitled"), lastEditTime: 100 };
    getNotes.mockResolvedValue([existing, created]);

    await createEmptyNote();

    expect(createNoteIpc).toHaveBeenCalledWith({
      title: "Untitled",
      content: "",
    });
    expect(get(selectedNoteIdStore)).toBe("Untitled.md");
    expect(loadNoteIntoActiveTab).toHaveBeenCalledWith(created);
  });
});
