import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  concluirTarefa,
  criarTarefa,
  editarTarefa,
  excluirTarefa,
  listarHistorico,
  listarTarefas,
  moverTarefa,
  obterPreferencias,
  obterResumoFinanceiro,
  reabrirTarefa,
  salvarPreferencias,
} from "./api";

describe("api de tarefas (cliente do BFF)", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
    // Uma Response nova por chamada: o corpo só pode ser lido uma vez
    fetchFalso.mockImplementation(async () => new Response("[]", { status: 200 }));
  });

  it("deve listar com filtro e busca aparada, omitindo busca vazia", async () => {
    await listarTarefas("ABERTAS", "  lu ");
    expect(fetchFalso.mock.calls[0][0]).toBe("/api/backend/v1/tarefas?situacao=ABERTAS&busca=lu");

    await listarTarefas("TODAS", "   ");
    expect(fetchFalso.mock.calls[1][0]).toBe("/api/backend/v1/tarefas?situacao=TODAS");
  });

  it("deve chamar os endpoints com método e corpo corretos", async () => {
    fetchFalso.mockImplementation(async () => new Response("{}", { status: 200 }));
    const dados = { descricao: "x", prioridade: "ALTA" as const, dataPrevistaConclusao: null, valor: 0 };

    await criarTarefa(dados);
    expect(fetchFalso.mock.calls.at(-1)).toEqual(["/api/backend/v1/tarefas", expect.objectContaining({ method: "POST", body: JSON.stringify(dados) })]);

    await editarTarefa("1", dados);
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe("/api/backend/v1/tarefas/1");
    expect(fetchFalso.mock.calls.at(-1)?.[1].method).toBe("PUT");

    await concluirTarefa("1");
    expect(fetchFalso.mock.calls.at(-1)).toEqual(["/api/backend/v1/tarefas/1/concluir", expect.objectContaining({ method: "PATCH" })]);

    await reabrirTarefa("1");
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe("/api/backend/v1/tarefas/1/reabrir");

    await moverTarefa("1", { destino: "POSICAO", posicao: 2 });
    expect(fetchFalso.mock.calls.at(-1)?.[1].body).toBe('{"destino":"POSICAO","posicao":2}');

    await obterResumoFinanceiro();
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe("/api/backend/v1/tarefas/resumo-financeiro");

    await listarHistorico("1");
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe("/api/backend/v1/tarefas/1/historico");
  });

  it("deve obter e salvar preferências do usuário", async () => {
    fetchFalso.mockImplementation(async () => new Response('{"filtro":"ABERTAS"}', { status: 200 }));

    await expect(obterPreferencias()).resolves.toEqual({ filtro: "ABERTAS" });
    expect(fetchFalso.mock.calls.at(-1)?.[0]).toBe("/api/backend/v1/preferencias");

    await salvarPreferencias({ filtro: "ABERTAS" });
    expect(fetchFalso.mock.calls.at(-1)).toEqual([
      "/api/backend/v1/preferencias",
      expect.objectContaining({ method: "PUT", body: '{"filtro":"ABERTAS"}' }),
    ]);
  });

  it("deve tratar 204 da exclusão como sucesso sem corpo", async () => {
    fetchFalso.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(excluirTarefa("1")).resolves.toBeUndefined();
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  it("deve lançar ErroApi com a mensagem do ProblemDetail", async () => {
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ title: "Posição inválida", detail: "A posição deve estar entre 1 e 5." }), {
        status: 400,
      }),
    );
    await expect(moverTarefa("1", { destino: "POSICAO", posicao: 9 })).rejects.toMatchObject({
      status: 400,
      message: "A posição deve estar entre 1 e 5.",
    });
  });
});
