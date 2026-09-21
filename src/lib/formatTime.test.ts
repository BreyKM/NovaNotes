import { describe, expect, it } from "vitest";
import { formatEdited } from "./formatTime";

const now = Date.UTC(2026, 8, 21, 12, 0, 0);
const ago = (ms: number) => now - ms;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatEdited", () => {
  it.each([
    [ago(20_000), "just now"],
    [ago(5 * MINUTE), "5 min ago"],
    [ago(3 * HOUR), "3 h ago"],
    [ago(DAY + HOUR), "1 day ago"],
    [ago(4 * DAY), "4 days ago"],
  ])("describes %j ad %j", (editedAt, expected) => {
    expect(formatEdited(editedAt, now)).toBe(expected);
  });

  it("switches to a date after a week", () => {
    expect(formatEdited(ago(30 * DAY), now)).toMatch(/2026/);
  });
});
