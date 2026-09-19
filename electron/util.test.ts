import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { createNotebookDir } from "./util.cjs";

vi.mock("electron", () => ({ dialog: {} }));

describe("createNotebookDir", () => {
  let parentDir: string;

  beforeEach(async () => {
    parentDir = await mkdtemp(path.join(tmpdir(), "novanotes-"));
  });

  afterEach(async () => {
    await rm(parentDir, { recursive: true, force: true });
  });

  it("creates the folder and returns its path", async () => {
    const result = await createNotebookDir("Work", parentDir);

    expect(result).toEqual({
      ok: true,
      fullPath: path.join(parentDir, "Work"),
      name: "Work",
    });
    expect(await readdir(parentDir)).toEqual(["Work"]);
  });

  it("refuses a folder that already exists and leaves it untouched", async () => {
    await mkdir(path.join(parentDir, "Work"));
    await writeFile(path.join(parentDir, "Work", "keep.md"), "keep me");

    const result = await createNotebookDir("Work", parentDir);

    expect(result).toEqual({ ok: false, reason: "exists" });
    expect(await readdir(path.join(parentDir, "Work"))).toEqual(["keep.md"]);
  });

  it("refuses a name that would escape the chosen location", async () => {
    const result = await createNotebookDir("../escaped", parentDir);

    expect(result).toEqual({ ok: false, reason: "invalid-name" });
    expect(await readdir(parentDir)).toEqual([]);
  });
});
