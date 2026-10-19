import { describe, expect, it } from "vitest";
import { ErroApi, MENSAGEM_ERRO_GENERICO, lancarSeErro, mensagemDeErro, mensagemDoProblema } from "./erros";

describe("erros", () => {
  it("deve priorizar a lista de erros de validação, depois detail, depois title", () => {
    expect(
      mensagemDoProblema({ erros: [{ campo: "descricao", mensagem: "A descrição é obrigatória." }] }, 400),
    ).toBe("A descrição é obrigatória.");
    expect(mensagemDoProblema({ detail: "Detalhe", title: "Título" }, 400)).toBe("Detalhe");
    expect(mensagemDoProblema({ title: "Título" }, 400)).toBe("Título");
    expect(mensagemDoProblema({ erros: [] , title: "Só título" }, 400)).toBe("Só título");
  });

  it("deve gerar mensagem padrão para 401 e para outros status sem corpo", () => {
    expect(mensagemDoProblema(null, 401)).toBe("Sua sessão expirou. Entre novamente.");
    expect(mensagemDoProblema(undefined, 500)).toBe(`${MENSAGEM_ERRO_GENERICO} (código 500)`);
  });

  it("deve extrair a mensagem de erros e usar fallback para valores desconhecidos", () => {
    expect(mensagemDeErro(new Error("Falhou"))).toBe("Falhou");
    expect(mensagemDeErro(new Error(""))).toBe(MENSAGEM_ERRO_GENERICO);
    expect(mensagemDeErro("texto")).toBe(MENSAGEM_ERRO_GENERICO);
  });

  it("deve lançar ErroApi com o ProblemDetail em respostas não 2xx", async () => {
    await expect(lancarSeErro(new Response("{}", { status: 200 }))).resolves.toBeUndefined();

    const resposta = new Response(JSON.stringify({ title: "Tarefa não encontrada", detail: "Não existe." }), {
      status: 404,
    });
    await expect(lancarSeErro(resposta)).rejects.toMatchObject({
      name: "ErroApi",
      status: 404,
      message: "Não existe.",
      problema: { title: "Tarefa não encontrada" },
    });
  });

  it("deve tolerar corpo não JSON ao lançar ErroApi", async () => {
    const erro = (await lancarSeErro(new Response("html", { status: 502 })).catch(
      (capturado: unknown) => capturado,
    )) as ErroApi;
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.status).toBe(502);
    expect(erro.message).toContain("código 502");
  });
});
