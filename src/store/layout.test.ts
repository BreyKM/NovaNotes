import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import {
  clampSidebarWidth,
  loadLayout,
  setSidebarWidth,
  sidebarCollapsed,
  sidebarWidth,
  toggleSidebar,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  COLLAPSE_BELOW_WIDTH,
  setSidebarCollapsed,
  sidebarDragResult,
  noteSort,
  setNoteSort,
} from "./layout";

const getLayout = vi.fn();
const setLayout = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", { layout: { get: getLayout, set: setLayout } });
  getLayout.mockResolvedValue({});
  sidebarWidth.set(220);
  sidebarCollapsed.set(false);
  noteSort.set("edited");
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clampsSidebarWidth", () => {
  it.each([
    [10, MIN_SIDEBAR_WIDTH],
    [900, MAX_SIDEBAR_WIDTH],
    [240.6, 241],
  ])("turns %j into %j", (input, expected) => {
    expect(clampSidebarWidth(input)).toBe(expected);
  });
});

describe("loadLayout", () => {
  it("applies a saved width and collapsed state", async () => {
    getLayout.mockResolvedValue({ sidebarWidth: 300, sidebarCollapsed: true });

    await loadLayout();

    expect(get(sidebarWidth)).toBe(300);
    expect(get(sidebarCollapsed)).toBe(true);
  });

  it("clamps a saved width that is out of range", async () => {
    getLayout.mockResolvedValue({ sidebarWidth: 5000 });

    await loadLayout();

    expect(get(sidebarWidth)).toBe(MAX_SIDEBAR_WIDTH);
  });

  it("keeps the defaults when nothing is saved", async () => {
    await loadLayout();

    expect(get(sidebarWidth)).toBe(220);
    expect(get(sidebarCollapsed)).toBe(false);
  });

  it("ignores values of the wrong type", async () => {
    getLayout.mockResolvedValue({
      sidebarWidth: "wide",
      sidebarCollapsed: "yes",
    });

    await loadLayout();

    expect(get(sidebarWidth)).toBe(220);
    expect(get(sidebarCollapsed)).toBe(false);
  });
});

describe("setSidebarWidth", () => {
  it("clamps before saving", () => {
    setSidebarWidth(20);

    expect(get(sidebarWidth)).toBe(MIN_SIDEBAR_WIDTH);
    expect(setLayout).toHaveBeenCalledWith({
      sidebarWidth: MIN_SIDEBAR_WIDTH,
      sidebarCollapsed: false,
      noteSort: "edited",
    });
  });
});

describe("toggleSidebar", () => {
  it("flips the state and saves it", () => {
    toggleSidebar();

    expect(get(sidebarCollapsed)).toBe(true);
    expect(setLayout).toHaveBeenCalledWith({
      sidebarWidth: 220,
      sidebarCollapsed: true,
      noteSort: "edited",
    });

    toggleSidebar();

    expect(get(sidebarCollapsed)).toBe(false);
  });
});

describe("sidebarDragResult", () => {
  it("collapses once the drag passes the threshold", () => {
    expect(sidebarDragResult(COLLAPSE_BELOW_WIDTH - 1)).toEqual({
      collapsed: true,
    });
  });

  it("holds at the minimum between the threshold and the minimum", () => {
    expect(sidebarDragResult(COLLAPSE_BELOW_WIDTH + 10)).toEqual({
      collapsed: false,
      width: MIN_SIDEBAR_WIDTH,
    });
  });

  it("follows the pointer inside the allowed range", () => {
    expect(sidebarDragResult(300)).toEqual({ collapsed: false, width: 300 });
  });
});

describe("setSidebarCollapsed", () => {
  it("keeps the  width when collapsing, so reopening restores it", () => {
    sidebarWidth.set(310);

    setSidebarCollapsed(true);

    expect(setLayout).toHaveBeenCalledWith({
      sidebarWidth: 310,
      sidebarCollapsed: true,
      noteSort: "edited",
    });
  });
});

describe("noteSort", () => {
  it("loads a saved sort", async () => {
    getLayout.mockResolvedValue({ noteSort: "name" });

    await loadLayout();

    expect(get(noteSort)).toBe("name");
  });

  it("ignores a sort it does not recognise", async () => {
    getLayout.mockResolvedValue({ noteSort: "size" });

    await loadLayout();

    expect(get(noteSort)).toBe("edited");
  });

  it("saves a new sort with the rest of the layout", () => {
    setNoteSort("created");

    expect(setLayout).toHaveBeenCalledWith({
      sidebarWidth: 220,
      sidebarCollapsed: false,
      noteSort: "created",
    });
  });
});
