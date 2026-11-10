# dimis - Multi WhatsApp para Windows, Mac e Linux

O **dimis** é um aplicativo desktop ultra-leve projetado especificamente para gerenciar múltiplos números do WhatsApp no mesmo computador, conectando através do WhatsApp Web com sessões completamente isoladas e persistentes.

Inspirado no visual prático do Franz, porém **sem o peso de 50 outras plataformas**, sem exigência de criar conta ou login na nuvem, sem rastreadores e com inicialização quase instantânea.

---

## Principais Funcionalidades

- **Multiplataforma Nativo**: Suporte completo para **Windows 10/11**, **macOS (Apple Silicon M1/M2/M3/M4 & Intel)** e **Linux (AppImage & .deb)**.
- **Múltiplas Contas Simultâneas**: Conecte quantos números do WhatsApp desejar. Cada conta tem sua própria sessão isolada (cookies, IndexedDB, cache e localStorage separados).
- **Sessões Persistentes**: Você só lê o QR Code uma vez por conta. Ao fechar e reabrir o app, todas continuam conectadas.
- **Barra Lateral Estilo Franz com Imagens e Ícones Personalizados**: Menu lateral limpo para alternar entre contas com um clique. Você pode carregar sua própria **imagem/foto/logo**, escolher **ícones rápidos temáticos** (💼 Comercial, 🎧 Suporte, 🛒 Vendas, 💬 Chat, ⭐ VIP, etc.) ou usar iniciais com cores customizáveis.
- **Contador de Mensagens Não Lidas (Badges)**: Notificação visual em tempo real (bolinhas vermelhas com a quantidade de mensagens pendentes em cada conta, na barra de tarefas do Windows e no Dock do macOS).
- **Split View (Tela Dividida)**: Trabalhe com **duas contas lado a lado** na mesma tela. Ideal para quem faz atendimento e vendas ao mesmo tempo.
- **Bandeja do Sistema (System Tray / Menu Bar)**: Permanece rodando em segundo plano ao fechar a janela, recebendo mensagens e áudios sem perder nada.
- **Menu de Contexto Completo (Botão Direito)**:
  - Recarregar página
  - Renomear e alterar cor
  - Silenciar notificações sonoras
  - Desconectar / Limpar sessão (para ler um novo QR Code)
  - Excluir conta
- **Atalhos de Teclado Nativos**:
  - `Ctrl + 1` / `Cmd + 1`, `Ctrl + 2` / `Cmd + 2`...: Alterna direto para a conta
  - `Ctrl + N` / `Cmd + N`: Abre modal para cadastrar novo número/conta
  - `Ctrl + R` / `Cmd + R`: Recarrega o WhatsApp ativo
- **Suporte Total a Áudios e Notificações**: Microfone liberado nativamente para gravação e envio de áudios no WhatsApp Web.

---

## Como Iniciar o Aplicativo

### Opção 1: Pelo arquivo executável rápido (Windows)
Basta dar dois cliques no arquivo:
```
c:\Dimitri\dimis\iniciar-dimis.bat
```

### Opção 2: Pelo Terminal / Prompt de Comando
Na pasta do projeto (`c:\Dimitri\dimis`), execute:
```bash
npm start
```

---

## Compilação e Geração de Instaladores

O projeto está configurado com `electron-builder` e compilação automatizada na nuvem via **GitHub Actions** (`.github/workflows/build.yml`):

- **Windows**: `npm run dist:win` (Gera `dimis Setup 1.0.0.exe` e `dimis 1.0.0.exe` portátil)
- **macOS**: `npm run dist:mac` (Gera `.dmg` e `.zip` para Intel e Apple Silicon)
- **Linux**: `npm run dist:linux` (Gera `.AppImage` e `.deb`)
- **Todos os sistemas**: `npm run dist:all`

---

## Criar Atalho na Área de Trabalho (Windows)

Para colocar um atalho com o ícone do **dimis** na sua Área de Trabalho:
1. Abra o PowerShell ou clique com o botão direito no arquivo `Criar-Atalho-Area-de-Trabalho.ps1` e selecione **"Executar com o PowerShell"**.

---

## Estrutura do Projeto

```
c:\Dimitri\dimis/
├── .github/workflows/
│   └── build.yml                # CI/CD multi-plataforma (Windows, macOS e Linux)
├── assets/
│   ├── icon.png                 # Ícone base de alta resolução (512x512)
│   ├── icon.ico                 # Ícone Windows
│   ├── icon.icns                # Ícone macOS
│   └── pix-qrcode.png           # QR Code oficial Pix
├── website/                     # Site oficial publicado no Cloudflare Pages
│   ├── index.html
│   ├── style.css
│   └── _redirects
├── main.js                      # Processo principal (janelas, partições, tray e dock)
├── preload.js                   # Ponte segura de IPC
├── webview-preload.js           # Extração de não lidas via MutationObserver
├── index.html                   # Interface desktop estilo Franz
├── styles.css                   # Tema escuro elegante
├── renderer.js                  # Lógica de abas, contas, split view e atalhos
└── package.json                 # Configurações de empacotamento
```
