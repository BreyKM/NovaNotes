import { describe, it, expect } from "vitest";
import { splitFrontmatter, findNextAvailableTitle } from "./Store";
import type { NoteMeta } from "../../shared/types";

const note = (title: string): NoteMeta => ({
  title,
  creationTime: 0,
  lastEditTime: 0,
  id: title,
});

describe("splitFrontmatter", () => {
  it("extracts frontmatter with LF line endings", () => {
    const raw = "---\ntitle: Test\n---\n\nBody text.";
    const { frontmatter, body } = splitFrontmatter(raw);

    expect(frontmatter).toBe("---\ntitle: Test\n---\n\n");
    expect(body).toBe("Body text.");
  });

  it("extracts frontmatter with CRLF line endings", () => {
    const raw = "---\r\ntitle: Test\r\n---\r\n\r\nBody text.";
    const { frontmatter, body } = splitFrontmatter(raw);

    expect(frontmatter).toBe("---\r\ntitle: Test\r\n---\r\n\r\n");
    expect(body).toBe("Body text.");
  });

  it("returns the whole document as body when there is no frontmatter", () => {
    const raw = "# Just a heading\n\nSome text.";
    const { frontmatter, body } = splitFrontmatter(raw);

    expect(frontmatter).toBe("");
    expect(body).toBe(raw);
  });

  it("does not treat an unterminated --- as frontmatter", () => {
    const raw = "---\n\nA thematic break, not metadata.";

    expect(splitFrontmatter(raw).frontmatter).toBe("");
  });

  it("handles frontmatter with no trailing newline", () => {
    const raw = "---\ntitle: Test\n---";

    expect(splitFrontmatter(raw).frontmatter).toBe(raw);
    expect(splitFrontmatter(raw).body).toBe("");
  });

  it.each([
    "---\ntitle: Test\n---\n\nBody.",
    "---\r\ntitle: Test\r\n---\r\n\r\nBody.",
    "# No frontmatter here",
    "",
    "---\nunterminated",
  ])("preserve every byte (frontmatter + body === input): %j", (raw) => {
    const { frontmatter, body } = splitFrontmatter(raw);

    expect(frontmatter + body).toBe(raw);
  });
});

describe("findNextAvailableTitle", () => {
  it("returns Untitled for an empty notebook", () => {
    expect(findNextAvailableTitle([])).toBe("Untitled");
  });

  it("increments past an existing Untitled", () => {
    expect(findNextAvailableTitle([note("Untitled")])).toBe("Untitled 1");
  });

  it("fills the lowest gap rather than appending", () => {
    const notes = [note("Untitled"), note("Untitled 2")];

    expect(findNextAvailableTitle(notes)).toBe("Untitled 1");
  });

  it("ignores titles that are not Untitled", () => {
    expect(findNextAvailableTitle([note("My Note")])).toBe("Untitled");
  });
});
