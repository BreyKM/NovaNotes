// Modules to control application life and create native browser window
const { log } = require('console')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const { NoteBookDirSelection } = require("./util.cjs")

if (require('electron-squirrel-startup')) app.quit();

const isDevEnvironment = process.env.DEV_ENV === 'true'

// enable live reload for electron in dev mode
if (isDevEnvironment) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;
let starterWindow;

let NotebookFolderName;
let NoteBookDirFilePath;

const createWindow = () => {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1050,
        height: 800,
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // define how electron will load the app
    if (isDevEnvironment) {

        // if your vite app is running on a different port, change it here
        mainWindow.loadURL('http://localhost:5173/');

        // Open the DevTools.
        mainWindow.webContents.on("did-frame-finish-load", () => {
            mainWindow.webContents.openDevTools();
        });

        log('Electron running in dev mode: 🧪')

    } else {
        
        // when not in dev mode, load the build file instead
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

        log('Electron running in prod mode: 🚀')
    }
}

 const createStarterWindow = () => {
    
    if(starterWindow) {
        starterWindow.focus();
        return;
    }

    starterWindow= new BrowserWindow({
        width:820,
        height:700,
        autoHideMenuBar: true,
        center: true,
        title: "Nova Starter Page",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (isDevEnvironment) {
        starterWindow.loadURL('http://localhost:5173/starter.html');

        starterWindow.webContents.on("did-frame-finish-load", () => {
            starterWindow.webContents.openDevTools();
        })

        log('Electron running in dev mode: 🧪')
    } else {
        starterWindow.loadFile(path.join(__dirname, 'build', 'starter.html'))
    }
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


// app.on('ready', createWindow);
// app.on('ready', createStarterWindow);


app.whenReady().then(() => {

    createStarterWindow();

    //Opens dialog and select Notebook location
    ipcMain.on("openDirSelection", (event) => {
        NoteBookDirSelection().then((result) => {
            NoteBookDirFilePath = result;
            console.log("main.cjs console log", NoteBookDirFilePath);
            event.reply("NoteBookDirSelected", NoteBookDirFilePath);
        });
    });




})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


