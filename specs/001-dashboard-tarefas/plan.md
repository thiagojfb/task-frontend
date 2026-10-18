# Implementation Plan: Dashboard de Tarefas (frontend)

**Branch**: `001-dashboard-tarefas` | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

## Summary

Next.js 16 (App Router, TS) com Tailwind 4 + shadcn/ui. Autenticação com Auth.js v5 (Credentials →
password grant no Keycloak pela rede interna; refresh no callback `jwt`). BFF em route handlers repassa
chamadas ao backend (`API_URL`) com Bearer. TanStack Query para dados; react-hook-form + zod nos
formulários; dnd-kit para arrastar. Docker multi-stage `standalone`; compose na rede `tarefas-rede`.

## Technical Context

**Language**: TypeScript 5 estrito / React 19 / Next 16.3 · **UI**: Tailwind 4, shadcn (radix-nova) ·
**Auth**: next-auth 5 beta · **Dados**: @tanstack/react-query · **DnD**: @dnd-kit · **Testes**:
Vitest 5 + Testing Library + jsdom, cobertura v8 ≥ 90 % · **Node**: 24 local / 22 no container.

Variáveis: `AUTH_SECRET`, `AUTH_URL` (`http://localhost:3000`), `API_URL`
(`http://task-backend:8080`), `KEYCLOAK_URL_INTERNO` (`http://keycloak:8080`),
`KEYCLOAK_REALM` (`tarefas`), `KEYCLOAK_CLIENT_ID` (`tarefas-frontend`).

## Constitution Check

| # | Portão | Status |
|---|--------|--------|
| I | App Router + BFF; domínio em `src/funcionalidades/{autenticacao,tarefas}` | ✅ |
| II | Português em código, textos e testes | ✅ |
| III | Vitest ≥ 90 % com exclusões declaradas em `vitest.config.ts` | ✅ |
| IV | Tokens só na sessão JWT httpOnly; middleware; cadastro via API | ✅ |
| V | shadcn/Radix; regras visuais implementadas em `LinhaTarefa`/`TagPrioridade` | ✅ |
| VI | `src/tipos/api.ts` espelha o contrato OpenAPI | ✅ |
| VII | Dockerfile standalone não-root + compose com rede externa | ✅ |

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx                      # fontes, Toaster, Provedores
│   ├── page.tsx                        # dashboard (protegido)
│   ├── login/page.tsx                  # abas Entrar / Criar conta
│   └── api/
│       ├── auth/[...nextauth]/route.ts # Auth.js
│       ├── cadastro/route.ts           # → POST {API_URL}/api/v1/usuarios
│       └── backend/[...caminho]/route.ts # BFF com Bearer
├── middleware.ts                       # protege rotas
├── auth.ts                             # config Auth.js (Credentials + refresh)
├── componentes/Provedores.tsx          # SessionProvider + QueryClientProvider
├── funcionalidades/
│   ├── autenticacao/
│   │   ├── esquemas.ts                 # zod: login e cadastro
│   │   ├── keycloak.ts                 # password grant / refresh (servidor)
│   │   ├── FormularioLogin.tsx
│   │   └── FormularioCadastro.tsx
│   └── tarefas/
│       ├── api.ts                      # fetch tipado via /api/backend
│       ├── esquemas.ts                 # zod do formulário de tarefa
│       ├── formatadores.ts             # moeda, datas, rótulos
│       ├── hooks.ts                    # useTarefas, useResumo, mutações
│       ├── Dashboard.tsx               # layout: sidebar + header + lista
│       ├── BarraLateral.tsx
│       ├── Cabecalho.tsx
│       ├── ListaTarefas.tsx            # DnD sortable
│       ├── LinhaTarefa.tsx             # regras visuais + ações
│       ├── TagPrioridade.tsx
│       ├── DrawerTarefa.tsx            # Sheet com abas Dados / Histórico
│       ├── FormularioTarefa.tsx
│       ├── LinhaDoTempo.tsx
│       └── PopoverExcluir.tsx
├── lib/erros.ts                        # ProblemDetail → mensagem
├── tipos/api.ts
└── testes/configuracao.ts              # jest-dom, mocks globais
Dockerfile · compose.yaml · .env.example · vitest.config.ts
```

## Fases (para tasks.md)
1. Setup (scripts, vitest, env, tipos, Dockerfile/compose) · 2. Autenticação (esquemas, keycloak.ts,
auth.ts, middleware, /login, /api/cadastro) · 3. BFF + api/hooks de tarefas · 4. Dashboard (sidebar,
header, lista, linha, tag) · 5. Drawer (formulário + histórico) · 6. DnD e ações · 7. Polimento
(lint, cobertura, build, containers ponta a ponta).
