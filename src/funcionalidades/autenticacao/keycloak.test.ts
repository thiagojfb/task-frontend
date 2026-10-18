import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ErroAutenticacao,
  autenticarComSenha,
  decodificarClaims,
  nomeDeExibicao,
  renovarTokens,
} from "./keycloak";

function tokenComPayload(payload: object): string {
  const corpo = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `cabecalho.${corpo}.assinatura`;
}

describe("keycloak (servidor)", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_URL_INTERNO", "http://keycloak:8080");
    vi.stubEnv("KEYCLOAK_REALM", "tarefas");
    vi.stubEnv("KEYCLOAK_CLIENT_ID", "tarefas-frontend");
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
  });

  it("deve autenticar por senha enviando o formulário correto ao endpoint de token", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ access_token: "acesso", refresh_token: "refresh", expires_in: 300 }), {
        status: 200,
      }),
    );

    const tokens = await autenticarComSenha("ana", "senha123");

    expect(tokens).toEqual({ accessToken: "acesso", refreshToken: "refresh", expiraEm: 1_000_000 + 300_000 });
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe("http://keycloak:8080/realms/tarefas/protocol/openid-connect/token");
    expect(opcoes.method).toBe("POST");
    expect(String(opcoes.body)).toBe(
      "client_id=tarefas-frontend&grant_type=password&username=ana&password=senha123&scope=openid",
    );
  });

  it("deve traduzir 401 do Keycloak em credenciais inválidas", async () => {
    fetchFalso.mockResolvedValue(new Response("{}", { status: 401 }));

    await expect(autenticarComSenha("ana", "errada")).rejects.toMatchObject({
      codigo: "credenciais_invalidas",
      message: "Usuário ou senha inválidos.",
    });
  });

  it("deve traduzir 400 no refresh em sessão expirada", async () => {
    fetchFalso.mockResolvedValue(new Response("{}", { status: 400 }));

    await expect(renovarTokens("velho")).rejects.toMatchObject({ codigo: "sessao_expirada" });
    expect(String(fetchFalso.mock.calls[0][1].body)).toBe(
      "client_id=tarefas-frontend&grant_type=refresh_token&refresh_token=velho",
    );
  });

  it("deve tratar erro 5xx e falha de rede como indisponibilidade", async () => {
    fetchFalso.mockResolvedValueOnce(new Response("erro", { status: 503 }));
    await expect(autenticarComSenha("ana", "x")).rejects.toMatchObject({ codigo: "indisponivel" });

    fetchFalso.mockRejectedValueOnce(new TypeError("falha de rede"));
    await expect(autenticarComSenha("ana", "x")).rejects.toBeInstanceOf(ErroAutenticacao);
  });

  it("deve usar o client_id padrão quando a variável não estiver definida", async () => {
    vi.stubEnv("KEYCLOAK_CLIENT_ID", "");
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ access_token: "a", refresh_token: "r", expires_in: 1 }), { status: 200 }),
    );

    await renovarTokens("r");

    expect(String(fetchFalso.mock.calls[0][1].body)).toContain("client_id=tarefas-frontend");
  });

  it("deve decodificar claims e escolher o nome de exibição em ordem de preferência", () => {
    const completo = decodificarClaims(
      tokenComPayload({ sub: "id-1", name: "Ana Silva", preferred_username: "ana", email: "ana@x.br" }),
    );
    expect(completo).toMatchObject({ sub: "id-1", name: "Ana Silva", email: "ana@x.br" });
    expect(nomeDeExibicao(completo)).toBe("Ana Silva");
    expect(nomeDeExibicao({ sub: "id-2", preferred_username: "semnome" })).toBe("semnome");
    expect(nomeDeExibicao({ sub: "id-3" })).toBe("id-3");
  });

  it("deve tratar token malformado como payload vazio", () => {
    expect(() => decodificarClaims("apenas-um-segmento")).toThrow();
  });
});
