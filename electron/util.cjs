const { ensureDir } = require("fs-extra");
const { dialog } = require("electron");
const path = require("path");

let { NoteBookDirFilePath } = require("./main.cjs");

module.exports.NoteBookDirSelection = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    console.log("util.cjs console.log", result.filePaths);
    NoteBookDirFilePath = result.filePaths[0];
  } else {
    console.log("canceled");
  }

  return NoteBookDirFilePath;
};

module.exports.createNotebookDir = async (input) => {
  if (input === "" || NoteBookDirFilePath === undefined) {
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
      throw err; // Propagate error to caller
    }
  }
};
