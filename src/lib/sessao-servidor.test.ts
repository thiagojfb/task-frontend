import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }));

import { getToken } from "next-auth/jwt";
import { obterAccessToken, obterJwtDaSessao } from "./sessao-servidor";

const getTokenFalso = vi.mocked(getToken);

describe("sessao-servidor", () => {
  beforeEach(() => {
    getTokenFalso.mockReset();
    vi.stubEnv("AUTH_SECRET", "segredo");
  });

  it("deve usar o cookie padrão em http e o cookie seguro em https", async () => {
    getTokenFalso.mockResolvedValue(null);
    await obterJwtDaSessao(new NextRequest("http://localhost:3000/api/backend/v1/tarefas"));
    expect(getTokenFalso).toHaveBeenLastCalledWith(
      expect.objectContaining({ salt: "authjs.session-token", secureCookie: false, secret: "segredo" }),
    );
    await obterJwtDaSessao(new NextRequest("https://app.exemplo.com/api/backend/v1/tarefas"));
    expect(getTokenFalso).toHaveBeenLastCalledWith(
      expect.objectContaining({ salt: "__Secure-authjs.session-token", secureCookie: true }),
    );
  });

  it("deve devolver o access token quando a sessão for válida", async () => {
    getTokenFalso.mockResolvedValue({ accessToken: "abc" });
    expect(await obterAccessToken(new NextRequest("http://localhost/x"))).toBe("abc");
  });

  it("deve devolver null sem sessão, com erro de refresh ou sem access token", async () => {
    getTokenFalso.mockResolvedValueOnce(null);
    expect(await obterAccessToken(new NextRequest("http://localhost/x"))).toBeNull();
    getTokenFalso.mockResolvedValueOnce({ accessToken: "abc", erro: "RefreshFalhou" });
    expect(await obterAccessToken(new NextRequest("http://localhost/x"))).toBeNull();
    getTokenFalso.mockResolvedValueOnce({});
    expect(await obterAccessToken(new NextRequest("http://localhost/x"))).toBeNull();
  });

  it("deve funcionar sem AUTH_SECRET definido (string vazia)", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    getTokenFalso.mockResolvedValue(null);
    await obterJwtDaSessao(new NextRequest("http://localhost/x"));
    expect(getTokenFalso).toHaveBeenLastCalledWith(expect.objectContaining({ secret: "" }));
  });
});
