import type { NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";

/**
 * Lê o JWT criptografado da sessão diretamente do cookie, no servidor. É o único lugar de onde o
 * access token sai — para ser anexado às chamadas do BFF ao backend.
 */
export async function obterJwtDaSessao(requisicao: NextRequest): Promise<JWT | null> {
  const seguro = requisicao.nextUrl.protocol === "https:";
  const salt = seguro ? "__Secure-authjs.session-token" : "authjs.session-token";
  return getToken({ req: requisicao, secret: process.env.AUTH_SECRET ?? "", salt, secureCookie: seguro });
}

/** Devolve o access token válido ou null quando não há sessão utilizável. */
export async function obterAccessToken(requisicao: NextRequest): Promise<string | null> {
  const jwt = await obterJwtDaSessao(requisicao);
  if (!jwt || jwt.erro || !jwt.accessToken) {
    return null;
  }
  return jwt.accessToken;
}
