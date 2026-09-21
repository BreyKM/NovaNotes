import { contextBridge, ipcRenderer } from "electron";
import type {
  NoteMeta,
  NewNote,
  Tab,
  TabsState,
  CreateNotebookResult,
} from "../shared/types";

const api = {
  node: (): string => process.versions.node,
  chrome: (): string => process.versions.chrome,
  electron: (): string => process.versions.electron,
  platform: (): string => process.platform,
};

contextBridge.exposeInMainWorld("api", api);

contextBridge.exposeInMainWorld("nav", {
  minimize: (): void => ipcRenderer.send("minimize"),

  maximize: (): void => ipcRenderer.send("maximize"),

  close: (): void => ipcRenderer.send("close"),

  onSaveBeforeClose: (callback: () => void): void => {
    ipcRenderer.on("saveBeforeClose", () => callback());
  },

  readyToClose: (): void => ipcRenderer.send("readyToClose"),
});

//directory ipc connections
contextBridge.exposeInMainWorld("directory", {
  openRootDirSelection: (): void => ipcRenderer.send("openRootDirSelection"),

  getRootNotebookDirPath: (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      ipcRenderer.once(
        "NoteBookDirSelected",
        (event, rootNoteBookDirPath: string | undefined) => {
          resolve(rootNoteBookDirPath);
        },
      );
    });
  },

  openExistingNotebook: (): Promise<boolean> =>
    ipcRenderer.invoke("openExistingNotebook"),

  createNotebookDir: (
    name: string,
    parentDir: string,
  ): Promise<CreateNotebookResult> =>
    ipcRenderer.invoke("createNotebookDir", name, parentDir),
});

contextBridge.exposeInMainWorld("main", {
  openMainWindow: (): void => ipcRenderer.send("open-main-window"),

  getActiveFolder: (): Promise<string | undefined> =>
    ipcRenderer.invoke("getActiveFolder"),

  openLink: (url: string): Promise<boolean> =>
    ipcRenderer.invoke("openLink", url),
});

contextBridge.exposeInMainWorld("notes", {
  createWelcomeNote: (content: string): Promise<void> =>
    ipcRenderer.invoke("createWelcomeNote", content),

  getNotes: (): Promise<NoteMeta[]> => ipcRenderer.invoke("getNotes"),

  createNote: (note: NewNote): Promise<void> =>
    ipcRenderer.invoke("createNote", note),

  readNote: (filename: string): Promise<string> =>
    ipcRenderer.invoke("readNote", filename),

  writeNote: (filename: string, content: string): Promise<void> =>
    ipcRenderer.invoke("writeNote", filename, content),

  renameNote: (oldTitle: string, newTitle: string): Promise<boolean> =>
    ipcRenderer.invoke("renameNote", oldTitle, newTitle),
});

contextBridge.exposeInMainWorld("tab", {
  getTabs: (): Promise<TabsState> => ipcRenderer.invoke("getTabs"),

  updateTabs: (tabs: Tab[]): Promise<void> =>
    ipcRenderer.invoke("updateTabs", tabs),

  activeTabIndex: (index: number): Promise<void> =>
    ipcRenderer.invoke("activeTabIndex", index),

  loadNoteIntoActiveTab: (selectedNote: NoteMeta): Promise<void> =>
    ipcRenderer.invoke("loadNoteIntoActiveTab", selectedNote),

  createTab: (): void => ipcRenderer.send("createTab"),

  createTabForNewNote: (note: NoteMeta): Promise<void> =>
    ipcRenderer.invoke("createTabForNewNote", note),

  onTabsUpdated: (callback: (state: TabsState) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, v: TabsState) =>
      callback(v);
    ipcRenderer.on("tabsUpdated", listener);
    return () => ipcRenderer.removeListener("tabsUpdated", listener);
  },
});
