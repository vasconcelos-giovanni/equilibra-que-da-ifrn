# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.3.1] - 2026-03-12

### Added

- **Componente `SyncButton`:** Novo componente `components/SyncButton.vue` que encapsula o ciclo completo de sincronização manual (download → merge → upload) com feedback visual via `v-tooltip` e `v-snackbar` de sucesso.
- **Toolbar Sync:** O `SyncButton` é exibido na `v-app-bar` quando o usuário está conectado ao Google Drive, permitindo sincronização rápida sem navegar para Configurações.

### Changed

- **`pages/configuracoes.vue`:** O botão "Sincronizar Agora" foi substituído pelo componente `<SyncButton />`. Removidos `handleSyncNow`, `syncSuccessMessage`, e as importações de `uploadData`/`downloadAndMerge` que ficaram órfãs.

### Refactor

- **Lógica de sync manual centralizada** no componente dedicado, eliminando duplicação entre o layout e a página de configurações.

## [1.3.0] - 2026-03-11

### Added

- **Sincronização Cloud com Google Drive:** Integração nativa com a Google Drive REST API v3 via `composables/useSync.ts`, usando Google Identity Services (GIS) para autenticação OAuth 2.0 com popup. Sincronização automática e manual, armazenamento isolado na `appDataFolder` do Google Drive do próprio aluno.
- **Backend nativo Google Drive (GIS):** Substituição completa da biblioteca `remotestoragejs` pela **Google Drive REST API v3** com autenticação via **Google Identity Services (GIS)**. O usuário usa seu Gmail diretamente, sem criar conta adicional. O escopo é `drive.appdata` — acesso restrito à pasta oculta do aplicativo, sem tocar nos arquivos pessoais.
- **Página de Configurações (`/configuracoes`):** Nova página dedicada com seções de sincronização (no topo), metas de estudo, backup de dados e tutorial — substituindo a navegação exclusiva via modal.
- **Botão de Sincronização Manual (`mdiCloudSync`):** Posicionado no topo da página de Configurações para acionar o ciclo completo de download → merge → upload sob demanda.
- **Toggle de Sincronização Automática (`v-switch`):** Disponível tanto na página de Configurações quanto no modal de ajustes rápidos. Utiliza debounce de 5 segundos para evitar uploads em rajada.
- **Status de Conexão:** Chip de estado (Conectado / Desconectado) e exibição do provedor (RemoteStorage, Dropbox, Google Drive) diretamente na página de Configurações.
- **Plugin `syncStudy.client.ts`:** Inicializa o RemoteStorage no carregamento da aplicação (permitindo auto-reconexão de sessões OAuth anteriores) e subscreve às mutações do Pinia para disparar uploads com debounce.
- **Modal de Configurações Rápidas fullscreen no mobile:** O modal existente em `layouts/default.vue` agora ocupa a tela inteira em dispositivos `smAndDown`.

### Changed

- **Navegação — item "Configurações":** O item do drawer que abria o modal agora navega para a página `/configuracoes`, tornando a experiência de configuração mais completa e consistente.
- **Drawer compartilhado via `useState`:** A ref de abertura do drawer foi migrada para `useState('drawer-open')`, permitindo que a página de Configurações acione o tour de onboarding sem prop-drilling.

### Architecture

- **Offline-First com Persistência em Nuvem Descentralizada:** O `localStorage` continua sendo a fonte da verdade primária. O remoteStorage é uma camada de sincronização opcional que falha silenciosamente sem impactar a experiência local.
- **Merge de Sessões por ID:** A função `_mergeSessions` realiza uma união dos conjuntos local e remoto, preservando dados exclusivos de cada origem e priorizando a versão local em caso de conflito de ID.
- **Soberania de Dados (LGPD):** O usuário escolhe o provedor; nenhum dado transita por infraestrutura do projeto. A conexão é completamente opcional.
- **Debouncing de 5 s:** Otimização de banda — múltiplas edições em sequência resultam em um único upload ao servidor remoto.

### Fixed

- **Timeout de 15 s no handshake OAuth (`useSync.ts`):** Adicionado `setTimeout` de 15 segundos na função `connect()` para evitar travamento infinito do estado de carregamento ao tentar conectar (popup bloqueado, rede indisponível, domínio incompatible). O timer é cancelado automaticamente quando o evento `connected` ou `error` do RemoteStorage dispara.
- **Reset de `isConnecting` no evento `error`:** O estado de carregamento do botão de conexão agora é sempre resetado quando o provider retorna um erro, eliminando o spinner infinito em falhas síncronas e assíncronas.

### UX

- **Linguagem de onboarding simplificada:** O campo de endereço e o fluxo de conexão da página de Configurações foram reformulados para usuários não-técnicos, com aviso explícito de que e-mails comuns (Gmail/Hotmail) são incompatíveis.
- **Link de suporte para registro no 5apps:** Adicionado botão de destaque com ícone `mdiOpenInNew` e link direto para criação de conta gratuita em `https://5apps.com/storage/signup`, exibido abaixo do campo de endereço quando o usuário está desconectado.
- **Aviso de privacidade contextual:** Incluído `v-alert` com linguagem acolhedora sobre privacidade e portabilidade dos dados antes do formulário de conexão, sem uso de termos técnicos.

## [1.2.0] - 2026-03-11

### Added

- **Duplicação de Sessões:** Nova funcionalidade que permite copiar uma sessão existente (mantendo a matéria e questões, mas resetando a data para hoje) para agilizar registros recorrentes.
- **Edição via Modais:** O histórico agora permite editar registros diretamente em um `v-dialog`, eliminando a troca de página e melhorando a fluidez da UX.
- **Tooltips** para os **botões de ação** do histórico, aumentando a acessibilidade e clareza das funcionalidades.
- Cor vermelha para o **botão de limpar dados da sessão** de estudo, melhorando a visibilidade e o feedback visual.
- **Outlined para o botão de cancelar** edição, reforçando a hierarquia visual.

### Refactor

- **Componentização do Formulário:** Extração da lógica de registro de `pages/registrar.vue` para um novo componente reutilizável `components/SessionForm.vue`.
- **Aprimoramento de Responsividade:** Implementação de modais fullscreen (`smAndDown`) para garantir uma experiência de edição confortável em dispositivos móveis.
- **Arquitetura Desacoplada:** Simplificação das páginas para atuarem como containers, delegando a lógica de negócio ao componente de formulário.

## [1.1.0] - 2026-03-10

### Added

- **Novo Sistema de Backup:** Implementação de exportação e importação via JSON com validação de integridade via Zod (`LocalStorageSchema`).
- **Onboarding Interativo:** Adição do tour de boas-vindas utilizando a biblioteca `driver.js` e o novo composable `useOnboarding.ts`.
- **Lógica de Erro Zero:** Refatoração do `SessionSchema` com `.superRefine()` para garantir a consistência pedagógica entre questões erradas e motivos de erro.
- **Ajuda de Backup:** Nova página `/ajuda-backup` com guia detalhado e FAQ sobre a persistência de dados.
- **Automação de Release:** Novo script `scripts/release.sh` para gestão de versões SemVer e tags Git.
- Transformar aplicação em **PWA**.

### Changed

- **Analytics:** Gráficos de "Motivos de Erro" agora filtram entradas nulas, focando em feedbacks acionáveis.
- **Tree-shaking de Ícones:** Migração completa para `@mdi/js` em todos os componentes para reduzir o bundle size.
- **Tema enemDark:** Estilização customizada do tour de onboarding integrada ao tema escuro.

### Fixed

- **Consistência de Dados:** Garantia de que a store Pinia limpa o motivo de erro se o número de erros for alterado para zero.
- **Acessibilidade do Menu:** IDs fixos adicionados aos itens de navegação para facilitar a ancoragem de elementos dinâmicos.
