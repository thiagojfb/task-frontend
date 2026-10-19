"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FiltroSituacao, MoverTarefaRequisicao, Tarefa, TarefaRequisicao } from "@/tipos/api";
import * as api from "./api";
import { reordenarLocalmente } from "./ordenacao";

export const chaves = {
  tarefas: (filtro: FiltroSituacao, busca: string) => ["tarefas", filtro, busca] as const,
  todasAsListas: ["tarefas"] as const,
  resumo: ["resumo-financeiro"] as const,
  historico: (id: string) => ["historico", id] as const,
};

export function useTarefas(filtro: FiltroSituacao, busca: string, habilitado = true) {
  return useQuery({
    queryKey: chaves.tarefas(filtro, busca),
    queryFn: () => api.listarTarefas(filtro, busca),
    enabled: habilitado,
  });
}

export function useResumoFinanceiro() {
  return useQuery({ queryKey: chaves.resumo, queryFn: api.obterResumoFinanceiro });
}

export function useHistorico(id: string | null) {
  return useQuery({
    queryKey: chaves.historico(id ?? ""),
    queryFn: () => api.listarHistorico(id as string),
    enabled: Boolean(id),
  });
}

interface ContextoMover {
  anteriores: [readonly unknown[], Tarefa[] | undefined][];
}

/** Mutações de tarefa com invalidação das listas e do resumo; mover é otimista com rollback. */
export function useMutacoesTarefa() {
  const clienteConsulta = useQueryClient();

  const invalidarListas = async () => {
    await Promise.all([
      clienteConsulta.invalidateQueries({ queryKey: chaves.todasAsListas }),
      clienteConsulta.invalidateQueries({ queryKey: chaves.resumo }),
    ]);
  };

  const criar = useMutation({ mutationFn: api.criarTarefa, onSuccess: invalidarListas });

  const editar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: TarefaRequisicao }) => api.editarTarefa(id, dados),
    onSuccess: async (_tarefa, { id }) => {
      await invalidarListas();
      await clienteConsulta.invalidateQueries({ queryKey: chaves.historico(id) });
    },
  });

  const concluir = useMutation({
    mutationFn: api.concluirTarefa,
    onSuccess: async (_tarefa, id) => {
      await invalidarListas();
      await clienteConsulta.invalidateQueries({ queryKey: chaves.historico(id) });
    },
  });

  const reabrir = useMutation({
    mutationFn: api.reabrirTarefa,
    onSuccess: async (_tarefa, id) => {
      await invalidarListas();
      await clienteConsulta.invalidateQueries({ queryKey: chaves.historico(id) });
    },
  });

  const excluir = useMutation({ mutationFn: api.excluirTarefa, onSuccess: invalidarListas });

  const mover = useMutation<Tarefa, Error, { id: string; movimento: MoverTarefaRequisicao }, ContextoMover>({
    mutationFn: ({ id, movimento }) => api.moverTarefa(id, movimento),
    onMutate: async ({ id, movimento }) => {
      await clienteConsulta.cancelQueries({ queryKey: chaves.todasAsListas });
      const anteriores = clienteConsulta.getQueriesData<Tarefa[]>({ queryKey: chaves.todasAsListas });
      for (const [chave, tarefas] of anteriores) {
        if (tarefas) {
          clienteConsulta.setQueryData(chave, reordenarLocalmente(tarefas, id, movimento.destino, movimento.posicao));
        }
      }
      return { anteriores };
    },
    onError: (_erro, _variaveis, contexto) => {
      for (const [chave, tarefas] of contexto?.anteriores ?? []) {
        clienteConsulta.setQueryData(chave, tarefas);
      }
    },
    onSettled: () => clienteConsulta.invalidateQueries({ queryKey: chaves.todasAsListas }),
  });

  return { criar, editar, concluir, reabrir, excluir, mover };
}
