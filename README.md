# dimis - Multi WhatsApp para Windows

O **dimis** é um aplicativo desktop ultra-leve projetado especificamente para gerenciar múltiplos números do WhatsApp no mesmo computador, conectando através do WhatsApp Web com sessões completamente isoladas e persistentes.

Inspirado no visual prático do Franz, porém **sem o peso de 50 outras plataformas**, sem exigência de criar conta ou login na nuvem, sem rastreadores e com inicialização quase instantânea.

---

## Principais Funcionalidades

- **Múltiplas Contas Simultâneas**: Conecte quantos números do WhatsApp desejar. Cada conta tem sua própria sessão isolada (cookies, IndexedDB, cache e localStorage separados).
- **Sessões Persistentes**: Você só lê o QR Code uma vez por conta. Ao fechar e reabrir o app, todas continuam conectadas.
- **Barra Lateral Estilo Franz com Imagens e Ícones Personalizados**: Menu lateral limpo para alternar entre contas com um clique. Você pode carregar sua própria **imagem/foto/logo**, escolher **ícones rápidos temáticos** (💼 Comercial, 🎧 Suporte, 🛒 Vendas, 💬 Chat, ⭐ VIP, etc.) ou usar iniciais com cores customizáveis.
- **Contador de Mensagens Não Lidas (Badges)**: Notificação visual em tempo real (bolinhas vermelhas com a quantidade de mensagens pendentes em cada conta e na barra de tarefas do Windows).
- **Split View (Tela Dividida)**: Trabalhe com **duas contas lado a lado** na mesma tela. Ideal para quem faz atendimento e vendas ao mesmo tempo.
- **Bandeja do Windows (System Tray)**: Permanece rodando em segundo plano ao fechar a janela, recebendo mensagens e áudios sem perder nada.
- **Menu de Contexto Completo (Botão Direito)**:
  - Recarregar página
  - Renomear e alterar cor
  - Silenciar notificações sonoras
  - Desconectar / Limpar sessão (para ler um novo QR Code)
  - Excluir conta
- **Atalhos de Teclado**:
  - `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3`...: Alterna direto para a conta
  - `Ctrl + N`: Abre modal para cadastrar novo número/conta
  - `Ctrl + R`: Recarrega o WhatsApp ativo
- **Suporte Total a Áudios e Notificações**: Microfone liberado nativamente para gravação e envio de áudios no WhatsApp Web.

---

## Como Iniciar o Aplicativo

### Opção 1: Pelo arquivo executável rápido
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

## Criar Atalho na Área de Trabalho

Para colocar um atalho com o ícone do **dimis** na sua Área de Trabalho:
1. Abra o PowerShell ou clique com o botão direito no arquivo `Criar-Atalho-Area-de-Trabalho.ps1` e selecione **"Executar com o PowerShell"**.

---

## Estrutura do Projeto

```
c:\Dimitri\dimis/
├── assets/
│   ├── icon.png                 # Ícone do aplicativo
│   └── icon.ico                 # Ícone para executáveis e atalhos Windows
├── main.js                      # Processo principal (gerenciamento de janelas, sessões e tray)
├── preload.js                   # Ponte segura de IPC entre o sistema e a interface
├── webview-preload.js           # Script injetado para ler mensagens não lidas do WhatsApp
├── index.html                   # Interface do app (barra lateral estilo Franz e área de chat)
├── styles.css                   # Tema escuro moderno WhatsApp
├── renderer.js                  # Lógica de abas, contas, split view e eventos
├── iniciar-dimis.bat             # Inicializador direto de dois cliques
├── Criar-Atalho-Area-de-Trabalho.ps1 # Script para criar atalho na Área de Trabalho
└── package.json                 # Configurações e dependências
```
