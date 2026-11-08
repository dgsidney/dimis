// Renderer process do dimis
let accounts = [];
let settings = {};
let activeAccountId = null;
let splitSecondaryAccountId = null;
let userAgent = '';
let webviewPreloadPath = '';
let contextTargetAccountId = null;
let editingAccountId = null;

// Elementos DOM
const accountsListEl = document.getElementById('accounts-list');
const webviewsContainerEl = document.getElementById('webviews-container');
const headerAccountIndicator = document.getElementById('header-account-indicator');
const headerAccountName = document.getElementById('header-account-name');
const headerUnreadCount = document.getElementById('header-unread-count');
const btnHeaderReload = document.getElementById('btn-header-reload');
const btnHeaderMute = document.getElementById('btn-header-mute');
const iconSound = document.getElementById('icon-sound');
const labelSound = document.getElementById('label-sound');
const btnSplitToggle = document.getElementById('btn-split-toggle');
const btnAddAccount = document.getElementById('btn-add-account');
const btnSettings = document.getElementById('btn-settings');

// Modais
const modalAccount = document.getElementById('modal-account');
const modalAccountTitle = document.getElementById('modal-account-title');
const inputAccountName = document.getElementById('input-account-name');
const inputAccountColor = document.getElementById('input-account-color');
const btnCloseAccountModal = document.getElementById('btn-close-account-modal');
const btnCancelAccountModal = document.getElementById('btn-cancel-account-modal');
const btnSaveAccountModal = document.getElementById('btn-save-account-modal');

// Elementos de Avatar & Ícone no Modal
const accountAvatarPreview = document.getElementById('account-avatar-preview');
const previewAvatarText = document.getElementById('preview-avatar-text');
const previewAvatarImg = document.getElementById('preview-avatar-img');
const btnUploadAvatar = document.getElementById('btn-upload-avatar');
const btnRemoveAvatar = document.getElementById('btn-remove-avatar');
const inputAccountIconFile = document.getElementById('input-account-icon-file');
const inputAccountIconData = document.getElementById('input-account-icon-data');

const modalSettings = document.getElementById('modal-settings');
const btnCloseSettingsModal = document.getElementById('btn-close-settings-modal');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingCloseTray = document.getElementById('setting-close-tray');
const settingNotifications = document.getElementById('setting-notifications');

// Modal Doação Pix
const btnDonate = document.getElementById('btn-donate');
const modalDonate = document.getElementById('modal-donate');
const btnCloseDonateModal = document.getElementById('btn-close-donate-modal');
const btnDismissDonate = document.getElementById('btn-dismiss-donate');
const btnCopyPix = document.getElementById('btn-copy-pix');
const inputPixKey = document.getElementById('input-pix-key');
const textCopyPix = document.getElementById('text-copy-pix');

// Menu de Contexto
const contextMenu = document.getElementById('context-menu');
const ctxReload = document.getElementById('ctx-reload');
const ctxEdit = document.getElementById('ctx-edit');
const ctxMute = document.getElementById('ctx-mute');
const ctxMuteText = document.getElementById('ctx-mute-text');
const ctxClear = document.getElementById('ctx-clear');
const ctxDelete = document.getElementById('ctx-delete');

// Inicialização
async function init() {
  try {
    userAgent = await window.dimisAPI.getUserAgent();
    webviewPreloadPath = await window.dimisAPI.getWebviewPreloadPath();
    settings = await window.dimisAPI.getSettings();
    accounts = await window.dimisAPI.getAccounts();

    // Sincroniza configurações no modal
    settingCloseTray.checked = !!settings.closeToTray;
    settingNotifications.checked = !!settings.enableNotifications;

    // Se não houver conta ativa definida, usa a primeira
    if (!accounts.some(a => a.id === settings.activeAccountId) && accounts.length > 0) {
      activeAccountId = accounts[0].id;
    } else {
      activeAccountId = settings.activeAccountId || (accounts[0] ? accounts[0].id : null);
    }

    if (settings.splitViewEnabled && accounts.length > 1) {
      splitSecondaryAccountId = settings.splitSecondaryAccountId || accounts.find(a => a.id !== activeAccountId)?.id;
      btnSplitToggle.classList.add('active-mode');
      webviewsContainerEl.classList.add('split-mode');
    }

    renderAccounts();
    renderWebviews();
    if (activeAccountId) {
      selectAccount(activeAccountId);
    }

    setupEventListeners();
  } catch (err) {
    console.error('Erro na inicialização do dimis:', err);
  }
}

// Renderiza a lista de contas na barra lateral (Sidebar)
function renderAccounts() {
  accountsListEl.innerHTML = '';

  accounts.forEach((acc, index) => {
    const item = document.createElement('div');
    item.className = `account-item ${acc.id === activeAccountId ? 'active' : ''}`;
    item.dataset.id = acc.id;

    // Indicador vertical esquerdo
    const indicator = document.createElement('div');
    indicator.className = 'account-indicator';

    // Avatar / Círculo da conta
    const avatar = document.createElement('div');
    avatar.className = 'account-avatar';
    avatar.style.backgroundColor = acc.color || '#25D366';
    
    // Ícone personalizado (imagem, emoji ou inicial)
    if (acc.icon && (acc.icon.startsWith('data:image') || acc.icon.startsWith('http') || acc.icon.startsWith('file:') || acc.icon.endsWith('.png') || acc.icon.endsWith('.jpg'))) {
      const img = document.createElement('img');
      img.className = 'account-avatar-img';
      img.src = acc.icon;
      img.alt = acc.name;
      avatar.appendChild(img);
    } else if (acc.icon && acc.icon.trim().length > 0) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'account-avatar-preset';
      iconSpan.textContent = acc.icon;
      avatar.appendChild(iconSpan);
    } else {
      const initial = (acc.name && acc.name.trim().length > 0) 
        ? acc.name.trim().charAt(0).toUpperCase() 
        : (index + 1).toString();
      avatar.textContent = initial;
    }

    // Badge de mensagens não lidas
    if (acc.badge && acc.badge > 0) {
      const badge = document.createElement('div');
      badge.className = 'badge-count';
      badge.textContent = acc.badge > 99 ? '99+' : acc.badge;
      avatar.appendChild(badge);
    }

    // Indicador de silenciado
    if (acc.muted) {
      const mutedIcon = document.createElement('div');
      mutedIcon.className = 'muted-icon';
      mutedIcon.innerHTML = `<svg viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
      avatar.appendChild(mutedIcon);
    }

    // Tooltip com nome da conta e atalho
    const tooltip = document.createElement('div');
    tooltip.className = 'account-tooltip';
    tooltip.textContent = `${acc.name} (Ctrl+${index + 1})`;

    item.appendChild(indicator);
    item.appendChild(avatar);
    item.appendChild(tooltip);

    // Eventos de clique e botão direito
    item.addEventListener('click', () => {
      selectAccount(acc.id);
    });

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openContextMenu(e, acc.id);
    });

    accountsListEl.appendChild(item);
  });

  updateTotalBadge();
}

// Cria ou atualiza as WebViews para cada conta
function renderWebviews() {
  // Cria webviews que ainda não existem
  accounts.forEach(acc => {
    let wv = document.getElementById(`wv-${acc.id}`);
    if (!wv) {
      wv = document.createElement('webview');
      wv.id = `wv-${acc.id}`;
      wv.setAttribute('partition', `persist:whatsapp_${acc.id}`);
      wv.setAttribute('src', 'https://web.whatsapp.com');
      wv.setAttribute('useragent', userAgent);
      wv.setAttribute('preload', webviewPreloadPath);
      wv.setAttribute('allowpopups', 'true');
      wv.setAttribute('webpreferences', 'contextIsolation=false');

      // Escuta mensagens IPC vindas do webview-preload.js
      wv.addEventListener('ipc-message', (event) => {
        if (event.channel === 'unread-count') {
          handleUnreadCount(acc.id, event.args[0]);
        }
      });

      // Backup de contagem através da alteração do título da página
      wv.addEventListener('page-title-updated', (event) => {
        const match = event.title.match(/^\((\d+)\)/);
        const count = match && match[1] ? parseInt(match[1], 10) : 0;
        handleUnreadCount(acc.id, count);
      });

      // Aplica status de mudo se configurado
      wv.addEventListener('dom-ready', () => {
        if (acc.muted) {
          wv.setAudioMuted(true);
        }
      });

      webviewsContainerEl.appendChild(wv);
    }
  });

  // Remove webviews de contas que foram excluídas
  const currentWebviews = webviewsContainerEl.querySelectorAll('webview');
  currentWebviews.forEach(wv => {
    const accId = wv.id.replace('wv-', '');
    if (!accounts.some(a => a.id === accId)) {
      wv.remove();
    }
  });
}

// Seleciona e exibe a conta ativa
function selectAccount(accountId) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return;

  activeAccountId = accountId;
  settings.activeAccountId = activeAccountId;
  window.dimisAPI.saveSettings(settings);

  // Atualiza destaque na barra lateral
  document.querySelectorAll('.account-item').forEach(item => {
    if (item.dataset.id === accountId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Atualiza barra superior (Header)
  headerAccountIndicator.style.backgroundColor = account.color || '#25D366';
  if (account.icon && (account.icon.startsWith('data:image') || account.icon.startsWith('http') || account.icon.startsWith('file:') || account.icon.endsWith('.png') || account.icon.endsWith('.jpg'))) {
    headerAccountIndicator.innerHTML = `<img src="${account.icon}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    headerAccountIndicator.style.width = '20px';
    headerAccountIndicator.style.height = '20px';
  } else if (account.icon && account.icon.trim().length > 0) {
    headerAccountIndicator.innerHTML = `<span style="font-size:14px;line-height:1;">${account.icon}</span>`;
    headerAccountIndicator.style.width = 'auto';
    headerAccountIndicator.style.height = 'auto';
    headerAccountIndicator.style.background = 'transparent';
  } else {
    headerAccountIndicator.innerHTML = '';
    headerAccountIndicator.style.width = '10px';
    headerAccountIndicator.style.height = '10px';
  }
  headerAccountName.textContent = account.name;
  
  if (account.badge && account.badge > 0) {
    headerUnreadCount.textContent = `${account.badge} ${account.badge === 1 ? 'nova mensagem' : 'novas mensagens'}`;
    headerUnreadCount.classList.remove('hidden');
  } else {
    headerUnreadCount.classList.add('hidden');
  }

  updateMuteButtonUI(account.muted);

  // Exibição das WebViews
  const isSplit = settings.splitViewEnabled && accounts.length > 1;
  const webviews = webviewsContainerEl.querySelectorAll('webview');

  webviews.forEach(wv => {
    const wvId = wv.id.replace('wv-', '');
    wv.classList.remove('active', 'split-active');

    if (isSplit) {
      if (wvId === activeAccountId) {
        wv.classList.add('active');
      } else if (wvId === splitSecondaryAccountId) {
        wv.classList.add('split-active');
      }
    } else {
      if (wvId === activeAccountId) {
        wv.classList.add('active');
      }
    }
  });
}

// Atualiza contagem de não lidas e notifica sistema
function handleUnreadCount(accountId, count) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return;

  const oldCount = account.badge || 0;
  account.badge = count || 0;

  // Atualiza badge na interface se mudou
  if (oldCount !== account.badge) {
    renderAccounts();

    if (activeAccountId === accountId) {
      if (account.badge > 0) {
        headerUnreadCount.textContent = `${account.badge} novas`;
        headerUnreadCount.classList.remove('hidden');
      } else {
        headerUnreadCount.classList.add('hidden');
      }
    }
  }
}

function updateTotalBadge() {
  const total = accounts.reduce((sum, acc) => sum + (acc.badge || 0), 0);
  window.dimisAPI.updateBadgeTotal(total);
}

function updateMuteButtonUI(isMuted) {
  if (isMuted) {
    labelSound.textContent = 'Som: Silenciado';
    iconSound.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
  } else {
    labelSound.textContent = 'Som: Ativado';
    iconSound.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
  }
}

// Menu de Contexto
function openContextMenu(e, accountId) {
  contextTargetAccountId = accountId;
  const targetAcc = accounts.find(a => a.id === accountId);
  if (!targetAcc) return;

  ctxMuteText.textContent = targetAcc.muted ? 'Ativar Som' : 'Silenciar';

  // Posiciona o menu próximo ao cursor sem vazar da tela
  contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 200)}px`;
  contextMenu.style.left = `${e.clientX + 5}px`;
  contextMenu.classList.remove('hidden');
}

function closeContextMenu() {
  contextMenu.classList.add('hidden');
  contextTargetAccountId = null;
}

// Configuração de Event Listeners
function setupEventListeners() {
  // Fecha menu de contexto ao clicar em qualquer lugar
  window.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
      closeContextMenu();
    }
  });

  // Botão Recarregar no Header
  btnHeaderReload.addEventListener('click', () => {
    const currentWv = document.getElementById(`wv-${activeAccountId}`);
    if (currentWv) currentWv.reload();
  });

  // Botão Silenciar no Header
  btnHeaderMute.addEventListener('click', () => {
    const currentAcc = accounts.find(a => a.id === activeAccountId);
    if (!currentAcc) return;

    currentAcc.muted = !currentAcc.muted;
    const currentWv = document.getElementById(`wv-${activeAccountId}`);
    if (currentWv) currentWv.setAudioMuted(currentAcc.muted);

    updateMuteButtonUI(currentAcc.muted);
    renderAccounts();
    window.dimisAPI.saveAccounts(accounts);
  });

  // Atualiza o preview do avatar no modal
  function updateModalAvatarPreview() {
    const color = inputAccountColor.value || '#25D366';
    const iconData = inputAccountIconData.value || '';
    const name = inputAccountName.value.trim();
    const initial = name.length > 0 ? name.charAt(0).toUpperCase() : 'W';

    accountAvatarPreview.style.backgroundColor = color;

    if (iconData.startsWith('data:image') || iconData.startsWith('http') || iconData.startsWith('file:') || iconData.endsWith('.png') || iconData.endsWith('.jpg')) {
      previewAvatarImg.src = iconData;
      previewAvatarImg.classList.remove('hidden');
      previewAvatarText.textContent = '';
      btnRemoveAvatar.classList.remove('hidden');
      document.querySelectorAll('.preset-icon-btn').forEach(b => b.classList.remove('selected'));
    } else if (iconData.length > 0) {
      previewAvatarImg.classList.add('hidden');
      previewAvatarText.textContent = iconData;
      btnRemoveAvatar.classList.remove('hidden');
      document.querySelectorAll('.preset-icon-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.icon === iconData);
      });
    } else {
      previewAvatarImg.classList.add('hidden');
      previewAvatarText.textContent = initial;
      btnRemoveAvatar.classList.add('hidden');
      document.querySelectorAll('.preset-icon-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.icon === '');
      });
    }
  }

  // Upload de imagem com redimensionamento automático via Canvas
  btnUploadAvatar.addEventListener('click', () => {
    inputAccountIconFile.click();
  });

  inputAccountIconFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensiona para max 128x128px para manter o JSON leve e ultra veloz
        const canvas = document.createElement('canvas');
        const maxDim = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL('image/png', 0.9);
        inputAccountIconData.value = resizedBase64;
        updateModalAvatarPreview();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  btnRemoveAvatar.addEventListener('click', () => {
    inputAccountIconData.value = '';
    inputAccountIconFile.value = '';
    updateModalAvatarPreview();
  });

  // Presets de Ícones Rápidos
  document.querySelectorAll('.preset-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      inputAccountIconData.value = btn.dataset.icon;
      inputAccountIconFile.value = '';
      updateModalAvatarPreview();
    });
  });

  // Atualiza preview ao digitar o nome
  inputAccountName.addEventListener('input', () => {
    const iconData = inputAccountIconData.value || '';
    if (!iconData.startsWith('data:image')) {
      updateModalAvatarPreview();
    }
  });

  // Alternar Split View
  btnSplitToggle.addEventListener('click', () => {
    if (accounts.length < 2) {
      alert('Para usar a visualização dividida, adicione pelo menos duas contas!');
      return;
    }

    settings.splitViewEnabled = !settings.splitViewEnabled;
    if (settings.splitViewEnabled) {
      btnSplitToggle.classList.add('active-mode');
      webviewsContainerEl.classList.add('split-mode');
      // Define a segunda conta como uma conta diferente da ativa
      splitSecondaryAccountId = accounts.find(a => a.id !== activeAccountId)?.id;
      settings.splitSecondaryAccountId = splitSecondaryAccountId;
    } else {
      btnSplitToggle.classList.remove('active-mode');
      webviewsContainerEl.classList.remove('split-mode');
    }

    window.dimisAPI.saveSettings(settings);
    selectAccount(activeAccountId);
  });

  // Abrir Modal de Adicionar Conta
  btnAddAccount.addEventListener('click', () => {
    editingAccountId = null;
    modalAccountTitle.textContent = 'Adicionar Novo WhatsApp';
    inputAccountName.value = `WhatsApp ${accounts.length + 1}`;
    inputAccountIconData.value = '';
    inputAccountIconFile.value = '';
    selectColorOption('#25D366');
    updateModalAvatarPreview();
    modalAccount.classList.remove('hidden');
    inputAccountName.focus();
  });

  // Fechar Modal Conta
  btnCloseAccountModal.addEventListener('click', () => modalAccount.classList.add('hidden'));
  btnCancelAccountModal.addEventListener('click', () => modalAccount.classList.add('hidden'));

  // Salvar Conta (Nova ou Editada)
  btnSaveAccountModal.addEventListener('click', () => {
    const name = inputAccountName.value.trim() || `WhatsApp ${accounts.length + 1}`;
    const color = inputAccountColor.value || '#25D366';
    const icon = inputAccountIconData.value || '';

    if (editingAccountId) {
      // Edição
      const acc = accounts.find(a => a.id === editingAccountId);
      if (acc) {
        acc.name = name;
        acc.color = color;
        acc.icon = icon;
      }
    } else {
      // Nova Conta
      const newAcc = {
        id: `acc_${Date.now()}`,
        name: name,
        color: color,
        icon: icon,
        badge: 0,
        muted: false,
        createdAt: Date.now()
      };
      accounts.push(newAcc);
      activeAccountId = newAcc.id;
    }

    window.dimisAPI.saveAccounts(accounts);
    modalAccount.classList.add('hidden');
    renderAccounts();
    renderWebviews();
    selectAccount(activeAccountId);
  });

  // Seleção de cor no color picker
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectColorOption(btn.dataset.color);
    });
  });

  function selectColorOption(color) {
    document.querySelectorAll('.color-option').forEach(b => {
      b.classList.toggle('selected', b.dataset.color === color);
    });
    inputAccountColor.value = color;
    updateModalAvatarPreview();
  }

  // Modal Configurações
  btnSettings.addEventListener('click', () => {
    modalSettings.classList.remove('hidden');
  });

  btnCloseSettingsModal.addEventListener('click', () => modalSettings.classList.add('hidden'));
  btnSaveSettings.addEventListener('click', () => {
    settings.closeToTray = settingCloseTray.checked;
    settings.enableNotifications = settingNotifications.checked;
    window.dimisAPI.saveSettings(settings);
    modalSettings.classList.add('hidden');
  });

  // Modal Doação Pix
  btnDonate.addEventListener('click', () => {
    modalDonate.classList.remove('hidden');
  });

  btnCloseDonateModal.addEventListener('click', () => modalDonate.classList.add('hidden'));
  btnDismissDonate.addEventListener('click', () => modalDonate.classList.add('hidden'));

  btnCopyPix.addEventListener('click', async () => {
    const pixKey = inputPixKey.value;
    try {
      await navigator.clipboard.writeText(pixKey);
      textCopyPix.textContent = 'Copiado! ✓';
      btnCopyPix.style.backgroundColor = '#1da851';
      setTimeout(() => {
        textCopyPix.textContent = 'Copiar';
        btnCopyPix.style.backgroundColor = '';
      }, 2500);
    } catch (err) {
      inputPixKey.select();
      document.execCommand('copy');
      textCopyPix.textContent = 'Copiado! ✓';
      setTimeout(() => {
        textCopyPix.textContent = 'Copiar';
      }, 2500);
    }
  });

  // Ações do Menu de Contexto
  ctxReload.addEventListener('click', () => {
    if (!contextTargetAccountId) return;
    const wv = document.getElementById(`wv-${contextTargetAccountId}`);
    if (wv) wv.reload();
    closeContextMenu();
  });

  ctxEdit.addEventListener('click', () => {
    if (!contextTargetAccountId) return;
    const acc = accounts.find(a => a.id === contextTargetAccountId);
    if (!acc) return;

    editingAccountId = acc.id;
    modalAccountTitle.textContent = 'Editar Conta';
    inputAccountName.value = acc.name;
    inputAccountIconData.value = acc.icon || '';
    inputAccountIconFile.value = '';
    selectColorOption(acc.color || '#25D366');
    updateModalAvatarPreview();
    modalAccount.classList.remove('hidden');
    inputAccountName.focus();
    closeContextMenu();
  });

  ctxMute.addEventListener('click', () => {
    if (!contextTargetAccountId) return;
    const acc = accounts.find(a => a.id === contextTargetAccountId);
    if (!acc) return;

    acc.muted = !acc.muted;
    const wv = document.getElementById(`wv-${acc.id}`);
    if (wv) wv.setAudioMuted(acc.muted);

    if (acc.id === activeAccountId) {
      updateMuteButtonUI(acc.muted);
    }
    renderAccounts();
    window.dimisAPI.saveAccounts(accounts);
    closeContextMenu();
  });

  ctxClear.addEventListener('click', async () => {
    if (!contextTargetAccountId) return;
    const acc = accounts.find(a => a.id === contextTargetAccountId);
    if (!acc) return;

    if (confirm(`Deseja realmente desconectar e limpar a sessão de "${acc.name}"? Você precisará ler o QR Code novamente.`)) {
      await window.dimisAPI.clearAccountSession(acc.id);
      const wv = document.getElementById(`wv-${acc.id}`);
      if (wv) wv.reload();
    }
    closeContextMenu();
  });

  ctxDelete.addEventListener('click', async () => {
    if (!contextTargetAccountId) return;
    const acc = accounts.find(a => a.id === contextTargetAccountId);
    if (!acc) return;

    if (accounts.length <= 1) {
      alert('Você precisa manter pelo menos uma conta no dimis.');
      closeContextMenu();
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a conta "${acc.name}"?`)) {
      await window.dimisAPI.clearAccountSession(acc.id);
      accounts = accounts.filter(a => a.id !== contextTargetAccountId);

      if (activeAccountId === contextTargetAccountId) {
        activeAccountId = accounts[0].id;
      }
      if (splitSecondaryAccountId === contextTargetAccountId) {
        splitSecondaryAccountId = accounts.find(a => a.id !== activeAccountId)?.id;
      }

      window.dimisAPI.saveAccounts(accounts);
      renderAccounts();
      renderWebviews();
      selectAccount(activeAccountId);
    }
    closeContextMenu();
  });

  // Atalhos de Teclado Globais (Ctrl+1 a Ctrl+9, Ctrl+N, Ctrl+R, etc.)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      // Ctrl+1 a Ctrl+9
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= accounts.length) {
        e.preventDefault();
        selectAccount(accounts[num - 1].id);
        return;
      }

      // Ctrl+N: Nova conta
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        btnAddAccount.click();
        return;
      }

      // Ctrl+R: Recarregar conta ativa
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        btnHeaderReload.click();
        return;
      }
    }
  });
}

// Inicia a aplicação
window.addEventListener('DOMContentLoaded', init);
