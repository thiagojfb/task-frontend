// Executa apenas no servidor Next: fala com o Keycloak pela rede interna.

import { MENSAGENS_ERRO_AUTENTICACAO, type CodigoErroAutenticacao } from "./mensagens";

export type { CodigoErroAutenticacao } from "./mensagens";
export { MENSAGENS_ERRO_AUTENTICACAO } from "./mensagens";

export class ErroAutenticacao extends Error {
  constructor(public readonly codigo: CodigoErroAutenticacao) {
    super(MENSAGENS_ERRO_AUTENTICACAO[codigo]);
    this.name = "ErroAutenticacao";
  }
}

export interface TokensKeycloak {
  accessToken: string;
  refreshToken: string;
  /** Instante (epoch em ms) em que o access token expira. */
  expiraEm: number;
}

export interface ClaimsToken {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

interface RespostaToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function urlToken(): string {
  return `${process.env.KEYCLOAK_URL_INTERNO}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
}

async function solicitarToken(
  parametros: Record<string, string>,
  codigoQuandoRejeitado: CodigoErroAutenticacao,
): Promise<TokensKeycloak> {
  let resposta: Response;
  try {
    resposta = await fetch(urlToken(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.KEYCLOAK_CLIENT_ID || "tarefas-frontend", ...parametros }),
      cache: "no-store",
    });
  } catch {
    throw new ErroAutenticacao("indisponivel");
  }
  if (resposta.status === 400 || resposta.status === 401) {
    throw new ErroAutenticacao(codigoQuandoRejeitado);
  }
  if (!resposta.ok) {
    throw new ErroAutenticacao("indisponivel");
  }
  const corpo = (await resposta.json()) as RespostaToken;
  return {
    accessToken: corpo.access_token,
    refreshToken: corpo.refresh_token,
    expiraEm: Date.now() + corpo.expires_in * 1000,
  };
}

/** Login por usuário e senha (Direct Access Grant). */
export function autenticarComSenha(usuario: string, senha: string): Promise<TokensKeycloak> {
  return solicitarToken(
    { grant_type: "password", username: usuario, password: senha, scope: "openid" },
    "credenciais_invalidas",
  );
}

/** Renova o par de tokens com o refresh token. */
export function renovarTokens(refreshToken: string): Promise<TokensKeycloak> {
  return solicitarToken({ grant_type: "refresh_token", refresh_token: refreshToken }, "sessao_expirada");
}

/** Lê as claims do payload do JWT (o token veio do Keycloak pela rede interna; não há necessidade de verificar). */
export function decodificarClaims(token: string): ClaimsToken {
  const payload = token.split(".")[1] ?? "";
  const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as ClaimsToken;
}

export function nomeDeExibicao(claims: ClaimsToken): string {
  return claims.name ?? claims.preferred_username ?? claims.sub;
}
