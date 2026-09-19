import { ensureDir, writeFile, readdir, stat } from "fs-extra";
import * as fse from "fs-extra";
import { fileEncoding } from "../shared/constants.cjs";
import { dialog } from "electron";
import path from "path";
import type { NoteMeta, NewNote } from "../shared/types";
import { notePath } from "./notePath.cjs";

let notebookPath: string | undefined;

export const setNotebookPath = (dir: string): void => {
  notebookPath = dir;
};

export const getNotebookPath = (): string => {
  if (!notebookPath) {
    throw new Error("No notebook is open.");
  }
  return notebookPath;
};

export const selectNotebookDirectory = async (): Promise<
  string | undefined
> => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
};

export const createNotebookDir = async (
  input: string,
  NoteBookDirFilePath: string | undefined,
): Promise<string> => {
  if (input === "" || NoteBookDirFilePath === undefined) {
    throw new Error("Invalid input or missing directory path");
  }

  const dirPath = path.join(NoteBookDirFilePath, input);
  await ensureDir(dirPath);
  return dirPath;
};

const writeFileAtomic = async (
  filePath: string,
  content: string,
): Promise<void> => {
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, content, { encoding: fileEncoding });
  await fse.rename(tempPath, filePath);
};

export const createWelcomeNote = async (welcomeNote: string): Promise<void> => {
  const rootDir = getNotebookPath();
  await writeFileAtomic(notePath(rootDir, "welcome"), welcomeNote);
};

const getNoteInfo =
  (rootDir: string) =>
  async (filename: string): Promise<NoteMeta> => {
    const fileStats = await stat(`${rootDir}/${filename}`);

    return {
      title: filename.replace(/\.md$/, ""),
      creationTime: fileStats.birthtimeMs,
      lastEditTime: fileStats.mtimeMs,
      id: filename,
    };
  };

export const getNotes = async (): Promise<NoteMeta[]> => {
  const rootDir = getNotebookPath();

  const notesFileNames = (await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false,
  })) as unknown as string[];

  const noteFiles = notesFileNames.filter((filename) =>
    filename.endsWith(".md"),
  );

  return Promise.all(noteFiles.map(getNoteInfo(rootDir)));
};

export const createNote = async (file: NewNote): Promise<void> => {
  const rootDir = getNotebookPath();
  await writeFileAtomic(notePath(rootDir, file.title), file.content);
};

export const writeNote = (filename: string, content: string): Promise<void> => {
  const rootDir = getNotebookPath();
  return writeFileAtomic(notePath(rootDir, filename), content);
};

export const readNote = (filename: string): Promise<string> => {
  const rootDir = getNotebookPath();
  return fse.readFile(notePath(rootDir, filename), {
    encoding: fileEncoding,
  }) as Promise<string>;
};

export const renameNote = async (
  oldTitle: string,
  newTitle: string,
): Promise<boolean> => {
  const rootDir = getNotebookPath();

  const oldPath = path.join(notePath(rootDir, oldTitle));
  const newPath = path.join(notePath(rootDir, newTitle));

  try {
    await fse.access(newPath, fse.constants.F_OK);
    console.error(
      `Rename failed: A file named "${newTitle}.md" already exists.`,
    );
    return false;
  } catch (error) {
    try {
      await fse.rename(oldPath, newPath);

      return true;
    } catch (renameError) {
      console.error("Error during file rename operation: ", renameError);
      return false;
    }
  }
};
