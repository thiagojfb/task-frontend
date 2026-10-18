import { describe, expect, it } from "vitest";
import type { Tarefa } from "@/tipos/api";
import { esquemaTarefa, paraRequisicao, valoresIniciais } from "./esquemas";

const tarefa: Tarefa = {
  id: "1",
  descricao: "Pagar luz",
  prioridade: "ALTA",
  situacao: "ABERTA",
  dataAbertura: "2026-09-19T10:00:00",
  dataPrevistaConclusao: "2026-09-30",
  dataConclusaoReal: null,
  valor: 250.5,
  posicao: 1,
  atrasada: false,
};

describe("esquemaTarefa", () => {
  it("deve aceitar dados válidos e apontar os inválidos em português", () => {
    expect(esquemaTarefa.safeParse({ descricao: "x", prioridade: "ALTA", dataPrevistaConclusao: "", valor: "" }).success).toBe(true);
    expect(esquemaTarefa.safeParse({ descricao: "x", prioridade: "BAIXA", dataPrevistaConclusao: "2026-09-30", valor: "1.250,00" }).success).toBe(true);

    const invalido = esquemaTarefa.safeParse({ descricao: "  ", prioridade: "URGENTE", dataPrevistaConclusao: "30/09", valor: "abc" });
    const porCampo = Object.fromEntries(invalido.error!.issues.map((problema) => [problema.path[0], problema.message]));
    expect(porCampo).toEqual({
      descricao: "A descrição é obrigatória.",
      prioridade: "A prioridade é obrigatória.",
      dataPrevistaConclusao: "Informe uma data válida.",
      valor: "Informe um valor válido (até duas casas decimais).",
    });
  });

  it("deve limitar a descrição a 500 caracteres", () => {
    const resultado = esquemaTarefa.safeParse({ descricao: "x".repeat(501), prioridade: "ALTA", dataPrevistaConclusao: "", valor: "" });
    expect(resultado.error?.issues[0].message).toBe("A descrição deve ter no máximo 500 caracteres.");
  });
});

describe("valoresIniciais e paraRequisicao", () => {
  it("deve iniciar vazio para criação e preenchido para edição", () => {
    expect(valoresIniciais(null)).toEqual({ descricao: "", prioridade: "MEDIA", dataPrevistaConclusao: "", valor: "" });
    expect(valoresIniciais(tarefa)).toEqual({ descricao: "Pagar luz", prioridade: "ALTA", dataPrevistaConclusao: "2026-09-30", valor: "250,50" });
    expect(valoresIniciais({ ...tarefa, valor: 0, dataPrevistaConclusao: null }).valor).toBe("");
  });

  it("deve converter o formulário no corpo da API", () => {
    expect(paraRequisicao({ descricao: " Comprar lâmpada ", prioridade: "MEDIA", dataPrevistaConclusao: "", valor: "45,90" })).toEqual({
      descricao: "Comprar lâmpada",
      prioridade: "MEDIA",
      dataPrevistaConclusao: null,
      valor: 45.9,
    });
    expect(paraRequisicao({ descricao: "x", prioridade: "BAIXA", dataPrevistaConclusao: "2026-10-01", valor: "" }).valor).toBe(0);
  });
});
