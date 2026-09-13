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

const INDEX_FILENAME = ".novanotes-index.json";
type NoteIndex = Record<string, string>;

const getIndexPath = (rootDir: string): string =>
  path.join(rootDir, INDEX_FILENAME);

const loadIndex = async (rootDir: string): Promise<NoteIndex> => {
  try {
    return await readJSON(getIndexPath(rootDir));
  } catch (err) {
    return {};
  }
};

const saveIndex = async (rootDir: string, index: NoteIndex): Promise<void> => {
  await writeJSON(getIndexPath(rootDir), index, { spaces: 2 });
};

const getNoteInfo =
  (rootDir: string, index: NoteIndex) =>
  async (filename: string): Promise<NoteMeta> => {
    const fileStats = await stat(`${rootDir}/${filename}`);
    const title = filename.replace(/\.md$/, "");

    if (!index[title]) {
      index[title] = randomUUID();
    }

    return {
      title,
      creationTime: fileStats.birthtimeMs,
      lastEditTime: fileStats.mtimeMs,
      id: index[title],
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

  const index = await loadIndex(rootDir);
  const IndexSizeBefore = Object.keys(index).length;

  const notes = await Promise.all(noteFiles.map(getNoteInfo(rootDir, index)));

  if (Object.keys(index).length !== IndexSizeBefore) {
    await saveIndex(rootDir, index);
  }

  return notes;
};

export const createNote = async (file: NewNote): Promise<void> => {
  const rootDir = getRootDir() as string;

  const index = await loadIndex(rootDir);
  index[file.title] = randomUUID();
  await saveIndex(rootDir, index);

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

      const index = await loadIndex(rootDir);
      if (index[oldTitle]) {
        index[newTitle] = index[oldTitle];
        delete index[oldTitle];
        await saveIndex(rootDir, index);
      }

      return true;
    } catch (renameError) {
      console.error("Error during file rename operation: ", renameError);
      return false;
    }
  }
};
