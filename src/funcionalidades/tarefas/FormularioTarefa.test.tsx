import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Tarefa } from "@/tipos/api";
import { FormularioTarefa } from "./FormularioTarefa";

const tarefa: Tarefa = {
  id: "1",
  descricao: "Pagar luz",
  prioridade: "ALTA",
  situacao: "ABERTA",
  dataAbertura: "2026-09-19T10:00:00",
  dataPrevistaConclusao: "2026-09-30",
  dataConclusaoReal: null,
  valor: 250,
  posicao: 1,
  atrasada: false,
};

describe("FormularioTarefa", () => {
  it("deve criar uma tarefa convertendo os campos para o corpo da API", async () => {
    const usuario = userEvent.setup();
    const aoSalvar = vi.fn();
    render(<FormularioTarefa aoSalvar={aoSalvar} aoCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Descrição"), "Comprar lâmpada");
    await usuario.selectOptions(screen.getByLabelText("Prioridade"), "BAIXA");
    await usuario.type(screen.getByLabelText("Data prevista de conclusão"), "2026-10-01");
    await usuario.type(screen.getByLabelText("Valor (R$)"), "45,90");
    await usuario.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() =>
      expect(aoSalvar).toHaveBeenCalledWith({
        descricao: "Comprar lâmpada",
        prioridade: "BAIXA",
        dataPrevistaConclusao: "2026-10-01",
        valor: 45.9,
      }),
    );
  });

  it("deve exibir erros de validação em português e não salvar", async () => {
    const usuario = userEvent.setup();
    const aoSalvar = vi.fn();
    render(<FormularioTarefa aoSalvar={aoSalvar} aoCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Valor (R$)"), "abc");
    await usuario.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(await screen.findByText("A descrição é obrigatória.")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor válido (até duas casas decimais).")).toBeInTheDocument();
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("deve preencher os campos em modo de edição e mostrar erro do servidor", async () => {
    const usuario = userEvent.setup();
    const aoSalvar = vi.fn();
    const aoCancelar = vi.fn();
    render(<FormularioTarefa tarefa={tarefa} aoSalvar={aoSalvar} aoCancelar={aoCancelar} erroServidor="Falhou no servidor" />);

    expect(screen.getByLabelText("Descrição")).toHaveValue("Pagar luz");
    expect(screen.getByLabelText("Prioridade")).toHaveValue("ALTA");
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue("250,00");
    expect(screen.getByText("Falhou no servidor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoCancelar).toHaveBeenCalled();
  });

  it("deve desabilitar os botões enquanto salva", () => {
    render(<FormularioTarefa aoSalvar={vi.fn()} aoCancelar={vi.fn()} salvando />);
    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
