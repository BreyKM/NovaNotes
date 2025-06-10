const { contextBridge, ipcRenderer } = require("electron");

const api = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
};

contextBridge.exposeInMainWorld("api", api);

//directory ipc connections
contextBridge.exposeInMainWorld("directory", {
  //
  openDirSelection: () => ipcRenderer.send("openDirSelection"),

  getNoteBookDirFilePath: () => {
    return new Promise((resolve) => {
      ipcRenderer.once("NoteBookDirSelected", (event, NoteBookDirFilePath) => {
        resolve(NoteBookDirFilePath);
        console.log("Store NoteBookDirFilePath: ", NoteBookDirFilePath);
      });
    });
  },

  createNewNotebookDir: (...args) =>
    ipcRenderer.invoke("createNewNotebookDir", ...args),
});


contextBridge.exposeInMainWorld("main", {
  openMainWindow: () => ipcRenderer.send("open-main-window")
})
