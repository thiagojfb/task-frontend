"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { FiltroSituacao, Preferencias } from "@/tipos/api";
import * as api from "./api";

export const PREFERENCIAS_PADRAO: Preferencias = { filtro: "TODAS" };
export const CHAVE_PREFERENCIAS = ["preferencias"] as const;

/**
 * Filtro preferido do usuário, persistido na API (vale em qualquer navegador/dispositivo).
 * `pronto` é false enquanto a preferência ainda não foi carregada; se a API falhar, usa o padrão.
 * A troca de filtro é aplicada imediatamente (otimista) e gravada em segundo plano.
 */
export function usePreferenciaFiltro() {
  const clienteConsulta = useQueryClient();
  const consulta = useQuery({ queryKey: CHAVE_PREFERENCIAS, queryFn: api.obterPreferencias, staleTime: Infinity });

  const salvar = useMutation({
    mutationFn: api.salvarPreferencias,
    onMutate: async (novas) => {
      await clienteConsulta.cancelQueries({ queryKey: CHAVE_PREFERENCIAS });
      const anteriores = clienteConsulta.getQueryData<Preferencias>(CHAVE_PREFERENCIAS);
      clienteConsulta.setQueryData<Preferencias>(CHAVE_PREFERENCIAS, novas);
      return { anteriores };
    },
    onError: (_erro, _novas, contexto) => {
      clienteConsulta.setQueryData(CHAVE_PREFERENCIAS, contexto?.anteriores ?? PREFERENCIAS_PADRAO);
    },
    onSuccess: (salvas) => {
      clienteConsulta.setQueryData(CHAVE_PREFERENCIAS, salvas);
    },
  });

  const definirFiltro = useCallback((filtro: FiltroSituacao) => salvar.mutate({ filtro }), [salvar]);

  return {
    filtro: (consulta.data ?? PREFERENCIAS_PADRAO).filtro,
    definirFiltro,
    pronto: consulta.isSuccess || consulta.isError,
    erro: consulta.error ?? salvar.error ?? null,
  };
}
