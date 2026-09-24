// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { applyTheme, loadTheme, theme, toggleTheme } from "./theme";

const setTheme = vi.fn();
const initial = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", { theme: { initial, set: setTheme } });
  initial.mockReturnValue("dark");
  applyTheme("dark");
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadTheme", () => {
  it("paints the theme the window was launched with", () => {
    initial.mockReturnValue("light");

    loadTheme();

    expect(get(theme)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(setTheme).not.toHaveBeenCalled();
  });
});

describe("toggleTheme", () => {
  it("switches to light and remembers the choice", () => {
    toggleTheme();

    expect(get(theme)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches back to dark", () => {
    toggleTheme();
    toggleTheme();

    expect(get(theme)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(setTheme).toHaveBeenLastCalledWith("dark");
  });
});
