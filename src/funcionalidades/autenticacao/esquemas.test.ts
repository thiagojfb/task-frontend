import { describe, expect, it } from "vitest";
import { esquemaCadastro, esquemaLogin } from "./esquemas";

describe("esquemaLogin", () => {
  it("deve aceitar usuário e senha preenchidos, aparando espaços do usuário", () => {
    const resultado = esquemaLogin.safeParse({ usuario: "  ana ", senha: "senha123" });
    expect(resultado.success).toBe(true);
    expect(resultado.data?.usuario).toBe("ana");
  });

  it("deve exigir usuário e senha com mensagens em português", () => {
    const resultado = esquemaLogin.safeParse({ usuario: "", senha: "" });
    expect(resultado.success).toBe(false);
    const mensagens = resultado.error?.issues.map((problema) => problema.message);
    expect(mensagens).toEqual(["Informe o usuário.", "Informe a senha."]);
  });
});

describe("esquemaCadastro", () => {
  const valido = {
    nome: "Carla",
    sobrenome: "Dias",
    email: "carla@exemplo.com.br",
    usuario: "carla.dias",
    senha: "segredo123",
    confirmarSenha: "segredo123",
  };

  it("deve aceitar um cadastro válido", () => {
    expect(esquemaCadastro.safeParse(valido).success).toBe(true);
  });

  it("deve apontar cada campo inválido com a mensagem esperada", () => {
    const resultado = esquemaCadastro.safeParse({
      nome: "",
      sobrenome: "",
      email: "nao-e-email",
      usuario: "a b",
      senha: "curta",
      confirmarSenha: "curta",
    });
    expect(resultado.success).toBe(false);
    const porCampo = Object.fromEntries(
      resultado.error!.issues.map((problema) => [problema.path[0], problema.message]),
    );
    expect(porCampo).toEqual({
      nome: "O nome é obrigatório.",
      sobrenome: "O sobrenome é obrigatório.",
      email: "O e-mail é inválido.",
      usuario: "O nome de usuário deve ter de 3 a 50 caracteres (letras, números, ponto, hífen ou sublinhado).",
      senha: "A senha deve ter entre 8 e 128 caracteres.",
    });
  });

  it("deve exigir e-mail quando estiver em branco", () => {
    const resultado = esquemaCadastro.safeParse({ ...valido, email: "   " });
    expect(resultado.error?.issues[0].message).toBe("O e-mail é obrigatório.");
  });

  it("deve rejeitar senhas diferentes", () => {
    const resultado = esquemaCadastro.safeParse({ ...valido, confirmarSenha: "outra-senha" });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: ["confirmarSenha"], message: "As senhas não coincidem." });
  });
});
