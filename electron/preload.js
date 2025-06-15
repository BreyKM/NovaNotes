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
  openRootDirSelection: () => ipcRenderer.send("openRootDirSelection"),

  getRootNotebookDirPath: () => {
    return new Promise((resolve) => {
      ipcRenderer.once("NoteBookDirSelected", (event, rootNoteBookDirPath) => {
        resolve(rootNoteBookDirPath);
        console.log("Store NoteBookDirFilePath: ", rootNoteBookDirPath);
      });
    });
  },

  createNotebookDir: (...args) => ipcRenderer.invoke("createNotebookDir", ...args),
});

contextBridge.exposeInMainWorld("main", {
  openMainWindow: () => ipcRenderer.send("open-main-window"),

  getActiveFolder: () => ipcRenderer.invoke("getActiveFolder"),
});


contextBridge.exposeInMainWorld("notes", {
  createWelcomeNote: (...args) => ipcRenderer.invoke("createWelcomeNote", ...args),

  getNotes: (...args) => ipcRenderer.invoke("getNotes", ...args),

  createNote: (...args) => ipcRenderer.invoke("createNote", ...args),

  readNote: (...args) => ipcRenderer.invoke("readNote", ...args),
});


