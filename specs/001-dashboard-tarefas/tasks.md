# Tasks: Dashboard de Tarefas (frontend)

Testes (Vitest) acompanham cada peça de lógica; cobertura mínima 90 % (Constituição III).

## Fase 1 — Setup
- [x] T001 `package.json` scripts (`test`, `test:cobertura`), `vitest.config.ts` (jsdom, alias `@`, limiares 90 %, exclusões), `src/testes/configuracao.ts`
- [x] T002 [P] `src/tipos/api.ts` espelhando o contrato OpenAPI do backend
- [x] T003 [P] `.env.example`, `next.config.ts` (`output: "standalone"`), `Dockerfile`, `compose.yaml` (rede externa `tarefas-rede`), `.dockerignore`

## Fase 2 — Autenticação (US1)
- [x] T004 Testes + `src/funcionalidades/autenticacao/esquemas.ts` (zod login/cadastro em português)
- [x] T005 Testes + `src/funcionalidades/autenticacao/keycloak.ts` (password grant, refresh, erros)
- [x] T006 `src/auth.ts` (Credentials, callbacks jwt/session com refresh), `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`
- [x] T007 Testes + `src/app/api/cadastro/route.ts`
- [x] T008 Testes + `FormularioLogin.tsx`, `FormularioCadastro.tsx`, `src/app/login/page.tsx`

## Fase 3 — BFF e dados (US2 base)
- [x] T009 Testes + `src/lib/erros.ts` (ProblemDetail → mensagem)
- [x] T010 Testes + `src/app/api/backend/[...caminho]/route.ts` (GET/POST/PUT/PATCH/DELETE, Bearer, 401)
- [x] T011 Testes + `src/funcionalidades/tarefas/formatadores.ts`, `api.ts`, `hooks.ts`

## Fase 4 — Dashboard (US2)
- [x] T012 Testes + `TagPrioridade.tsx`, `LinhaTarefa.tsx` (regras visuais e ações)
- [x] T013 Testes + `BarraLateral.tsx`, `Cabecalho.tsx`, `ListaTarefas.tsx` (estados vazio/erro/carregando)
- [x] T014 `Dashboard.tsx`, `Provedores.tsx`, `src/app/page.tsx`, `layout.tsx`

## Fase 5 — Drawer (US3)
- [x] T015 Testes + `esquemas.ts` (tarefa), `FormularioTarefa.tsx`, `LinhaDoTempo.tsx`, `DrawerTarefa.tsx`

## Fase 6 — Reordenar e ações (US4/US5)
- [x] T016 DnD em `ListaTarefas.tsx` (dnd-kit sortable, otimista), botões topo/final, concluir/reabrir, `PopoverExcluir.tsx` + testes

## Fase 7 — Polimento
- [x] T017 `npm run lint`, `npm run test:cobertura` ≥ 90 %, `npm run build`
- [x] T018 `docker compose up --build` com backend no ar; fluxo ponta a ponta; `README.md`
