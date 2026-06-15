const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Disable background throttling completely
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;
  const windowWidth = 800;
  const windowHeight = 800;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.round((screenWidth - windowWidth) / 2),
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  mainWindow.webContents.on('did-finish-load', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setIgnoreMouseEvents(ignore, options);
  }
});

let mainTickInterval;
ipcMain.on('start-timer', (event) => {
  if (mainTickInterval) clearInterval(mainTickInterval);
  mainTickInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('timer-tick');
    }
  }, 1000);
});

const fs = require('fs');

let currentKauseId = 'default';
let analyticsFile = path.join(app.getPath('userData'), 'analytics_default.json');
let statsFile = path.join(app.getPath('userData'), 'appStats_default.json');

function loadStats() {
  try {
    if (fs.existsSync(statsFile)) {
      return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }
  } catch(e) {}
  return { screenTimeMs: 0 };
}

function saveStats(stats) {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  } catch(e) {}
}

let appStats = loadStats();
let screenTimeInterval = null;

function startScreenTimer() {
  if (screenTimeInterval) clearInterval(screenTimeInterval);
  screenTimeInterval = setInterval(() => {
    appStats.screenTimeMs += 60000;
    saveStats(appStats);
  }, 60000);
}
startScreenTimer();

ipcMain.on('set-kause-id', (event, id) => {
  if (!id) return;
  currentKauseId = id;
  analyticsFile = path.join(app.getPath('userData'), `analytics_${id}.json`);
  statsFile = path.join(app.getPath('userData'), `appStats_${id}.json`);
  appStats = loadStats(); // Reload stats for the new user
  startScreenTimer();
});

ipcMain.on('reset-app', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('reset-to-onboarding');
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('save-settings', (event, id, settings) => {
  if (!id) return;
  const settingsFile = path.join(app.getPath('userData'), `settings_${id}.json`);
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  } catch(e) {}
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings-updated');
  }
});

ipcMain.handle('get-settings', (event, id) => {
  if (!id) return null;
  const settingsFile = path.join(app.getPath('userData'), `settings_${id}.json`);
  try {
    if (fs.existsSync(settingsFile)) {
      return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    }
  } catch(e) {}
  return null;
});

function logAnalyticsEvent(eventData) {
  let data = [];
  try {
    if (fs.existsSync(analyticsFile)) {
      data = JSON.parse(fs.readFileSync(analyticsFile, 'utf8'));
    }
  } catch(e) {}
  data.push({ timestamp: new Date().toISOString(), ...eventData });
  fs.writeFileSync(analyticsFile, JSON.stringify(data, null, 2));
}

ipcMain.on('log-event', (event, eventData) => {
  logAnalyticsEvent(eventData);
});

ipcMain.handle('get-analytics', () => {
  try {
    if (fs.existsSync(analyticsFile)) {
      return JSON.parse(fs.readFileSync(analyticsFile, 'utf8'));
    }
  } catch(e) {}
  return [];
});

ipcMain.handle('get-screen-time', () => {
  return Math.floor(appStats.screenTimeMs / 60000);
});

let analyticsWindow;
ipcMain.on('open-analytics-window', () => {
  if (analyticsWindow) {
    analyticsWindow.focus();
    return;
  }
  
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const awWidth = 950;
  const awHeight = 650;

  analyticsWindow = new BrowserWindow({
    width: awWidth,
    height: awHeight,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    x: Math.round((screenWidth - awWidth) / 2),
    y: Math.round((screenHeight - awHeight) / 2),
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  analyticsWindow.setMenuBarVisibility(false);

  ipcMain.on('minimize-analytics', () => {
    if (analyticsWindow) analyticsWindow.minimize();
  });

  ipcMain.on('maximize-analytics', () => {
    if (analyticsWindow) {
      if (analyticsWindow.isMaximized()) {
        analyticsWindow.unmaximize();
      } else {
        analyticsWindow.maximize();
      }
    }
  });

  ipcMain.on('close-analytics', () => {
    if (analyticsWindow) analyticsWindow.close();
  });

  if (!app.isPackaged) {
    analyticsWindow.loadURL('http://localhost:5173/?window=analytics');
  } else {
    analyticsWindow.loadFile(path.join(__dirname, '../dist/index.html'), { search: 'window=analytics' });
  }

  analyticsWindow.on('closed', () => {
    analyticsWindow = null;
  });
});

const { dialog } = require('electron');
ipcMain.handle('export-csv', async (event, csvContent) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export Analytics',
    defaultPath: 'kause-analytics.csv',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, csvContent);
    return true;
  }
  return false;
});

ipcMain.handle('download-recovery-id', async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Download Recovery ID',
    defaultPath: 'kause-recovery-id.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
});

let updateNotificationSent = false;

autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  if (mainWindow && !mainWindow.isDestroyed() && !updateNotificationSent) {
    mainWindow.webContents.send('update-downloaded');
    updateNotificationSent = true;
  }
  
  if (analyticsWindow && !analyticsWindow.isDestroyed()) {
    analyticsWindow.webContents.send('update-downloaded');
  }
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
