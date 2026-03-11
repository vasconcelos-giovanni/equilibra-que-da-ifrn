# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
