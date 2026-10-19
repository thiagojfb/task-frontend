import { NextResponse, type NextRequest } from "next/server";
import { esquemaCadastro } from "@/funcionalidades/autenticacao/esquemas";
import type { ProblemDetail } from "@/tipos/api";

export const dynamic = "force-dynamic";

/** Cria a conta pela API Java (que fala com o Keycloak); o navegador nunca acessa a Admin API. */
export async function POST(requisicao: NextRequest): Promise<NextResponse> {
  const corpo = await requisicao.json().catch(() => null);
  const dados = esquemaCadastro.safeParse(corpo);
  if (!dados.success) {
    const problema: ProblemDetail = {
      title: "Dados inválidos",
      status: 400,
      detail: "Um ou mais campos estão inválidos.",
      erros: dados.error.issues.map((problemaCampo) => ({
        campo: String(problemaCampo.path[0] ?? ""),
        mensagem: problemaCampo.message,
      })),
    };
    return NextResponse.json(problema, { status: 400 });
  }

  const novoUsuario = {
    nome: dados.data.nome,
    sobrenome: dados.data.sobrenome,
    email: dados.data.email,
    usuario: dados.data.usuario,
    senha: dados.data.senha,
  };
  try {
    const resposta = await fetch(`${process.env.API_URL}/api/v1/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario),
      cache: "no-store",
    });
    const texto = await resposta.text();
    return new NextResponse(texto, {
      status: resposta.status,
      headers: { "Content-Type": resposta.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    const problema: ProblemDetail = {
      title: "API indisponível",
      status: 503,
      detail: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
    return NextResponse.json(problema, { status: 503 });
  }
}
