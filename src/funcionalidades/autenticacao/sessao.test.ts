import { describe, expect, it, vi } from "vitest";
import type { JWT } from "next-auth/jwt";
import { atualizarTokenSessao } from "./sessao";
import * as keycloak from "./keycloak";

describe("atualizarTokenSessao", () => {
  // Expira em 100 s; a margem de renovação é 30 s → renova a partir de 70 s
  const base: JWT = { sub: "id", usuario: "ana", accessToken: "a1", refreshToken: "r1", expiraEm: 100_000 };

  it("deve guardar os tokens do usuário no login", async () => {
    const resultado = await atualizarTokenSessao({ sub: "id" }, {
      id: "id",
      usuario: "ana",
      tokens: { accessToken: "a", refreshToken: "r", expiraEm: 123 },
    });
    expect(resultado).toMatchObject({ usuario: "ana", accessToken: "a", refreshToken: "r", expiraEm: 123 });
  });

  it("deve manter o token quando ainda estiver longe de expirar", async () => {
    const renovar = vi.spyOn(keycloak, "renovarTokens");
    const resultado = await atualizarTokenSessao(base, null, 1_000);
    expect(resultado).toBe(base);
    expect(renovar).not.toHaveBeenCalled();
  });

  it("deve renovar quando faltar menos que a margem para expirar", async () => {
    vi.spyOn(keycloak, "renovarTokens").mockResolvedValue({ accessToken: "a2", refreshToken: "r2", expiraEm: 99_999 });
    const resultado = await atualizarTokenSessao(base, null, 80_000);
    expect(resultado).toMatchObject({ accessToken: "a2", refreshToken: "r2", expiraEm: 99_999 });
  });

  it("deve marcar a sessão como inválida e apagar tokens quando a renovação falhar", async () => {
    vi.spyOn(keycloak, "renovarTokens").mockRejectedValue(new keycloak.ErroAutenticacao("sessao_expirada"));
    const resultado = await atualizarTokenSessao(base, null, 200_000);
    expect(resultado).toMatchObject({ erro: "RefreshFalhou", accessToken: undefined, refreshToken: undefined });
  });

  it("deve devolver o token intacto quando já estiver marcado com erro ou sem refresh token", async () => {
    const renovar = vi.spyOn(keycloak, "renovarTokens");
    const comErro: JWT = { ...base, erro: "RefreshFalhou" };
    expect(await atualizarTokenSessao(comErro, undefined, 200_000)).toBe(comErro);
    const semRefresh: JWT = { sub: "id" };
    expect(await atualizarTokenSessao(semRefresh, undefined, 200_000)).toBe(semRefresh);
    expect(renovar).not.toHaveBeenCalled();
  });
});
