let ipcRenderer = null;
try {
  ipcRenderer = require('electron').ipcRenderer;
} catch (e) {
  // context isolation ou sandbox ativo
}

// Observador para extrair contagem de mensagens não lidas do WhatsApp Web
function extractUnreadCount() {
  let count = 0;

  // 1. Método mais confiável e estável: ler o título da página "(X) WhatsApp"
  const titleMatch = document.title.match(/^\((\d+)\)/);
  if (titleMatch && titleMatch[1]) {
    count = parseInt(titleMatch[1], 10) || 0;
  } else {
    // 2. Método secundário: verificar badges no DOM se o título não tiver número
    const unreadBadges = document.querySelectorAll('span[aria-label*="não lida"], span[aria-label*="unread"]');
    if (unreadBadges.length > 0) {
      unreadBadges.forEach(badge => {
        const num = parseInt(badge.textContent.trim(), 10);
        if (!isNaN(num)) count += num;
      });
    }
  }

  if (ipcRenderer) {
    try {
      ipcRenderer.sendToHost('unread-count', count);
    } catch (err) {}
  }
}

// Inicia monitoramento após o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  // Observa alterações no elemento <title>
  const titleElement = document.querySelector('title');
  if (titleElement) {
    const observer = new MutationObserver(() => {
      extractUnreadCount();
    });
    observer.observe(titleElement, { childList: true, subtree: true, characterData: true });
  }

  // Polling leve a cada 3 segundos como redundância
  setInterval(extractUnreadCount, 3000);
});

// Envia contagem inicial
window.addEventListener('load', () => {
  setTimeout(extractUnreadCount, 1500);
});
