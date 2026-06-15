const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  startTimerTick: () => ipcRenderer.send('start-timer'),
  stopTimerTick: () => ipcRenderer.send('stop-timer'),
  onTimerTick: (callback) => {
    const wrappedCallback = (event) => callback();
    ipcRenderer.on('timer-tick', wrappedCallback);
    return wrappedCallback;
  },
  logAnalyticsEvent: (data) => ipcRenderer.send('log-event', data),
  getAnalytics: () => ipcRenderer.invoke('get-analytics'),
  getScreenTime: () => ipcRenderer.invoke('get-screen-time'),
  exportCsv: (csvContent) => ipcRenderer.invoke('export-csv', csvContent),
  openAnalyticsWindow: () => ipcRenderer.send('open-analytics-window'),
  minimizeAnalytics: () => ipcRenderer.send('minimize-analytics'),
  maximizeAnalytics: () => ipcRenderer.send('maximize-analytics'),
  closeAnalytics: () => ipcRenderer.send('close-analytics'),
  setKauseId: (id) => ipcRenderer.send('set-kause-id', id),
  downloadRecoveryId: (content) => ipcRenderer.invoke('download-recovery-id', content),
  resetApp: () => ipcRenderer.send('reset-app'),
  onResetApp: (callback) => {
    ipcRenderer.on('reset-to-onboarding', () => callback());
  },
  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-updated', () => callback());
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', () => callback());
  },
  installUpdate: () => ipcRenderer.send('install-update'),
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  saveSettings: (id, settings) => ipcRenderer.send('save-settings', id, settings),
  getSettings: (id) => ipcRenderer.invoke('get-settings', id),
  removeTimerTick: (callback) => {
    ipcRenderer.removeListener('timer-tick', callback);
  }
});
