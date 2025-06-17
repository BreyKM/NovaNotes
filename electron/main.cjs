// Modules to control application life and create native browser window
const { log } = require("console");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fse = require("fs-extra");
const ElectronStore = require("./electronStore.cjs");

if (require("electron-squirrel-startup")) app.quit();

const isDevEnvironment = process.env.DEV_ENV === "true";

// enable live reload for electron in dev mode
if (isDevEnvironment) {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

// util functions
const {
  NoteBookDirSelection,
  createNotebookDir,
  createWelcomeNote,
  getNotes,
  createNote,
  readNote,
  writeNote,
  renameNote,
} = require("./util.cjs");

// window variables
let mainWindow;
let starterWindow;

// Directory variables
let NoteBookDirFilePath;

let NewNotebookFullPath;

let NewNotebookPathName;

let activeFolderPath;

let mainTabs = [];

let activeTabIndex = 0;

const ElectronStoreRef = new ElectronStore();

const createWindow = () => {
  // Create the main browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    autoHideMenuBar: true,
    center: true,
    title: "Nova Notes",
    frame: false,
    icon: "src/assets/icon.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // define how electron will load the app
  if (isDevEnvironment) {
    // if your vite app is running on a different port, change it here
    mainWindow.loadURL("http://localhost:5173/");

    // Open the DevTools.
    mainWindow.webContents.on("did-frame-finish-load", () => {
      mainWindow.webContents.openDevTools();
    });

    log("Electron running in dev mode: 🧪");
  } else {
    // when not in dev mode, load the build file instead
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));

    log("Electron running in prod mode: 🚀");
  }

  ipcMain.on("minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on("close", () => {
    app.quit();
  });
};

// Create the Directory selector window
const createStarterWindow = () => {
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
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: false,
  });

  if (isDevEnvironment) {
    starterWindow.loadURL("http://localhost:5173/starter.html");

    starterWindow.webContents.on("did-frame-finish-load", () => {
      starterWindow.webContents.openDevTools();
    });

    log("Electron running in dev mode: 🧪");
  } else {
    starterWindow.loadFile(path.join(__dirname, "build", "starter.html"));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// app.on('ready', createWindow);
// app.on('ready', createStarterWindow);

app.whenReady().then(() => {
  if (ElectronStoreRef.get("activeNotebookPath") != undefined) {
    fse.access(ElectronStoreRef.get("activeNotebookPath"), (error) => {
      if (!error && ElectronStoreRef.get("activeNotebookPath")) {
        createWindow();
        activeFolderPath = ElectronStoreRef.get("activeNotebookPath");
        require("./util.cjs").updateActiveFolderPathInUtil(activeFolderPath);
        console.log(activeFolderPath);
      } else {
        createStarterWindow();
        console.log("Folder does not exist");
        console.log(
          "activeNotebookPath: ",
          ElectronStoreRef.get("activeNotebookPath"),
        );
        ElectronStoreRef.delete("activeNotebookPath");
        console.log(
          "activeNotebookPath: ",
          ElectronStoreRef.get("activeNotebookPath"),
        );
      }
    });
  } else {
    createStarterWindow();
  }

  //
  // createStarterWindow();
  // createWindow();

  //Opens dialog and select Notebook directory location
  ipcMain.on("openRootDirSelection", (event) => {
    //
    NoteBookDirSelection().then((result) => {
      // assign the promise result path to the variable, then
      // send the path back to renderer through ipc
      NoteBookDirFilePath = result;
      console.log("main.cjs console log", NoteBookDirFilePath);
      event.reply("NoteBookDirSelected", NoteBookDirFilePath);
    });
  });

  ipcMain.handle("createNotebookDir", async (_, ...args) => {
    console.log("Number of arguments:", args.length);
    try {
      NewNotebookFullPath = await createNotebookDir(...args);
      console.log("path: ", NewNotebookFullPath);
      require("./util.cjs").updateNewNotebookDirPathMain(NewNotebookFullPath);

      ElectronStoreRef.set("activeNotebookPath", NewNotebookFullPath);

      require("./util.cjs").updateActiveFolderPathInUtil(NewNotebookFullPath);

      NewNotebookPathName = path.basename(NewNotebookFullPath);

      ElectronStoreRef.set("activeNotebookName", NewNotebookPathName);

      console.log("pathTest", NewNotebookPathName);
      return {
        fullPath: NewNotebookFullPath,
        name: NewNotebookPathName,
      };
    } catch (err) {
      console.error("Error creating notebook directory: ", err);
      throw err;
    }
  });

  ipcMain.handle("getActiveFolder", async () => {
    const result = await ElectronStoreRef.get("activeNotebookName");
    console.log("getActiveFolder", result);
    return result;
  });

  ipcMain.handle("createWelcomeNote", (_, ...args) =>
    createWelcomeNote(...args, ElectronStoreRef),
  );

  ipcMain.handle("getNotes", (_, ...args) => getNotes(ElectronStoreRef));

  ipcMain.handle("createNote", (_, ...args) => createNote(...args));

  ipcMain.handle("readNote", (_, ...args) => readNote(...args));

  ipcMain.handle("writeNote", (_, ...args) => writeNote(...args));

  ipcMain.handle("renameNote", (_, ...args) => renameNote(...args));

  function broadcastTabUpdate() {
    if (mainWindow) {
      mainWindow.webContents.send("tabsUpdated", {
        tabs: mainTabs,
        activeIndex: activeTabIndex,
      });
    }
  }

  ipcMain.handle("getTabs", () => {
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
    const newTab = {
      tabId: Date.now() + Math.random(),
      noteId: null,
      title: "new tab",
    };
    mainTabs.push(newTab);
    activeTabIndex = mainTabs.length - 1;
    broadcastTabUpdate();
  });

  ipcMain.handle("loadNoteIntoActiveTab", (event, selectedNote) => {
    if (!selectedNote || !mainTabs[activeTabIndex]) {
      return;
    }

    mainTabs[activeTabIndex].noteId = selectedNote.id;
    mainTabs[activeTabIndex].title = selectedNote.title;

    console.log(
      `Main: Loaded note '${selectedNote.title} into active tab index ${activeTabIndex}'`,
    );
    broadcastTabUpdate();
  });

  ipcMain.handle("updateTabs", (event, tabs) => {
    mainTabs = tabs;
    if (activeTabIndex >= mainTabs.length) {
      activeTabIndex = Math.max(0, mainTabs.length - 1);
    }
    broadcastTabUpdate();
  });

  ipcMain.handle("activeTabIndex", (event, index) => {
    if (index >= 0 && index < mainTabs.length) {
      activeTabIndex = index;
      console.log("MAIN: activeTabIndex", activeTabIndex);
      broadcastTabUpdate()
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


