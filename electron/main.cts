// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fse from "fs-extra";
import ElectronStore from "./electronStore.cjs";
import type { Tab, TabsState, NoteMeta, NewNote } from "../shared/types";

// util functions
import {
  selectNotebookDirectory,
  createNotebookDir,
  createWelcomeNote,
  getNotes,
  createNote,
  readNote,
  writeNote,
  renameNote,
  setNotebookPath,
  getNotebookPath,
} from "./util.cjs";

if (require("electron-squirrel-startup")) app.quit();

const isDevEnvironment = process.env.DEV_ENV === "true";

// enable live reload for electron in dev mode
if (isDevEnvironment) {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

// window variables
let mainWindow: BrowserWindow | undefined;
let starterWindow: BrowserWindow | undefined;

// Directory variables
let noteBookDirFilePath: string | undefined;

let mainTabs: Tab[] = [];
let activeTabIndex = 0;

const electronStore = new ElectronStore();

const useNotebook = (dir: string): void => {
  setNotebookPath(dir);
  electronStore.set("activeNotebookPath", dir);
};

const createWindow = (): void => {
  // Create the main browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    autoHideMenuBar: true,
    center: true,
    title: "Nova Notes",
    frame: false,
    icon: path.join(__dirname, "..", "src", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // define how electron will load the app
  if (isDevEnvironment) {
    mainWindow.loadURL("http://localhost:5173/");
    // Open the DevTools.
    mainWindow.webContents.on("did-frame-finish-load", () => {
      mainWindow?.webContents.openDevTools();
    });

    console.log("Electron running in dev mode: 🧪");
  } else {
    // when not in dev mode, load the build file instead
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
    console.log("Electron running in prod mode: 🚀");
  }

  ipcMain.on("minimize", () => {
    mainWindow?.minimize();
  });

  ipcMain.on("maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on("close", () => {
    mainWindow?.close();
  });

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow?.webContents.send("saveBeforeClose");

    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
      }
    }, 5000);
  });

  ipcMain.on("readyToClose", () => {
    mainWindow?.destroy();
  });
};

// Create the Directory selector window
const createStarterWindow = (): void => {
  if (starterWindow) {
    starterWindow.focus();
    return;
  }

  starterWindow = new BrowserWindow({
    width: 820,
    height: 700,
    autoHideMenuBar: true,
    center: true,
    title: "Nova Starter Page",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
    resizable: false,
  });

  if (isDevEnvironment) {
    starterWindow.loadURL("http://localhost:5173/starter.html");
    starterWindow.webContents.on("did-frame-finish-load", () => {
      starterWindow?.webContents.openDevTools();
    });
    console.log("Electron running in dev mode: 🧪");
  } else {
    starterWindow.loadFile(path.join(__dirname, "build", "starter.html"));
  }
};

app.whenReady().then(() => {
  const activeNotebookPath = electronStore.get("activeNotebookPath") as
    string | undefined;

  if (activeNotebookPath != undefined) {
    fse.access(activeNotebookPath, (error) => {
      if (!error) {
        useNotebook(activeNotebookPath);
        createWindow();
      } else {
        createStarterWindow();
        electronStore.delete("activeNotebookPath");
      }
    });
  } else {
    createStarterWindow();
  }

  //Opens dialog and select Notebook directory location
  ipcMain.on("openRootDirSelection", (event) => {
    selectNotebookDirectory().then((result) => {
      // assign the promise result path to the variable, then
      // send the path back to renderer through ipc
      noteBookDirFilePath = result;
      event.reply("NoteBookDirSelected", noteBookDirFilePath);
    });
  });

  ipcMain.handle(
    "createNotebookDir",
    async (_event, input: string, rootPath: string | undefined) => {
      const dir = await createNotebookDir(input, rootPath);
      useNotebook(dir);
      return { fullPath: dir, name: path.basename(dir) };
    },
  );

  ipcMain.handle("getActiveFolder", async () => {
    return path.basename(getNotebookPath());
  });

  ipcMain.handle("createWelcomeNote", (_event, welcomeNote: string) =>
    createWelcomeNote(welcomeNote),
  );

  ipcMain.handle("getNotes", () => getNotes());
  ipcMain.handle("createNote", (_event, note: NewNote) => createNote(note));
  ipcMain.handle("readNote", (_event, filename: string) => readNote(filename));
  ipcMain.handle("writeNote", (_event, filename: string, content: string) =>
    writeNote(filename, content),
  );
  ipcMain.handle("renameNote", (_event, oldTitle: string, newTitle: string) =>
    renameNote(oldTitle, newTitle),
  );

  ipcMain.handle("openLink", (_event, url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        return shell.openExternal(url);
      }
      console.error("Invalid protocol: ", parsedUrl.protocol);
      return false;
    } catch (error) {
      console.error("Invalid URL: ", url, error);
      return false;
    }
  });

  const broadcastTabUpdate = (): void => {
    if (mainWindow) {
      const state: TabsState = { tabs: mainTabs, activeIndex: activeTabIndex };
      mainWindow.webContents.send("tabsUpdated", state);
    }
  };

  ipcMain.handle("getTabs", (): TabsState => {
    if (mainTabs.length === 0) {
      mainTabs.push({
        tabId: Date.now(),
        noteId: null,
        title: "new tab",
      });
      activeTabIndex = 0;
    }
    return { tabs: mainTabs, activeIndex: activeTabIndex };
  });

  ipcMain.on("createTab", () => {
    const newTab: Tab = {
      tabId: Date.now() + Math.random(),
      noteId: null,
      title: "new tab",
    };
    mainTabs.push(newTab);
    activeTabIndex = mainTabs.length - 1;
    broadcastTabUpdate();
  });

  ipcMain.handle("createTabForNewNote", (_event, newNote: NoteMeta) => {
    if (!newNote || !newNote.id || !newNote.title) {
      console.error("createTabForNewNote called with invalid note object.");
      return;
    }

    const newTab = {
      tabId: Date.now() + Math.random(),
      noteId: newNote.id,
      title: newNote.title,
    };

    mainTabs.push(newTab);
    activeTabIndex = mainTabs.length - 1;

    broadcastTabUpdate();
  });

  ipcMain.handle("loadNoteIntoActiveTab", (_event, selectedNote: NoteMeta) => {
    if (!selectedNote || !mainTabs[activeTabIndex]) {
      return;
    }

    mainTabs[activeTabIndex].noteId = selectedNote.id;
    mainTabs[activeTabIndex].title = selectedNote.title;

    broadcastTabUpdate();
  });

  ipcMain.handle("updateTabs", (_event, tabs: Tab[]) => {
    mainTabs = tabs;
    if (activeTabIndex >= mainTabs.length) {
      activeTabIndex = Math.max(0, mainTabs.length - 1);
    }
    broadcastTabUpdate();
  });

  ipcMain.handle("activeTabIndex", (_event, index: number) => {
    if (index >= 0 && index < mainTabs.length) {
      activeTabIndex = index;
      broadcastTabUpdate();
    }
  });

  ipcMain.on("open-main-window", () => {
    if (starterWindow) {
      starterWindow.close();
    }

    createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
