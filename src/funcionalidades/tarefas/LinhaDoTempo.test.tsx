import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinhaDoTempo } from "./LinhaDoTempo";

describe("LinhaDoTempo", () => {
  it("deve exibir os registros com frase e data/hora", () => {
    render(
      <LinhaDoTempo
        registros={[
          {
            id: "a",
            usuarioNome: "Ana Silva",
            dataHora: "2026-09-15T14:32:10",
            tipo: "ALTERACAO",
            campo: "valor",
            valorAnterior: "R$ 50,00",
            valorNovo: "R$ 70,00",
            descricao: "Modificado por Ana Silva em 15/09/2026 - Alterou valor de R$ 50,00 para R$ 70,00",
          },
          { id: "b", usuarioNome: "Ana Silva", dataHora: "2026-09-15T10:00:00", tipo: "CRIACAO", campo: null, valorAnterior: null, valorNovo: null, descricao: "Criada por Ana Silva em 15/09/2026" },
          { id: "c", usuarioNome: "Ana", dataHora: "2026-09-16T10:00:00", tipo: "CONCLUSAO", campo: "situacao", valorAnterior: "Aberta", valorNovo: "Concluída", descricao: "Concluída por Ana em 16/09/2026" },
          { id: "d", usuarioNome: "Ana", dataHora: "2026-09-17T10:00:00", tipo: "REABERTURA", campo: "situacao", valorAnterior: "Concluída", valorNovo: "Aberta", descricao: "Reaberta por Ana em 17/09/2026" },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText(/Alterou valor de R\$ 50,00 para R\$ 70,00/)).toBeInTheDocument();
    expect(screen.getByText("15/09/2026 14:32")).toBeInTheDocument();
  });

  it("deve exibir carregando, vazio e erro", () => {
    const { rerender } = render(<LinhaDoTempo carregando />);
    expect(screen.getByTestId("carregando-historico")).toBeInTheDocument();
    rerender(<LinhaDoTempo registros={[]} />);
    expect(screen.getByText("Nenhum registro no histórico.")).toBeInTheDocument();
    rerender(<LinhaDoTempo erro="Falha ao carregar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Falha ao carregar");
  });
});
