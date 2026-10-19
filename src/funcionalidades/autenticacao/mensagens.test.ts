import { describe, expect, it } from "vitest";
import { mensagemParaCodigo } from "./mensagens";

describe("mensagemParaCodigo", () => {
  it("deve traduzir códigos conhecidos e usar indisponibilidade como padrão", () => {
    expect(mensagemParaCodigo("credenciais_invalidas")).toBe("Usuário ou senha inválidos.");
    expect(mensagemParaCodigo("sessao_expirada")).toBe("Sua sessão expirou. Entre novamente.");
    expect(mensagemParaCodigo("desconhecido")).toContain("indisponível");
    expect(mensagemParaCodigo(null)).toContain("indisponível");
  });
});
