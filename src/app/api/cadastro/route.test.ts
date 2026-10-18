import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const cadastroValido = {
  nome: "Carla",
  sobrenome: "Dias",
  email: "carla@exemplo.com.br",
  usuario: "carla",
  senha: "segredo123",
  confirmarSenha: "segredo123",
};

function requisicao(corpo: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/cadastro", {
    method: "POST",
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/cadastro", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    vi.stubEnv("API_URL", "http://task-backend:8080");
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
  });

  it("deve repassar o cadastro à API sem o campo confirmarSenha e devolver a resposta", async () => {
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ usuario: "carla", email: "carla@exemplo.com.br", nome: "Carla Dias" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );

    const resposta = await POST(requisicao(cadastroValido));

    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toMatchObject({ usuario: "carla" });
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe("http://task-backend:8080/api/v1/usuarios");
    expect(JSON.parse(opcoes.body)).toEqual({
      nome: "Carla",
      sobrenome: "Dias",
      email: "carla@exemplo.com.br",
      usuario: "carla",
      senha: "segredo123",
    });
  });

  it("deve devolver 400 com os campos inválidos sem chamar a API", async () => {
    const resposta = await POST(requisicao({ ...cadastroValido, senha: "123", confirmarSenha: "456" }));

    expect(resposta.status).toBe(400);
    const problema = await resposta.json();
    expect(problema.title).toBe("Dados inválidos");
    expect(problema.erros).toEqual(
      expect.arrayContaining([
        { campo: "senha", mensagem: "A senha deve ter entre 8 e 128 caracteres." },
        { campo: "confirmarSenha", mensagem: "As senhas não coincidem." },
      ]),
    );
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("deve tratar corpo não JSON como dados inválidos", async () => {
    const resposta = await POST(requisicao("isto não é json"));
    expect(resposta.status).toBe(400);
  });

  it("deve repassar o ProblemDetail de conflito da API", async () => {
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ title: "Usuário já cadastrado", status: 409 }), {
        status: 409,
        headers: { "content-type": "application/problem+json" },
      }),
    );

    const resposta = await POST(requisicao(cadastroValido));

    expect(resposta.status).toBe(409);
    expect(resposta.headers.get("content-type")).toBe("application/problem+json");
    expect(await resposta.json()).toMatchObject({ title: "Usuário já cadastrado" });
  });

  it("deve usar application/json quando a API não informar content-type", async () => {
    // Response nativa sempre define content-type para corpo em texto; simula uma resposta sem o cabeçalho
    fetchFalso.mockResolvedValue({ status: 200, headers: new Headers(), text: async () => "{}" });
    const resposta = await POST(requisicao(cadastroValido));
    expect(resposta.headers.get("content-type")).toBe("application/json");
  });

  it("deve devolver 503 quando a API estiver inacessível", async () => {
    fetchFalso.mockRejectedValue(new TypeError("conexão recusada"));

    const resposta = await POST(requisicao(cadastroValido));

    expect(resposta.status).toBe(503);
    expect(await resposta.json()).toMatchObject({ title: "API indisponível" });
  });
});
