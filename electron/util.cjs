const { ensureDir, writeFile, readFile } = require("fs-extra");
const { fileEncoding } = require("../shared/constants.cjs");
const { dialog } = require("electron");
const path = require("path");


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

module.exports.createNotebookDir = async (input, NoteBookDirFilePath ) => {
  if (input === "" || NoteBookDirFilePath === undefined) {
    console.log(input)
    console.log(NoteBookDirFilePath)
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
  console.log("util ElectronStore active Notebook path: ", store.get("activeNotebookPath"))
  const rootDir = store.get("activeNotebookPath")

  console.log(JSON.stringify(welcomeNote))

  return writeFile(`${rootDir}/welcomeNote.json`, JSON.stringify(welcomeNote),  {
    encoding: fileEncoding,
  });

  


}