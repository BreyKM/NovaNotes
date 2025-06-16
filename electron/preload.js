const { contextBridge, ipcRenderer } = require("electron");

const api = {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
};

contextBridge.exposeInMainWorld("api", api);

contextBridge.exposeInMainWorld("nav", {
  minimize: () => ipcRenderer.send("minimize"),

  maximize: () => ipcRenderer.send("maximize"),

  close: () => ipcRenderer.send("close"),
});

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

  createNotebookDir: (...args) =>
    ipcRenderer.invoke("createNotebookDir", ...args),
});

contextBridge.exposeInMainWorld("main", {
  openMainWindow: () => ipcRenderer.send("open-main-window"),

  getActiveFolder: () => ipcRenderer.invoke("getActiveFolder"),
});

contextBridge.exposeInMainWorld("notes", {
  createWelcomeNote: (...args) =>
    ipcRenderer.invoke("createWelcomeNote", ...args),

  getNotes: (...args) => ipcRenderer.invoke("getNotes", ...args),

  createNote: (...args) => ipcRenderer.invoke("createNote", ...args),

  readNote: (...args) => ipcRenderer.invoke("readNote", ...args),

  writeNote: (...args) => ipcRenderer.invoke("writeNote", ...args),

  renameNote: (...args) => ipcRenderer.invoke("renameNote", ...args),
});

contextBridge.exposeInMainWorld("tab", {
  getTabs: () => ipcRenderer.invoke("getTabs"),

  updateTabs: (tabs) => ipcRenderer.invoke("updateTabs", tabs),

  activeTabIndex: (index) => ipcRenderer.invoke("activeTabIndex", index),

  loadNoteIntoActiveTab: (selectedNote) => ipcRenderer.invoke("loadNoteIntoActiveTab", selectedNote),

  createTab: () => ipcRenderer.send("createTab"),

  onTabsUpdated: (callback) =>
    ipcRenderer.on("tabsUpdated", (_event, value) => callback(value)),
});
