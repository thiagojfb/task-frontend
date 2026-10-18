import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api");

import * as api from "./api";
import { CHAVE_PREFERENCIAS, usePreferenciaFiltro } from "./preferencias";

const apiFalsa = vi.mocked(api);

describe("usePreferenciaFiltro (persistida na API)", () => {
  let cliente: QueryClient;
  const envolver = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    cliente = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    vi.resetAllMocks();
  });

  it("deve começar não pronto e restaurar o filtro salvo na API", async () => {
    apiFalsa.obterPreferencias.mockResolvedValue({ filtro: "ABERTAS" });
    const { result } = renderHook(() => usePreferenciaFiltro(), { wrapper: envolver });

    expect(result.current.pronto).toBe(false);
    expect(result.current.filtro).toBe("TODAS");
    await waitFor(() => expect(result.current.pronto).toBe(true));
    expect(result.current.filtro).toBe("ABERTAS");
  });

  it("deve aplicar o novo filtro imediatamente e gravá-lo na API", async () => {
    apiFalsa.obterPreferencias.mockResolvedValue({ filtro: "TODAS" });
    apiFalsa.salvarPreferencias.mockResolvedValue({ filtro: "CONCLUIDAS" });
    const { result } = renderHook(() => usePreferenciaFiltro(), { wrapper: envolver });
    await waitFor(() => expect(result.current.pronto).toBe(true));

    act(() => result.current.definirFiltro("CONCLUIDAS"));

    await waitFor(() => expect(result.current.filtro).toBe("CONCLUIDAS"));
    await waitFor(() => expect(apiFalsa.salvarPreferencias).toHaveBeenCalledWith({ filtro: "CONCLUIDAS" }, expect.anything()));
    expect(cliente.getQueryData(CHAVE_PREFERENCIAS)).toEqual({ filtro: "CONCLUIDAS" });
  });

  it("deve voltar ao filtro anterior quando a gravação falhar", async () => {
    apiFalsa.obterPreferencias.mockResolvedValue({ filtro: "ABERTAS" });
    apiFalsa.salvarPreferencias.mockRejectedValue(new Error("Falhou"));
    const { result } = renderHook(() => usePreferenciaFiltro(), { wrapper: envolver });
    await waitFor(() => expect(result.current.pronto).toBe(true));

    act(() => result.current.definirFiltro("CONCLUIDAS"));

    await waitFor(() => expect(result.current.erro).toBeInstanceOf(Error));
    expect(result.current.filtro).toBe("ABERTAS");
  });

  it("deve usar o padrão e ficar pronto quando a API de preferências falhar", async () => {
    apiFalsa.obterPreferencias.mockRejectedValue(new Error("API indisponível"));
    const { result } = renderHook(() => usePreferenciaFiltro(), { wrapper: envolver });

    await waitFor(() => expect(result.current.pronto).toBe(true));
    expect(result.current.filtro).toBe("TODAS");
    expect(result.current.erro).toBeInstanceOf(Error);
  });

  it("deve restaurar o padrão quando a gravação falhar sem estado anterior em cache", async () => {
    apiFalsa.obterPreferencias.mockRejectedValue(new Error("indisponível"));
    apiFalsa.salvarPreferencias.mockRejectedValue(new Error("Falhou"));
    const { result } = renderHook(() => usePreferenciaFiltro(), { wrapper: envolver });
    await waitFor(() => expect(result.current.pronto).toBe(true));

    act(() => result.current.definirFiltro("ABERTAS"));

    await waitFor(() => expect(cliente.getQueryData(CHAVE_PREFERENCIAS)).toEqual({ filtro: "TODAS" }));
  });
});
