import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Cabecalho } from "./Cabecalho";

describe("Cabecalho", () => {
  it("deve propagar a busca após o atraso de digitação", async () => {
    const usuario = userEvent.setup();
    const aoBuscar = vi.fn();
    render(<Cabecalho busca="" aoBuscar={aoBuscar} aoNovaTarefa={vi.fn()} aoAbrirMenu={vi.fn()} atrasoMs={20} />);

    await usuario.type(screen.getByLabelText("Buscar tarefas"), "luz");

    await waitFor(() => expect(aoBuscar).toHaveBeenCalledWith("luz"));
    expect(aoBuscar).toHaveBeenCalledTimes(1);
  });

  it("deve sincronizar o campo quando a busca externa mudar e não repropagar valor igual", () => {
    const aoBuscar = vi.fn();
    const { rerender } = render(<Cabecalho busca="a" aoBuscar={aoBuscar} aoNovaTarefa={vi.fn()} aoAbrirMenu={vi.fn()} atrasoMs={5} />);
    rerender(<Cabecalho busca="lampada" aoBuscar={aoBuscar} aoNovaTarefa={vi.fn()} aoAbrirMenu={vi.fn()} atrasoMs={5} />);
    expect(screen.getByLabelText("Buscar tarefas")).toHaveValue("lampada");
    expect(aoBuscar).not.toHaveBeenCalled();
  });

  it("deve abrir nova tarefa pelo botão de destaque", async () => {
    const usuario = userEvent.setup();
    const aoNovaTarefa = vi.fn();
    render(<Cabecalho busca="" aoBuscar={vi.fn()} aoNovaTarefa={aoNovaTarefa} aoAbrirMenu={vi.fn()} />);
    await usuario.click(screen.getByRole("button", { name: "Nova Tarefa" }));
    expect(aoNovaTarefa).toHaveBeenCalled();
  });

  it("deve abrir o menu pelo botão ☰", async () => {
    const usuario = userEvent.setup();
    const aoAbrirMenu = vi.fn();
    render(<Cabecalho busca="" aoBuscar={vi.fn()} aoNovaTarefa={vi.fn()} aoAbrirMenu={aoAbrirMenu} />);
    await usuario.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(aoAbrirMenu).toHaveBeenCalled();
  });
});
