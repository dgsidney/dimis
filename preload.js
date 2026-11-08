const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dimisAPI', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  saveAccounts: (accounts) => ipcRenderer.invoke('save-accounts', accounts),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getUserAgent: () => ipcRenderer.invoke('get-user-agent'),
  getWebviewPreloadPath: () => ipcRenderer.invoke('get-webview-preload-path'),
  clearAccountSession: (accountId) => ipcRenderer.invoke('clear-account-session', accountId),
  updateBadgeTotal: (totalUnread) => ipcRenderer.invoke('update-badge-total', totalUnread)
});
