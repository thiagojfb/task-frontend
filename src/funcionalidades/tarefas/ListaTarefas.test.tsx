import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Tarefa } from "@/tipos/api";
import { ListaTarefas } from "./ListaTarefas";

function tarefa(id: string, posicao: number): Tarefa {
  return {
    id,
    descricao: `Tarefa ${id}`,
    prioridade: "BAIXA",
    situacao: "ABERTA",
    dataAbertura: "2026-09-19T10:00:00",
    dataPrevistaConclusao: null,
    dataConclusaoReal: null,
    valor: 0,
    posicao,
    atrasada: false,
  };
}

const acoes = {
  aoEditar: vi.fn(),
  aoConcluir: vi.fn(),
  aoReabrir: vi.fn(),
  aoMoverTopo: vi.fn(),
  aoMoverFinal: vi.fn(),
  aoExcluir: vi.fn(),
  aoMoverPara: vi.fn(),
  aoTentarNovamente: vi.fn(),
};

function renderizar(props: Partial<React.ComponentProps<typeof ListaTarefas>>) {
  return render(
    <TooltipProvider>
      <ListaTarefas tarefas={undefined} carregando={false} erro={null} {...acoes} {...props} />
    </TooltipProvider>,
  );
}

describe("ListaTarefas", () => {
  it("deve exibir esqueletos enquanto carrega", () => {
    renderizar({ carregando: true });
    expect(screen.getByTestId("carregando-tarefas")).toBeInTheDocument();
  });

  it("deve exibir erro com botão de tentar novamente", async () => {
    const usuario = userEvent.setup();
    renderizar({ erro: "API indisponível" });
    expect(screen.getByRole("alert")).toHaveTextContent("API indisponível");
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(acoes.aoTentarNovamente).toHaveBeenCalled();
  });

  it("deve exibir estado vazio distinto para lista sem tarefas e para busca sem resultado", () => {
    const { rerender } = renderizar({ tarefas: [] });
    expect(screen.getByText("Nenhuma tarefa por aqui")).toBeInTheDocument();
    rerender(
      <TooltipProvider>
        <ListaTarefas tarefas={[]} carregando={false} erro={null} filtrada {...acoes} />
      </TooltipProvider>,
    );
    expect(screen.getByText("Nenhuma tarefa encontrada")).toBeInTheDocument();
  });

  it("deve renderizar as tarefas em ordem com alças de arrastar", () => {
    renderizar({ tarefas: [tarefa("a", 1), tarefa("b", 2), tarefa("c", 3)] });
    const itens = screen.getAllByRole("listitem");
    expect(itens.map((item) => item.getAttribute("data-testid"))).toEqual(["tarefa-a", "tarefa-b", "tarefa-c"]);
    expect(screen.getAllByLabelText(/Arrastar tarefa/)).toHaveLength(3);
  });

  it("deve mover uma tarefa com o teclado pela alça (dnd-kit)", async () => {
    const usuario = userEvent.setup();
    renderizar({ tarefas: [tarefa("a", 1), tarefa("b", 2), tarefa("c", 3)] });

    const alca = screen.getByLabelText("Arrastar tarefa Tarefa c");
    alca.focus();
    await usuario.keyboard("{Enter}");
    await usuario.keyboard("{ArrowUp}");
    await usuario.keyboard("{ArrowUp}");
    await usuario.keyboard("{Enter}");

    expect(acoes.aoMoverPara).toHaveBeenCalledWith("c", 1);
  });
});
