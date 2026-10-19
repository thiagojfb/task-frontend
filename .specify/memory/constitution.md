<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0 — ratificação inicial do frontend.
Added sections: Princípios I–VII, Stack Tecnológica, Fluxo de Desenvolvimento, Governança.
Templates: plan/spec/tasks-template mantidos genéricos; o Constitution Check dos planos DEVE citar os
princípios abaixo. Sem placeholders pendentes.
-->

# Constituição do Task Frontend

## Princípios Fundamentais

### I. Arquitetura App Router com BFF

- Next.js App Router em `src/app`; código de domínio em `src/funcionalidades/<area>` (componentes,
  hooks e esquemas da área), componentes compartilhados em `src/componentes`, primitivos gerados pelo
  shadcn/ui em `src/components/ui` (não editar à mão além do necessário), utilitários em `src/lib`,
  tipos do contrato da API em `src/tipos`.
- O navegador NUNCA chama a API Java diretamente: toda chamada passa pelo BFF
  `src/app/api/backend/[...caminho]/route.ts`, que anexa o token e repassa a resposta (sem CORS).
- Server Components por padrão; `"use client"` apenas onde há interação/estado.

### II. Idioma Português em Todo o Projeto

Nomes de arquivos de domínio, componentes, hooks, funções, variáveis, mensagens, textos de tela,
testes e documentos em português do Brasil. Exceções: identificadores impostos por frameworks
(`page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, hooks `useX`), nomes de bibliotecas e os
componentes gerados em `src/components/ui`.

### III. Testes com Cobertura Mínima (NÃO NEGOCIÁVEL)

- Vitest + Testing Library; testes escritos antes ou junto da implementação de cada peça de lógica
  (validações zod, formatadores, hooks, rotas BFF, componentes com comportamento).
- `npm run test:cobertura` DEVE falhar abaixo de **90 %** de linhas, ramos e funções em `src/`,
  excluindo `src/components/ui/**` (gerado), `src/app/**/layout.tsx`, `src/app/**/page.tsx` que só
  compõem outros componentes, `middleware.ts`, `auth.ts` (configuração declarativa do Auth.js) e
  arquivos de tipos.
- Nomes de testes descrevem comportamento em português ("deve exibir prioridade Alta em vermelho").

### IV. Segurança: Token Só no Servidor

- Autenticação com Auth.js (Credentials → password grant no Keycloak pelo servidor Next). Access e
  refresh tokens vivem apenas na sessão JWT criptografada em cookie httpOnly; o cliente recebe só
  nome/usuário.
- Refresh automático antes de expirar; falha de refresh encerra a sessão e redireciona ao login.
- `middleware.ts` protege todas as rotas exceto `/login`, `/api/auth/*`, `/api/cadastro` e estáticos.
- Cadastro de conta chama `POST /api/v1/usuarios` da API (nunca a Admin API do Keycloak diretamente).

### V. UX Acessível e Mensagens Claras

- Componentes shadcn/ui (Radix) com foco visível e navegação por teclado; todo campo com `label`.
- Estados de carregamento, vazio e erro sempre representados; erros da API (`ProblemDetail`) exibidos
  com o `detail` em português; ações destrutivas com confirmação leve (Popover).
- Regras visuais do produto: prioridade em tags coloridas (Alta vermelho, Média amarelo, Baixa azul);
  valor > 0 em destaque verde/negrito e zero discreto; prazo com ícone de calendário e vermelho quando
  atrasada; alça de arrastar "⋮⋮" em cada linha.

### VI. Contrato Tipado com a API

Tipos TypeScript em `src/tipos/api.ts` espelham o contrato OpenAPI do backend
(`task-backend/specs/001-gerenciamento-tarefas-api/contracts/openapi.yaml`); mudanças de contrato
exigem atualizar tipos e testes na mesma alteração.

### VII. Entrega Containerizada

`Dockerfile` multi-stage (Node 22 alpine, `output: "standalone"`, usuário não-root), `compose.yaml`
ligado à rede externa `tarefas-rede` criada pelo backend, configuração exclusivamente por variáveis
de ambiente (`API_URL`, `KEYCLOAK_URL_INTERNO`, `AUTH_SECRET`), nenhum segredo em código;
`docker compose up --build` deve funcionar após o backend estar no ar.

## Stack Tecnológica

| Área | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router, TypeScript estrito) + React 19 |
| Estilo/UI | Tailwind CSS 4 + shadcn/ui (Radix), lucide-react |
| Estado remoto | TanStack Query |
| Formulários | react-hook-form + zod |
| Arrastar e soltar | dnd-kit |
| Autenticação | Auth.js v5 (next-auth@beta) |
| Testes | Vitest, Testing Library, jsdom, cobertura v8 |
| Lint | ESLint (config Next) |
| Entrega | Docker + Docker Compose |

## Fluxo de Desenvolvimento e Portões de Qualidade

1. Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
2. `npm run lint`, `npm run test:cobertura` e `npm run build` DEVEM passar antes de concluir uma feature.
3. Commits em português (Conventional Commits).

## Governança

Esta constituição prevalece sobre convenções locais. Emendas via `/speckit-constitution` com
versionamento semântico (MAJOR remoção/redefinição; MINOR novo princípio; PATCH redação).

**Version**: 1.0.0 | **Ratified**: 2026-09-20 | **Last Amended**: 2026-09-20
