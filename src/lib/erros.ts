import type { ProblemDetail } from "@/tipos/api";

export const MENSAGEM_ERRO_GENERICO = "Ocorreu um erro inesperado. Tente novamente.";

/** Erro devolvido pela API (ProblemDetail) com o status HTTP. */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    public readonly problema: ProblemDetail,
  ) {
    super(mensagemDoProblema(problema, status));
    this.name = "ErroApi";
  }
}

/** Monta uma mensagem legível a partir de um ProblemDetail. */
export function mensagemDoProblema(problema: ProblemDetail | null | undefined, status: number): string {
  if (problema?.erros && problema.erros.length > 0) {
    return problema.erros.map((erro) => erro.mensagem).join(" ");
  }
  if (problema?.detail) {
    return problema.detail;
  }
  if (problema?.title) {
    return problema.title;
  }
  return status === 401 ? "Sua sessão expirou. Entre novamente." : `${MENSAGEM_ERRO_GENERICO} (código ${status})`;
}

/** Converte qualquer erro em texto para exibição. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) {
    return erro.message;
  }
  return MENSAGEM_ERRO_GENERICO;
}

/** Lança ErroApi quando a resposta não é 2xx, lendo o ProblemDetail quando houver. */
export async function lancarSeErro(resposta: Response): Promise<void> {
  if (resposta.ok) {
    return;
  }
  let problema: ProblemDetail | null = null;
  try {
    problema = (await resposta.json()) as ProblemDetail;
  } catch {
    problema = null;
  }
  throw new ErroApi(resposta.status, problema ?? {});
}
