const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  name: 'math-wizard-data',
  defaults: {
    playerData: {
      coins: 0,
      currentLevel: 1,
      streakDays: 0,
      lastPlayDate: '',
      totalPlayTime: 0,
      currentOutfit: 'default',
      unlockedOutfits: ['default'],
      inventory: {}
    },
    userSettings: {
      parentPassword: '',
      dailyTimeLimit: 30,
      enabledQuestionTypes: ['addition', 'subtraction', 'multiplication', 'division', 'comparison', 'pattern', 'completion'],
      maxDifficulty: 10,
      soundEnabled: true,
      voiceEnabled: true
    },
    levels: [],
    shopItems: []
  }
});

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: '算术小达人',
    icon: path.join(__dirname, '../public/favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    backgroundColor: '#1a1a2e',
    show: false
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('store:get', (_event, key) => {
  return store.get(key);
});

ipcMain.handle('store:set', (_event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store:delete', (_event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('store:clear', () => {
  store.clear();
  return true;
});

ipcMain.handle('app:openExternal', (_event, url) => {
  shell.openExternal(url);
  return true;
});

ipcMain.handle('app:getPath', (_event, name) => {
  return app.getPath(name);
});

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
  return true;
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
  return true;
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
  return true;
});
