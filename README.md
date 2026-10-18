# Task Frontend — Dashboard de Tarefas

Interface web da API de tarefas ([`../task-backend`](../task-backend)): dashboard em tela cheia com barra
lateral (filtros rápidos e indicador financeiro), cabeçalho (busca e **+ Nova Tarefa**) e lista de
tarefas com arrastar-e-soltar, drawer unificado de criação/edição com aba **Histórico** e exclusão
segura por popover. Login e cadastro de conta na mesma tela; a identidade fica no Keycloak.

> Documentação de projeto: [constituição](.specify/memory/constitution.md) ·
> [especificação](specs/001-dashboard-tarefas/spec.md) · [plano](specs/001-dashboard-tarefas/plan.md)

## Stack

Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS 4 + shadcn/ui · Auth.js v5 ·
TanStack Query · react-hook-form + zod · dnd-kit · Vitest + Testing Library (cobertura ≥ 90 %) · Docker.

## Como funciona a autenticação

```
navegador ──(usuário/senha)──▶ Next.js (Auth.js Credentials) ──▶ Keycloak  (rede interna: http://keycloak:8080)
navegador ◀── cookie httpOnly com JWT criptografado (access/refresh token ficam SÓ no servidor)
navegador ──▶ /api/backend/v1/tarefas ──(Bearer)──▶ API Java  (rede interna: http://task-backend:8080)
```

- **Cadastro**: a aba "Criar conta" chama `/api/cadastro` → `POST /api/v1/usuarios` da API → Keycloak.
  O novo usuário já entra automaticamente.
- **Sessão**: renovação silenciosa com o refresh token; se falhar, volta ao login.
- O navegador nunca recebe o access token (confira em `/api/auth/session`) nem fala com a API diretamente.

## Subindo com Docker (backend primeiro)

```bash
# 1) Backend + Keycloak — cria a rede compartilhada "tarefas-rede"
cd ../task-backend && APP_PORTA=8081 docker compose up -d --build

# 2) Frontend — entra na mesma rede e fala com "task-backend:8080" e "keycloak:8080"
cd ../task-frontend && docker compose up -d --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 (login em `/login`) |
| API / Swagger | http://localhost:8081/swagger-ui.html |
| Keycloak (admin / admin) | http://localhost:8180 |

Usuários de desenvolvimento: `ana` e `bruno` (senha `senha123`) — ou crie o seu na aba "Criar conta".
Porta do host configurável: `WEB_PORTA=3001 docker compose up -d`. Em produção defina `AUTH_SECRET`.

## Desenvolvimento local

### Pelo VS Code (tudo em sequência)

Abra o workspace `C:\Ambiente\tarefas.code-workspace` e, em *Run and Debug*, execute
**"Tudo local em sequência: Keycloak → API → Front"**. A ordem é garantida pelas tarefas prévias:

1. `api: preparar ambiente local` — remove o container da API (libera 8081 e o H2) e sobe o Keycloak com `--wait`;
2. a API Java inicia (perfil `dev`, porta 8081);
3. `front: preparar ambiente local` — remove o container do front, confere que a 3000 está livre e
   **espera a API responder** em `/actuator/health` (`scripts/aguardar-api.mjs`);
4. só então o `next dev` sobe em http://localhost:3000.

### Pela linha de comando

```bash
cp .env.example .env.local     # ajuste API_URL (ex.: http://localhost:8081) e KEYCLOAK_URL_INTERNO (http://localhost:8180)
npm install
npm run dev                    # http://localhost:3000
```

Requer o backend e o Keycloak no ar (via Docker Compose do `task-backend`).

## Qualidade

```bash
npm run lint             # ESLint (config Next)
npm run test             # Vitest
npm run test:cobertura   # falha abaixo de 90 % (linhas, ramos, funções) — relatório em coverage/
npm run build            # build de produção (standalone)
```

## Estrutura

```
src/
├── app/                      # rotas: /, /login, /api/auth, /api/cadastro, /api/backend/[...caminho]
├── proxy.ts                  # protege rotas (Next 16 "proxy", antigo middleware)
├── auth.ts                   # Auth.js: Credentials → Keycloak; refresh no callback jwt
├── componentes/Provedores.tsx
├── funcionalidades/
│   ├── autenticacao/         # esquemas zod, cliente Keycloak (servidor), sessão, formulários
│   └── tarefas/              # api (via BFF), hooks, formatadores, ordenação otimista, componentes do dashboard
├── lib/                      # bff.ts, erros.ts (ProblemDetail), sessao-servidor.ts, utils.ts
├── tipos/api.ts              # espelho do contrato OpenAPI do backend
└── components/ui/            # primitivos shadcn/ui (gerados)
```
