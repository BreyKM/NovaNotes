const { ensureDir, writeFile, readdir, stat, readJSON } = require("fs-extra");
const { fileEncoding } = require("../shared/constants.cjs");
const { dialog } = require("electron");
const path = require("path");

const fse = require("fs-extra");

let { activeFolderPath, NewNotebookFullPath } = require("./main.cjs");

module.exports.updateNewNotebookDirPathMain = async (newPath) => {
  NewNotebookFullPath = await Promise.resolve(newPath);
};

module.exports.updateActiveFolderPathInUtil = async (newPath) => {
  activeFolderPath = await Promise.resolve(newPath);
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
  console.log("getNotes RootDir: ", rootDir);

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false,
  });

  console.log(
    "MAIN-UTIL notesFileNameLength: ",
    await Promise.resolve(notesFileNames),
  );
  if (
    (await Promise.resolve(notesFileNames).length) == 0 ||
    !notesFileNames ||
    notesFileNames == undefined ||
    notesFileNames == null
  ) {
    return Promise.resolve([]);
  } else {
    const notes = await notesFileNames.filter((filename) =>
      filename.endsWith(".md"),
    );
    console.log("notes: ", Promise.resolve(notes));

    return Promise.all(notes.map(getNoteInfo(rootDir)));
  }
};

const getNoteInfo = (rootDir) => async (filename) => {
  const fileStats = await stat(`${rootDir}/${filename}`);

  return {
    title: filename.replace(/\.md$/, ""),
    creationTime: fileStats.birthtimeMs,
    lastEditTime: fileStats.mtimeMs,
    id: fileStats.ino,
  };
};

module.exports.createNote = (file) => {
  const rootDir = getRootDir();
  console.log("createNote rootDir ", rootDir);
  console.log("createNote filename ", file.title);
  console.log("createNote content ", file.content);

 

  console.log("createNote noteContent ", file.content);

  return writeFile(`${rootDir}/${file.title}.md`, file.content, {
    encoding: fileEncoding,
  });
};

module.exports.writeNote = (filename, content) => {
  const rootDir = getRootDir();
  console.log("writing file");
  console.log("WriteNote: ", content)

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
  if(!rootDir) {
    console.error("renameNote called before rootDir is set.")
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
