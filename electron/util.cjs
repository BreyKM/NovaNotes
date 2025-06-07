const { dialog } = require("electron")

let { NoteBookDirFilePath } = require("./main.cjs")

module.exports.NoteBookDirSelection = async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    
    if (!result.canceled) {
        console.log("util.cjs console.log", result.filePaths);
        NoteBookDirFilePath = result.filePaths[0];
    } else {
        console.log("canceled")
    }

    return NoteBookDirFilePath;

};

module.exports.createNotebookDir = async () => {
    
}