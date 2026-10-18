import { NextResponse, type NextRequest } from "next/server";
import { obterAccessToken } from "./sessao-servidor";
import type { ProblemDetail } from "@/tipos/api";

const METODOS_SEM_CORPO = new Set(["GET", "HEAD", "DELETE"]);
const STATUS_SEM_CORPO = new Set([204, 205, 304]);

export interface ContextoRota {
  params: Promise<{ caminho: string[] }>;
}

function problema(status: number, title: string, detail: string): NextResponse {
  const corpo: ProblemDetail = { title, status, detail };
  return NextResponse.json(corpo, { status });
}

/**
 * Backend-for-frontend: repassa /api/backend/<caminho> para {API_URL}/api/<caminho> anexando o Bearer
 * da sessão. O navegador nunca vê o token nem fala com a API Java diretamente.
 */
export async function repassarParaBackend(requisicao: NextRequest, contexto: ContextoRota): Promise<NextResponse> {
  const token = await obterAccessToken(requisicao);
  if (!token) {
    return problema(401, "Não autenticado", "Sua sessão expirou. Entre novamente.");
  }

  const { caminho } = await contexto.params;
  const url = `${process.env.API_URL}/api/${caminho.join("/")}${requisicao.nextUrl.search}`;
  const temCorpo = !METODOS_SEM_CORPO.has(requisicao.method);
  const cabecalhos: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  if (temCorpo) {
    cabecalhos["Content-Type"] = requisicao.headers.get("content-type") ?? "application/json";
  }

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: requisicao.method,
      headers: cabecalhos,
      body: temCorpo ? await requisicao.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return problema(503, "API indisponível", "Não foi possível conectar à API. Tente novamente em instantes.");
  }

  if (STATUS_SEM_CORPO.has(resposta.status)) {
    return new NextResponse(null, { status: resposta.status });
  }
  const texto = await resposta.text();
  return new NextResponse(texto, {
    status: resposta.status,
    headers: { "Content-Type": resposta.headers.get("content-type") ?? "application/json" },
  });
}
