import { describe, expect, it } from "vitest";
import path from "path";
import { notePath } from "./notePath.cjs";

const notebook = path.join("notes", "My Notebook");

describe("notePath", () => {
  it("puts the note directly inside the notebook", () => {
    expect(notePath(notebook, "Shopping list")).toBe(
      path.join(notebook, "Shopping list.md"),
    );
  });

  it.each(["..", ".", "...", "Notes.", "..hidden", "é ✓ 日本"])(
    "keeps %j inside the notebook",
    (title) => {
      expect(path.dirname(notePath(notebook, title))).toBe(notebook);
    },
  );

  it.each([
    "../outside",
    "..\\outside",
    "sub/note",
    "sub\\note",
    "/absolute",
    "C:\\Windows\\note",
    "C:note",
    "bad*name",
    "line\nbreak",
    "",
    "   ",
  ])("rejects %j", (title) => {
    expect(() => notePath(notebook, title)).toThrow("Invalid note name");
  });
});
