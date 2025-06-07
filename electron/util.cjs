const { ensureDir } = require("fs-extra");
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

module.exports.createNotebookDir = async (input) => {
    if (input === "") {
        console.log("input is null");
    } else {
        const path = `${NoteBookDirFilePath}\\${input}`;
        console.log("createNotebookDir: ", path);
        ensureDir(path, function (err) {
            if (err) {
                console.log("Error in creating directory: " , err);
            } else {
              console.log("Directory created successfully");  
            }
            
        });
        return Promise.resolve(path)
    }
};