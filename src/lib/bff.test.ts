import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./sessao-servidor", () => ({ obterAccessToken: vi.fn() }));

import { obterAccessToken } from "./sessao-servidor";
import { repassarParaBackend } from "./bff";

const obterTokenFalso = vi.mocked(obterAccessToken);

function contexto(...caminho: string[]) {
  return { params: Promise.resolve({ caminho }) };
}

describe("repassarParaBackend", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    vi.stubEnv("API_URL", "http://task-backend:8080");
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
    obterTokenFalso.mockReset();
    obterTokenFalso.mockResolvedValue("token-abc");
  });

  it("deve repassar GET com querystring, Bearer e devolver corpo e content-type da API", async () => {
    fetchFalso.mockResolvedValue(
      new Response("[]", { status: 200, headers: { "content-type": "application/json" } }),
    );
    const requisicao = new NextRequest("http://localhost:3000/api/backend/v1/tarefas?situacao=ABERTAS&busca=lu");

    const resposta = await repassarParaBackend(requisicao, contexto("v1", "tarefas"));

    expect(resposta.status).toBe(200);
    expect(await resposta.text()).toBe("[]");
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe("http://task-backend:8080/api/v1/tarefas?situacao=ABERTAS&busca=lu");
    expect(opcoes.method).toBe("GET");
    expect(opcoes.headers.Authorization).toBe("Bearer token-abc");
    expect(opcoes.headers["Content-Type"]).toBeUndefined();
    expect(opcoes.body).toBeUndefined();
  });

  it("deve repassar o corpo e o content-type em POST/PUT/PATCH", async () => {
    fetchFalso.mockResolvedValue(
      new Response('{"id":"1"}', { status: 201, headers: { "content-type": "application/json" } }),
    );
    const requisicao = new NextRequest("http://localhost:3000/api/backend/v1/tarefas", {
      method: "POST",
      body: '{"descricao":"x"}',
      headers: { "content-type": "application/json; charset=utf-8" },
    });

    const resposta = await repassarParaBackend(requisicao, contexto("v1", "tarefas"));

    expect(resposta.status).toBe(201);
    const opcoes = fetchFalso.mock.calls[0][1];
    expect(opcoes.body).toBe('{"descricao":"x"}');
    expect(opcoes.headers["Content-Type"]).toBe("application/json; charset=utf-8");
  });

  it("deve assumir application/json quando a requisição não informar content-type", async () => {
    fetchFalso.mockResolvedValue(new Response("{}", { status: 200 }));
    const requisicao = new NextRequest("http://localhost:3000/api/backend/v1/tarefas/1/concluir", {
      method: "PATCH",
    });

    await repassarParaBackend(requisicao, contexto("v1", "tarefas", "1", "concluir"));

    expect(fetchFalso.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
  });

  it("deve devolver 204 sem corpo para exclusões", async () => {
    fetchFalso.mockResolvedValue(new Response(null, { status: 204 }));
    const requisicao = new NextRequest("http://localhost:3000/api/backend/v1/tarefas/1", { method: "DELETE" });

    const resposta = await repassarParaBackend(requisicao, contexto("v1", "tarefas", "1"));

    expect(resposta.status).toBe(204);
    expect(resposta.body).toBeNull();
  });

  it("deve devolver 401 em português quando não houver sessão válida, sem chamar a API", async () => {
    obterTokenFalso.mockResolvedValue(null);

    const resposta = await repassarParaBackend(new NextRequest("http://localhost:3000/x"), contexto("v1", "tarefas"));

    expect(resposta.status).toBe(401);
    expect(await resposta.json()).toMatchObject({ title: "Não autenticado" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("deve devolver 503 quando a API estiver inacessível", async () => {
    fetchFalso.mockRejectedValue(new TypeError("conexão recusada"));

    const resposta = await repassarParaBackend(new NextRequest("http://localhost:3000/x"), contexto("v1", "tarefas"));

    expect(resposta.status).toBe(503);
    expect(await resposta.json()).toMatchObject({ title: "API indisponível" });
  });

  it("deve usar application/json quando a API não informar content-type", async () => {
    fetchFalso.mockResolvedValue({ status: 200, headers: new Headers(), text: async () => "{}" });

    const resposta = await repassarParaBackend(new NextRequest("http://localhost:3000/x"), contexto("v1", "tarefas"));

    expect(resposta.headers.get("content-type")).toBe("application/json");
  });
});
