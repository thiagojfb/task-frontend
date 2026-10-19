export type CodigoErroAutenticacao = "credenciais_invalidas" | "indisponivel" | "sessao_expirada";

export const MENSAGENS_ERRO_AUTENTICACAO: Record<CodigoErroAutenticacao, string> = {
  credenciais_invalidas: "Usuário ou senha inválidos.",
  indisponivel: "O serviço de autenticação está indisponível. Tente novamente em instantes.",
  sessao_expirada: "Sua sessão expirou. Entre novamente.",
};

/** Traduz o código devolvido pelo Auth.js (`result.code`) em mensagem para a tela. */
export function mensagemParaCodigo(codigo: string | null | undefined): string {
  if (codigo && codigo in MENSAGENS_ERRO_AUTENTICACAO) {
    return MENSAGENS_ERRO_AUTENTICACAO[codigo as CodigoErroAutenticacao];
  }
  return MENSAGENS_ERRO_AUTENTICACAO.indisponivel;
}
