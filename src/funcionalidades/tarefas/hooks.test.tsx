import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Tarefa } from "@/tipos/api";

vi.mock("./api");

import * as api from "./api";
import { chaves, useHistorico, useMutacoesTarefa, useResumoFinanceiro, useTarefas } from "./hooks";

const apiFalsa = vi.mocked(api);

function tarefa(id: string, posicao: number): Tarefa {
  return {
    id,
    descricao: `T${id}`,
    prioridade: "MEDIA",
    situacao: "ABERTA",
    dataAbertura: "2026-09-19T10:00:00",
    dataPrevistaConclusao: null,
    dataConclusaoReal: null,
    valor: 0,
    posicao,
    atrasada: false,
  };
}

describe("hooks de tarefas", () => {
  let cliente: QueryClient;
  const envolver = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    cliente = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    vi.resetAllMocks();
  });

  it("useTarefas deve buscar com filtro e busca", async () => {
    apiFalsa.listarTarefas.mockResolvedValue([tarefa("1", 1)]);
    const { result } = renderHook(() => useTarefas("ABERTAS", "lu"), { wrapper: envolver });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFalsa.listarTarefas).toHaveBeenCalledWith("ABERTAS", "lu");
    expect(result.current.data).toHaveLength(1);
  });

  it("useTarefas não deve buscar enquanto estiver desabilitado", () => {
    const { result } = renderHook(() => useTarefas("TODAS", "", false), { wrapper: envolver });
    expect(result.current.fetchStatus).toBe("idle");
    expect(apiFalsa.listarTarefas).not.toHaveBeenCalled();
  });

  it("useResumoFinanceiro deve buscar o resumo", async () => {
    apiFalsa.obterResumoFinanceiro.mockResolvedValue({ mes: 9, ano: 2026, totalAGastar: 10, totalFormatado: "R$ 10,00" });
    const { result } = renderHook(() => useResumoFinanceiro(), { wrapper: envolver });
    await waitFor(() => expect(result.current.data?.totalFormatado).toBe("R$ 10,00"));
  });

  it("useHistorico só deve buscar quando houver id", async () => {
    apiFalsa.listarHistorico.mockResolvedValue([]);
    const semId = renderHook(() => useHistorico(null), { wrapper: envolver });
    expect(semId.result.current.fetchStatus).toBe("idle");
    const comId = renderHook(() => useHistorico("1"), { wrapper: envolver });
    await waitFor(() => expect(comId.result.current.isSuccess).toBe(true));
    expect(apiFalsa.listarHistorico).toHaveBeenCalledWith("1");
  });

  it("criar, editar, concluir, reabrir e excluir devem invalidar listas, resumo e histórico", async () => {
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    apiFalsa.criarTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.editarTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.concluirTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.reabrirTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.excluirTarefa.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMutacoesTarefa(), { wrapper: envolver });
    const dados = { descricao: "x", prioridade: "ALTA" as const, dataPrevistaConclusao: null, valor: 0 };

    await act(() => result.current.criar.mutateAsync(dados));
    await act(() => result.current.editar.mutateAsync({ id: "1", dados }));
    await act(() => result.current.concluir.mutateAsync("1"));
    await act(() => result.current.reabrir.mutateAsync("1"));
    await act(() => result.current.excluir.mutateAsync("1"));

    expect(apiFalsa.editarTarefa).toHaveBeenCalledWith("1", dados);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: chaves.todasAsListas });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: chaves.resumo });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: chaves.historico("1") });
  });

  it("mover deve aplicar a ordem otimista e confirmar após a API", async () => {
    cliente.setQueryData(chaves.tarefas("TODAS", ""), [tarefa("1", 1), tarefa("2", 2), tarefa("3", 3)]);
    apiFalsa.moverTarefa.mockResolvedValue(tarefa("3", 1));
    const { result } = renderHook(() => useMutacoesTarefa(), { wrapper: envolver });

    const promessa = act(() => result.current.mover.mutateAsync({ id: "3", movimento: { destino: "TOPO" } }));
    await waitFor(() =>
      expect(cliente.getQueryData<Tarefa[]>(chaves.tarefas("TODAS", ""))?.map((item) => item.id)).toEqual(["3", "1", "2"]),
    );
    await promessa;
    expect(apiFalsa.moverTarefa).toHaveBeenCalledWith("3", { destino: "TOPO" });
  });

  it("mover deve restaurar a ordem anterior quando a API falhar", async () => {
    const original = [tarefa("1", 1), tarefa("2", 2)];
    cliente.setQueryData(chaves.tarefas("TODAS", ""), original);
    apiFalsa.moverTarefa.mockRejectedValue(new Error("Posição inválida"));
    apiFalsa.listarTarefas.mockResolvedValue(original);
    const { result } = renderHook(() => useMutacoesTarefa(), { wrapper: envolver });

    await act(async () => {
      await result.current.mover.mutateAsync({ id: "2", movimento: { destino: "TOPO" } }).catch(() => undefined);
    });

    expect(cliente.getQueryData<Tarefa[]>(chaves.tarefas("TODAS", ""))?.map((item) => item.id)).toEqual(["1", "2"]);
  });
});
