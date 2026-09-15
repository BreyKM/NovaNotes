import {
  ensureDir,
  writeFile,
  readdir,
  stat,
  readJSON,
  writeJSON,
} from "fs-extra";
import * as fse from "fs-extra";
import { fileEncoding } from "../shared/constants.cjs";
import { dialog } from "electron";
import path from "path";
import { randomUUID } from "crypto";
import type { NoteMeta, NewNote } from "../shared/types";
import type ElectronStore from "./electronStore.cjs";

let activeFolderPath: string | undefined;
let newNotebookFullPath: string | undefined;

export const updateNewNotebookDirPathMain = (newPath: string): void => {
  newNotebookFullPath = newPath;
};

export const updateActiveFolderPathInUtil = (newPath: string): void => {
  activeFolderPath = newPath;
};

const getRootDir = (): string | undefined => {
  if (!activeFolderPath) {
    return undefined;
  } else {
    if (activeFolderPath.length === 0) {
      return newNotebookFullPath;
    }
    return activeFolderPath;
  }
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

export const createWelcomeNote = async (
  welcomeNote: string,
  store: ElectronStore,
): Promise<void> => {
  const rootDir = store.get("activeNotebookPath") as string;
  await writeFile(`${rootDir}/welcome.md`, welcomeNote, {
    encoding: fileEncoding,
  });
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

export const getNotes = async (store: ElectronStore): Promise<NoteMeta[]> => {
  const rootDir = store.get("activeNotebookPath") as string;

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
  const rootDir = getRootDir() as string;

  await writeFile(`${rootDir}/${file.title}.md`, file.content, {
    encoding: fileEncoding,
  });
};

export const writeNote = (filename: string, content: string): Promise<void> => {
  const rootDir = getRootDir() as string;
  return writeFile(`${rootDir}/${filename}.md`, content, {
    encoding: fileEncoding,
  });
};

export const readNote = (filename: string): Promise<string> => {
  const rootDir = getRootDir() as string;
  return fse.readFile(`${rootDir}/${filename}.md`, {
    encoding: fileEncoding,
  }) as Promise<string>;
};

export const renameNote = async (
  oldTitle: string,
  newTitle: string,
): Promise<boolean> => {
  const rootDir = getRootDir();
  if (!rootDir) {
    console.error("renameNote called before rootDir is set.");
    return false;
  }

  const oldPath = path.join(rootDir, `${oldTitle}.md`);
  const newPath = path.join(rootDir, `${newTitle}.md`);

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
