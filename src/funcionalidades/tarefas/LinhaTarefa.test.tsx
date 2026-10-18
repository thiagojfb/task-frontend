import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Tarefa } from "@/tipos/api";
import { LinhaTarefa, type AcoesTarefa } from "./LinhaTarefa";

const base: Tarefa = {
  id: "t1",
  descricao: "Pagar conta de luz",
  prioridade: "ALTA",
  situacao: "ABERTA",
  dataAbertura: "2026-09-19T10:15:30",
  dataPrevistaConclusao: "2026-09-30",
  dataConclusaoReal: null,
  valor: 250,
  posicao: 1,
  atrasada: false,
};

function acoesFalsas(): AcoesTarefa {
  return {
    aoEditar: vi.fn(),
    aoConcluir: vi.fn(),
    aoReabrir: vi.fn(),
    aoMoverTopo: vi.fn(),
    aoMoverFinal: vi.fn(),
    aoExcluir: vi.fn(),
  };
}

function renderizar(tarefa: Tarefa, acoes = acoesFalsas()) {
  render(
    <TooltipProvider>
      <ul>
        <LinhaTarefa tarefa={tarefa} {...acoes} />
      </ul>
    </TooltipProvider>,
  );
  return acoes;
}

describe("LinhaTarefa", () => {
  it("deve exibir descrição, prioridade, datas e valor em destaque quando maior que zero", () => {
    renderizar(base);
    expect(screen.getByText("Pagar conta de luz")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Aberta em 19/09/2026")).toBeInTheDocument();
    expect(screen.getByTestId("prazo")).toHaveTextContent("30/09/2026");
    expect(screen.getByTestId("prazo")).not.toHaveClass("text-red-600");
    expect(screen.getByTestId("valor")).toHaveTextContent("R$ 250,00");
    expect(screen.getByTestId("valor")).toHaveClass("text-emerald-700");
    expect(screen.getByLabelText("Arrastar tarefa Pagar conta de luz")).toBeInTheDocument();
  });

  it("deve exibir valor zero de forma discreta e prazo ausente como 'Sem prazo'", () => {
    renderizar({ ...base, valor: 0, dataPrevistaConclusao: null });
    expect(screen.getByTestId("valor")).toHaveTextContent("—");
    expect(screen.getByTestId("valor")).not.toHaveClass("text-emerald-700");
    expect(screen.getByTestId("prazo")).toHaveTextContent("Sem prazo");
  });

  it("deve pintar o prazo de vermelho quando atrasada", () => {
    renderizar({ ...base, atrasada: true, dataPrevistaConclusao: "2026-09-01" });
    const prazo = screen.getByTestId("prazo");
    expect(prazo).toHaveClass("text-red-600");
    expect(prazo).toHaveAttribute("title", "Atrasada");
    expect(prazo).toHaveTextContent("(atrasada)");
  });

  it("deve mostrar Concluir em tarefa aberta e Reabrir em concluída, com riscado e data real", async () => {
    const usuario = userEvent.setup();
    const acoesAberta = renderizar(base);
    await usuario.click(screen.getByLabelText("Concluir"));
    expect(acoesAberta.aoConcluir).toHaveBeenCalledWith("t1");
    expect(screen.queryByLabelText("Reabrir")).not.toBeInTheDocument();
  });

  it("deve permitir reabrir tarefa concluída e exibir data de conclusão", async () => {
    const usuario = userEvent.setup();
    const acoes = renderizar({ ...base, situacao: "CONCLUIDA", dataConclusaoReal: "2026-09-20T09:00:00" });
    expect(screen.getByText("Pagar conta de luz")).toHaveClass("line-through");
    expect(screen.getByText("Concluída em 20/09/2026")).toBeInTheDocument();
    await usuario.click(screen.getByLabelText("Reabrir"));
    expect(acoes.aoReabrir).toHaveBeenCalledWith("t1");
  });

  it("deve disparar mover para topo/final e editar", async () => {
    const usuario = userEvent.setup();
    const acoes = renderizar(base);
    await usuario.click(screen.getByLabelText("Mover para o topo"));
    await usuario.click(screen.getByLabelText("Mover para o final"));
    await usuario.click(screen.getByLabelText("Editar"));
    expect(acoes.aoMoverTopo).toHaveBeenCalledWith("t1");
    expect(acoes.aoMoverFinal).toHaveBeenCalledWith("t1");
    expect(acoes.aoEditar).toHaveBeenCalledWith(base);
  });

  it("deve excluir somente após confirmar no popover, e cancelar sem excluir", async () => {
    const usuario = userEvent.setup();
    const acoes = renderizar(base);

    await usuario.click(screen.getByLabelText("Excluir tarefa Pagar conta de luz"));
    expect(await screen.findByText("Excluir esta tarefa?")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(acoes.aoExcluir).not.toHaveBeenCalled();

    await usuario.click(screen.getByLabelText("Excluir tarefa Pagar conta de luz"));
    await usuario.click(await screen.findByRole("button", { name: "Excluir" }));
    expect(acoes.aoExcluir).toHaveBeenCalledWith("t1");
  });

  it("deve desabilitar as ações quando ocupado", () => {
    render(
      <TooltipProvider>
        <ul>
          <LinhaTarefa tarefa={base} {...acoesFalsas()} ocupado />
        </ul>
      </TooltipProvider>,
    );
    expect(screen.getByLabelText("Concluir")).toBeDisabled();
    expect(screen.getByLabelText("Excluir tarefa Pagar conta de luz")).toBeDisabled();
  });
});
