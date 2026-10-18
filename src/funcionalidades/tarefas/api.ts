import { lancarSeErro } from "@/lib/erros";
import type {
  FiltroSituacao,
  MoverTarefaRequisicao,
  Preferencias,
  RegistroHistorico,
  ResumoFinanceiro,
  Tarefa,
  TarefaRequisicao,
} from "@/tipos/api";

/** Todas as chamadas passam pelo BFF (/api/backend), que anexa o token da sessão. */
const RAIZ = "/api/backend/v1";
const BASE = `${RAIZ}/tarefas`;

async function requisitarAbsoluto<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  await lancarSeErro(resposta);
  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}

function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  return requisitarAbsoluto<T>(`${BASE}${caminho}`, init);
}

export function obterPreferencias(): Promise<Preferencias> {
  return requisitarAbsoluto<Preferencias>(`${RAIZ}/preferencias`);
}

export function salvarPreferencias(preferencias: Preferencias): Promise<Preferencias> {
  return requisitarAbsoluto<Preferencias>(`${RAIZ}/preferencias`, {
    method: "PUT",
    body: JSON.stringify(preferencias),
  });
}

export function listarTarefas(filtro: FiltroSituacao, busca: string): Promise<Tarefa[]> {
  const parametros = new URLSearchParams({ situacao: filtro });
  if (busca.trim()) {
    parametros.set("busca", busca.trim());
  }
  return requisitar<Tarefa[]>(`?${parametros.toString()}`);
}

export function obterResumoFinanceiro(): Promise<ResumoFinanceiro> {
  return requisitar<ResumoFinanceiro>("/resumo-financeiro");
}

export function criarTarefa(dados: TarefaRequisicao): Promise<Tarefa> {
  return requisitar<Tarefa>("", { method: "POST", body: JSON.stringify(dados) });
}

export function editarTarefa(id: string, dados: TarefaRequisicao): Promise<Tarefa> {
  return requisitar<Tarefa>(`/${id}`, { method: "PUT", body: JSON.stringify(dados) });
}

export function concluirTarefa(id: string): Promise<Tarefa> {
  return requisitar<Tarefa>(`/${id}/concluir`, { method: "PATCH" });
}

export function reabrirTarefa(id: string): Promise<Tarefa> {
  return requisitar<Tarefa>(`/${id}/reabrir`, { method: "PATCH" });
}

export function moverTarefa(id: string, movimento: MoverTarefaRequisicao): Promise<Tarefa> {
  return requisitar<Tarefa>(`/${id}/mover`, { method: "PATCH", body: JSON.stringify(movimento) });
}

export function excluirTarefa(id: string): Promise<void> {
  return requisitar<void>(`/${id}`, { method: "DELETE" });
}

export function listarHistorico(id: string): Promise<RegistroHistorico[]> {
  return requisitar<RegistroHistorico[]>(`/${id}/historico`);
}
