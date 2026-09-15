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
} from "./Store";
import type { NoteMeta } from "../../shared/types";

const noteFixture = (title: string): NoteMeta => ({
  title,
  creationTime: 0,
  lastEditTime: 0,
  id: `id-${title}`,
});

const readNote = vi.fn();
const writeNote = vi.fn().mockResolvedValue(undefined);
const loadNoteIntoActiveTab = vi.fn().mockResolvedValue(undefined);
const renameNoteIpc = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", {
    notes: { readNote, writeNote, renameNote: renameNoteIpc },
    tab: { loadNoteIntoActiveTab },
  });

  handleAutoSaving.cancel();
  notesStore.set([]);
  noteContentStore.set("");
  noteFrontmatterStore.set({});
  noteContentCache.set({});
  selectedNoteIdStore.set(null);
  userInputCurrentNoteTitle.set(null);

  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
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
    handleAutoSaving.flush();

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
    handleAutoSaving.flush();

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
    handleAutoSaving.flush();

    expect(writeNote).toHaveBeenCalledWith("Without", "Edited second.");
  });

  it("does not write when no note is selected", () => {
    updateNoteContent("orphan content");
    handleAutoSaving.flush();

    expect(writeNote).not.toHaveBeenCalled();
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
});
