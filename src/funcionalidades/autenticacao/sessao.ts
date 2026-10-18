import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";
import { renovarTokens } from "./keycloak";

/** Margem antes da expiração para renovar o token proativamente. */
export const MARGEM_RENOVACAO_MS = 30_000;

/**
 * Lógica do callback `jwt` do Auth.js: guarda os tokens no login, renova quando estão perto de expirar
 * e marca a sessão como inválida quando a renovação falha. Os tokens nunca saem do JWT criptografado.
 */
export async function atualizarTokenSessao(token: JWT, usuario?: User | null, agora = Date.now()): Promise<JWT> {
  if (usuario?.tokens) {
    return {
      ...token,
      usuario: usuario.usuario,
      accessToken: usuario.tokens.accessToken,
      refreshToken: usuario.tokens.refreshToken,
      expiraEm: usuario.tokens.expiraEm,
      erro: undefined,
    };
  }
  if (token.erro || !token.refreshToken) {
    return token;
  }
  if (token.expiraEm !== undefined && agora < token.expiraEm - MARGEM_RENOVACAO_MS) {
    return token;
  }
  try {
    const novos = await renovarTokens(token.refreshToken);
    return { ...token, accessToken: novos.accessToken, refreshToken: novos.refreshToken, expiraEm: novos.expiraEm };
  } catch {
    return { ...token, accessToken: undefined, refreshToken: undefined, erro: "RefreshFalhou" };
  }
}
