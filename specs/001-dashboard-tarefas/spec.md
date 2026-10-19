# Feature Specification: Dashboard de Tarefas (frontend)

**Feature Branch**: `001-dashboard-tarefas` | **Created**: 2026-09-20 | **Status**: Implementada

**Input**: descrição do usuário — dashboard moderno em tela cheia (sidebar + área central), lista em
formato de cartões/linhas (não Kanban), login próprio com cadastro na mesma tela, Keycloak como
identidade, comunicação entre os containers do front e do back.

## Contexto e Escopo

Interface web da API de tarefas (`task-backend`). Todo dado vem da API via BFF; o frontend não guarda
tarefas localmente. Fora do escopo: temas, i18n além do pt-BR, notificações, PWA.

## Clarifications

### Session 2026-09-20

- Login: formulário próprio (usuário/senha) → Keycloak via servidor Next. Cadastro na **mesma tela**
  (aba "Criar conta") → `POST /api/v1/usuarios` da API → login automático.
- UI: Tailwind + shadcn/ui. Governança: constituição própria; cobertura mínima 90 %.

## User Scenarios & Testing *(mandatory)*

### US1 - Entrar e criar conta (P1)
Visitante acessa `/login`: aba **Entrar** (usuário, senha) e aba **Criar conta** (nome, sobrenome,
e-mail, usuário, senha, confirmar senha). Erros em português; após criar conta entra automaticamente.
**Cenários**: credenciais válidas → dashboard; inválidas → "Usuário ou senha inválidos."; cadastro
duplicado → mensagem do `ProblemDetail` (409); rota protegida sem sessão → redireciona a `/login`.

### US2 - Ver o dashboard (P1)
Sidebar: filtros rápidos **Todas / Abertas / Concluídas**, indicador "Total a gastar neste mês:
R$ X", nome do usuário e botão Sair. Header: busca (ignora acentos/caixa — feita pela API) e botão
destacado **+ Nova Tarefa**. Área central: lista de tarefas ordenada por posição, cada linha com alça
⋮⋮, tag de prioridade colorida, descrição, data de abertura, prazo com ícone de calendário (vermelho se
atrasada), valor em destaque se > 0 (discreto/vazio se zero), ações rápidas (topo, final, concluir/
reabrir, editar, excluir). Estados vazio/carregando/erro.

### US3 - Criar e editar (P1)
Drawer (Sheet à direita) com formulário unificado (descrição, prioridade, prazo, valor). Em edição,
aba **Histórico** exibindo a linha do tempo (`descricao` pronta vinda da API). Validações zod
espelham as da API.

### US4 - Reordenar (P2)
Arrastar pela alça ⋮⋮ (dnd-kit) → `PATCH /mover {destino: POSICAO, posicao}`; botões "Mover para o
topo"/"Mover para o final" → `TOPO`/`FINAL`. Atualização otimista com rollback em erro.

### US5 - Concluir/reabrir e excluir (P2)
Concluir/reabrir na própria linha. Excluir abre **Popover** de confirmação ao lado da lixeira.

### Edge Cases
Token expirado durante uso → refresh silencioso; refresh falho → login. API indisponível → alerta
com botão "Tentar novamente". Lista vazia → mensagem convidando a criar a primeira tarefa.

## Requirements *(mandatory)*

- **FR-001** Página `/login` com abas Entrar/Criar conta e mensagens em português.
- **FR-002** Sessão via Auth.js (Credentials); tokens só no servidor (cookie httpOnly).
- **FR-003** BFF `/api/backend/*` repassa ao backend com Bearer; 401 do backend → encerra sessão.
- **FR-004** `/api/cadastro` chama `POST {API_URL}/api/v1/usuarios` e devolve o `ProblemDetail` em erro.
- **FR-005** Dashboard com sidebar (filtros, indicador financeiro, usuário, sair), header (busca,
  nova tarefa) e lista conforme regras visuais da constituição (Princípio V).
- **FR-006** Drawer unificado criar/editar com aba Histórico em edição.
- **FR-007** Reordenação por arrastar e por botões topo/final; concluir/reabrir; excluir com popover.
- **FR-008** Dockerfile + compose na rede externa `tarefas-rede`; variáveis de ambiente para URLs.

## Success Criteria *(mandatory)*

- **SC-001** Fluxo completo (criar conta → entrar → criar, editar, mover, concluir, excluir) funciona
  com backend e frontend em containers separados.
- **SC-002** Nenhum access token chega ao navegador (verificável nas respostas do `/api/auth/session`).
- **SC-003** Cobertura ≥ 90 %; `lint` e `build` sem erros.
