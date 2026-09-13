const {
  ensureDir,
  writeFile,
  readdir,
  stat,
  readJSON,
  writeJSON,
} = require("fs-extra");
const { fileEncoding } = require("../shared/constants.cjs");
const { dialog } = require("electron");
const path = require("path");
const { randomUUID } = require("crypto");

const fse = require("fs-extra");

let { activeFolderPath, NewNotebookFullPath } = require("./main.cjs");

module.exports.updateNewNotebookDirPathMain = async (newPath) => {
  NewNotebookFullPath = await Promise.resolve(newPath);
};

module.exports.updateActiveFolderPathInUtil = async (newPath) => {
  activeFolderPath = await Promise.resolve(newPath);
};

const INDEX_FILENAME = ".novanotes-index.json";

const getIndexPath = (rootDir) => path.join(rootDir, INDEX_FILENAME);

const loadIndex = async (rootDir) => {
  try {
    return await readJSON(getIndexPath(rootDir));
  } catch (err) {
    return {};
  }
};

const saveIndex = async (rootDir, index) => {
  await writeJSON(getIndexPath(rootDir), index, { spaces: 2 });
};

const getRootDir = () => {
  if (!activeFolderPath) {
    return;
  } else {
    if (!activeFolderPath || activeFolderPath.length === 0) {
      console.log("getRootDir: ", NewNotebookFullPath);
      return `${NewNotebookFullPath}`;
    } else {
      console.log("getRootDir: ", activeFolderPath);
      return `${activeFolderPath}`;
    }
  }
};

module.exports.NoteBookDirSelection = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    console.log("util.cjs console.log", result.filePaths[0]);
  } else {
    console.log("canceled");
  }

  return result.filePaths[0];
};

module.exports.createNotebookDir = async (input, NoteBookDirFilePath) => {
  if (input === "" || NoteBookDirFilePath === undefined) {
    console.log(input);
    console.log(NoteBookDirFilePath);
    console.log("input is null");
    return Promise.reject(new Error("Invalid input or missing directory path"));
  } else {
    const dirPath = path.join(NoteBookDirFilePath, input);
    console.log("createNotebookDir: ", dirPath);
    try {
      await ensureDir(dirPath);
      console.log("Directory created successfully");
      return dirPath;
    } catch (err) {
      console.log("Error in creating directory: ", err);
      throw err;
    }
  }
};

module.exports.createWelcomeNote = async (welcomeNote, store) => {
  console.log(
    "util ElectronStore active Notebook path: ",
    store.get("activeNotebookPath"),
  );
  const rootDir = store.get("activeNotebookPath");

  console.log(JSON.stringify(welcomeNote));

  return writeFile(`${rootDir}/welcome.md`, welcomeNote, {
    encoding: fileEncoding,
  });
};

module.exports.getNotes = async (store) => {
  const rootDir = store.get("activeNotebookPath");

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false,
  });

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

const getNoteInfo = (rootDir, index) => async (filename) => {
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

module.exports.createNote = async (file) => {
  const rootDir = getRootDir();

  const index = await loadIndex(rootDir);
  index[file.title] = randomUUID();
  await saveIndex(rootDir, index);

  return writeFile(`${rootDir}/${file.title}.md`, file.content, {
    encoding: fileEncoding,
  });
};

module.exports.renameNote = async (oldTitle, newTitle) => {
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

module.exports.writeNote = (filename, content) => {
  const rootDir = getRootDir();
  console.log("writing file");
  console.log("WriteNote: ", content);

  return writeFile(`${rootDir}/${filename}.md`, content, {
    encoding: fileEncoding,
  });
};

module.exports.readNote = (filename) => {
  const rootDir = getRootDir();
  console.log("readNote RootDir", rootDir);

  return fse.readFile(`${rootDir}/${filename}.md`, {
    encoding: fileEncoding,
  });
};

module.exports.renameNote = async (oldTitle, newTitle) => {
  const rootDir = getRootDir();
  if (!rootDir) {
    console.error("renameNote called before rootDir is set.");
    return false;
  }

  const oldPath = path.join(rootDir, `${oldTitle}.md`);
  const newPath = path.join(rootDir, `${newTitle}.md`);

  console.log(`Attempting to rename: ${oldPath} -> ${newPath}`);

  try {
    await fse.access(newPath, fse.constants.F_OK);

    console.error(
      `Rename failed: A file named "${newTitle}.md" already exists.`,
    );
    return false;
  } catch (error) {
    try {
      await fse.rename(oldPath, newPath);
      console.log("Rename successful.");
      return true;
    } catch (renameError) {
      console.error("Error during file rename operation: ", renameError);
      return false;
    }
  }
};
