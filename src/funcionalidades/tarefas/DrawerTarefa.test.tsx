import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Tarefa } from "@/tipos/api";

vi.mock("./api");

import * as api from "./api";
import { DrawerTarefa } from "./DrawerTarefa";

const apiFalsa = vi.mocked(api);

const tarefa: Tarefa = {
  id: "1",
  descricao: "Pagar luz",
  prioridade: "ALTA",
  situacao: "ABERTA",
  dataAbertura: "2026-09-19T10:00:00",
  dataPrevistaConclusao: null,
  dataConclusaoReal: null,
  valor: 0,
  posicao: 1,
  atrasada: false,
};

function renderizar(props: Partial<React.ComponentProps<typeof DrawerTarefa>>) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const aoFechar = vi.fn();
  const aoSalvar = vi.fn().mockResolvedValue(undefined);
  render(
    <QueryClientProvider client={cliente}>
      <DrawerTarefa aberto tarefa={null} aoFechar={aoFechar} aoSalvar={aoSalvar} {...props} />
    </QueryClientProvider>,
  );
  return { aoFechar, aoSalvar };
}

describe("DrawerTarefa", () => {
  it("deve criar tarefa e fechar ao salvar com sucesso", async () => {
    const usuario = userEvent.setup();
    const { aoFechar, aoSalvar } = renderizar({});

    expect(screen.getByRole("heading", { name: "Nova tarefa" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Histórico" })).not.toBeInTheDocument();
    await usuario.type(screen.getByLabelText("Descrição"), "Ler livro");
    await usuario.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({ descricao: "Ler livro" })));
    await waitFor(() => expect(aoFechar).toHaveBeenCalled());
  });

  it("deve exibir a mensagem do servidor quando salvar falhar e manter o drawer aberto", async () => {
    const usuario = userEvent.setup();
    const { aoFechar } = renderizar({ aoSalvar: vi.fn().mockRejectedValue(new Error("Dados inválidos na API")) });

    await usuario.type(screen.getByLabelText("Descrição"), "Ler livro");
    await usuario.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(await screen.findByText("Dados inválidos na API")).toBeInTheDocument();
    expect(aoFechar).not.toHaveBeenCalled();
  });

  it("em edição deve mostrar as abas e carregar o histórico da tarefa", async () => {
    const usuario = userEvent.setup();
    apiFalsa.listarHistorico.mockResolvedValue([
      { id: "h1", usuarioNome: "Ana", dataHora: "2026-09-15T10:00:00", tipo: "CRIACAO", campo: null, valorAnterior: null, valorNovo: null, descricao: "Criada por Ana em 15/09/2026" },
    ]);
    renderizar({ tarefa });

    expect(screen.getByRole("heading", { name: "Editar tarefa" })).toBeInTheDocument();
    await usuario.click(screen.getByRole("tab", { name: "Histórico" }));
    expect(await screen.findByText("Criada por Ana em 15/09/2026")).toBeInTheDocument();
    expect(apiFalsa.listarHistorico).toHaveBeenCalledWith("1");
  });

  it("deve exibir erro ao falhar o carregamento do histórico", async () => {
    const usuario = userEvent.setup();
    apiFalsa.listarHistorico.mockRejectedValue(new Error("Histórico indisponível"));
    renderizar({ tarefa });
    await usuario.click(screen.getByRole("tab", { name: "Histórico" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Histórico indisponível");
  });

  it("deve fechar pelo botão de fechar do drawer", async () => {
    const usuario = userEvent.setup();
    const { aoFechar } = renderizar({});
    await usuario.click(screen.getByRole("button", { name: /close|fechar/i }));
    expect(aoFechar).toHaveBeenCalled();
  });
});
