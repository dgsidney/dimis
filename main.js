const electron = require('electron');
const { app, BrowserWindow, ipcMain, session, shell, Menu, Tray, nativeImage } = electron;
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Caminhos dos arquivos de configuração locais
const userDataPath = app.getPath('userData');
const accountsFile = path.join(userDataPath, 'dimis_accounts.json');
const settingsFile = path.join(userDataPath, 'dimis_settings.json');
const windowStateFile = path.join(userDataPath, 'dimis_window_state.json');

// User-Agent padrão do Chrome Desktop recente para o WhatsApp Web funcionar perfeitamente
const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Configurações padrão
function loadSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    }
  } catch (err) {
    console.error('Erro ao ler settings:', err);
  }
  return {
    minimizeToTray: true,
    closeToTray: true,
    startWithWindows: false,
    darkMode: true,
    enableNotifications: true,
    playSoundOnNotification: true,
    activeAccountId: 'acc_1',
    splitViewEnabled: false,
    splitSecondaryAccountId: null
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar settings:', err);
  }
}

// Contas padrão
function loadAccounts() {
  try {
    if (fs.existsSync(accountsFile)) {
      return JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
    }
  } catch (err) {
    console.error('Erro ao ler accounts:', err);
  }
  // Padrão inicial: 2 contas pré-configuradas para o usuário começar fácil
  const defaultAccounts = [
    {
      id: 'acc_1',
      name: 'WhatsApp 1',
      color: '#25D366',
      badge: 0,
      muted: false,
      createdAt: Date.now()
    },
    {
      id: 'acc_2',
      name: 'WhatsApp 2',
      color: '#00a884',
      badge: 0,
      muted: false,
      createdAt: Date.now() + 1
    }
  ];
  saveAccounts(defaultAccounts);
  return defaultAccounts;
}

function saveAccounts(accounts) {
  try {
    fs.writeFileSync(accountsFile, JSON.stringify(accounts, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar accounts:', err);
  }
}

// Salvar / Restaurar estado da janela
function loadWindowState() {
  try {
    if (fs.existsSync(windowStateFile)) {
      const state = JSON.parse(fs.readFileSync(windowStateFile, 'utf8'));
      if (state && typeof state.x === 'number' && typeof state.y === 'number' && app.isReady()) {
        const displays = electron.screen.getAllDisplays();
        const onScreen = displays.some(d => {
          const b = d.bounds;
          return state.x >= b.x && state.x < (b.x + b.width) &&
                 state.y >= b.y && state.y < (b.y + b.height);
        });
        if (onScreen) {
          return state;
        }
      }
    }
  } catch (e) {}
  return { width: 1200, height: 800, isMaximized: false };
}

function saveWindowState() {
  if (!mainWindow) return;
  try {
    const isMaximized = mainWindow.isMaximized();
    const bounds = mainWindow.getNormalBounds();
    fs.writeFileSync(windowStateFile, JSON.stringify({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized
    }), 'utf8');
  } catch (e) {}
}

// Configura uma sessão isolada para cada partição de conta
function configureAccountSession(partitionName) {
  const ses = session.fromPartition(partitionName);

  // Define User-Agent padrão sem a palavra 'Electron' para o WhatsApp não bloquear
  ses.setUserAgent(CHROME_USER_AGENT);

  // Intercepta requisições para garantir User-Agent limpo nos cabeçalhos
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = CHROME_USER_AGENT;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Habilita corretor ortográfico em português e inglês
  try {
    ses.setSpellCheckerLanguages(['pt-BR', 'pt', 'en-US']);
  } catch (e) {}

  // Permissões automáticas para microfone (áudios), notificações e área de transferência
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'notifications', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen'];
    if (allowed.includes(permission)) {
      return callback(true);
    }
    callback(false);
  });

  ses.setPermissionCheckHandler((webContents, permission) => {
    const allowed = ['media', 'notifications', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen'];
    return allowed.includes(permission);
  });
}

function createTray() {
  const icoPath = path.join(__dirname, 'assets', 'icon.ico');
  const pngPath = path.join(__dirname, 'assets', 'icon.png');
  let icon = null;
  if (fs.existsSync(icoPath)) {
    icon = nativeImage.createFromPath(icoPath);
  } else if (fs.existsSync(pngPath)) {
    icon = nativeImage.createFromPath(pngPath);
  } else {
    // Ícone verde de 16x16 em buffer como fallback
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#25D366"/><text x="8" y="11" font-size="8" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">D</text></svg>`;
    icon = nativeImage.createFromBuffer(Buffer.from(svgIcon));
  }

  tray = new Tray(icon);
  tray.setToolTip('dimis - Multi WhatsApp');

  const showApp = () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setAlwaysOnTop(false);
    }
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir dimis',
      click: showApp
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', showApp);
  tray.on('double-click', showApp);
}

function createWindow() {
  const windowState = loadWindowState();
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width || 1200,
    height: windowState.height || 800,
    minWidth: 800,
    minHeight: 600,
    title: 'dimis - Multi WhatsApp',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#111b21',
    autoHideMenuBar: true,
    show: true,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadFile('index.html');
  mainWindow.show();
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.setAlwaysOnTop(false);

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    try {
      fs.appendFileSync(path.join(__dirname, 'renderer_console.log'), `[CONSOLE ${level}] ${message} (${sourceId}:${line})\n`);
    } catch (e) {}
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    try {
      fs.appendFileSync(path.join(__dirname, 'renderer_console.log'), `[FAIL LOAD] ${errorCode} ${errorDescription}\n`);
    } catch (e) {}
  });

  const settings = loadSettings();

  mainWindow.on('close', (event) => {
    if (!isQuitting && settings.closeToTray) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    saveWindowState();
  });

  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);

  // Evita abrir popups na janela principal; abre no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

// Configura sessões para as contas existentes
function initSessions() {
  const accounts = loadAccounts();
  accounts.forEach(acc => {
    configureAccountSession(`persist:whatsapp_${acc.id}`);
  });
}

// IPC Handlers
ipcMain.handle('get-accounts', () => {
  return loadAccounts();
});

ipcMain.handle('save-accounts', (event, accounts) => {
  saveAccounts(accounts);
  // Garante que novas contas tenham sua sessão configurada
  accounts.forEach(acc => {
    configureAccountSession(`persist:whatsapp_${acc.id}`);
  });
  return true;
});

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, newSettings) => {
  saveSettings(newSettings);
  return true;
});

ipcMain.handle('get-user-agent', () => {
  return CHROME_USER_AGENT;
});

ipcMain.handle('get-webview-preload-path', () => {
  return pathToFileURL(path.join(__dirname, 'webview-preload.js')).href;
});

ipcMain.handle('clear-account-session', async (event, accountId) => {
  try {
    const ses = session.fromPartition(`persist:whatsapp_${accountId}`);
    await ses.clearStorageData();
    return true;
  } catch (err) {
    console.error('Erro ao limpar sessão:', err);
    return false;
  }
});

ipcMain.handle('update-badge-total', (event, totalUnread) => {
  if (app.isReady() && mainWindow) {
    if (totalUnread > 0) {
      mainWindow.setTitle(`(${totalUnread}) dimis - Multi WhatsApp`);
      if (process.platform === 'win32') {
        mainWindow.flashFrame(true);
        try {
          const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#ea4335"/><text x="8" y="11" font-size="8" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">${totalUnread > 9 ? '+' : totalUnread}</text></svg>`;
          const overlayIcon = nativeImage.createFromBuffer(Buffer.from(badgeSvg));
          mainWindow.setOverlayIcon(overlayIcon, `${totalUnread} novas mensagens`);
        } catch (e) {}
      }
      if (tray) {
        tray.setToolTip(`dimis - ${totalUnread} novas mensagens`);
      }
    } else {
      mainWindow.setTitle('dimis - Multi WhatsApp');
      if (process.platform === 'win32') {
        mainWindow.flashFrame(false);
        try {
          mainWindow.setOverlayIcon(null, '');
        } catch (e) {}
      }
      if (tray) {
        tray.setToolTip('dimis - Multi WhatsApp');
      }
    }
  }
});

// Menu de contexto nativo dentro das conversas (Copiar, Colar, Ortografia)
app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('context-menu', (e, params) => {
      const menuTemplate = [];

      // Sugestões do corretor ortográfico
      if (params.misspelledWord && params.dictionarySuggestions && params.dictionarySuggestions.length > 0) {
        params.dictionarySuggestions.forEach(suggestion => {
          menuTemplate.push({
            label: suggestion,
            click: () => contents.replaceMisspelling(suggestion)
          });
        });
        menuTemplate.push({ type: 'separator' });
      }

      // Campo de texto / mensagem
      if (params.isEditable) {
        menuTemplate.push(
          { label: 'Desfazer', role: 'undo' },
          { label: 'Refazer', role: 'redo' },
          { type: 'separator' },
          { label: 'Recortar', role: 'cut' },
          { label: 'Copiar', role: 'copy' },
          { label: 'Colar', role: 'paste' },
          { type: 'separator' },
          { label: 'Selecionar Tudo', role: 'selectAll' }
        );
      } else if (params.selectionText) {
        menuTemplate.push(
          { label: 'Copiar', role: 'copy' },
          { label: 'Selecionar Tudo', role: 'selectAll' }
        );
      }

      if (menuTemplate.length > 0) {
        const menu = Menu.buildFromTemplate(menuTemplate);
        menu.popup();
      }
    });
  }
});

// App Lifecycle
app.whenReady().then(() => {
  initSessions();
  createTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  saveWindowState();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    const settings = loadSettings();
    if (!settings.closeToTray) {
      app.quit();
    }
  }
});
