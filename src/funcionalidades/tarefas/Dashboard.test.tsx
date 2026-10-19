import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErroApi } from "@/lib/erros";
import type { Tarefa } from "@/tipos/api";

vi.mock("./api");
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import * as api from "./api";
import { Dashboard } from "./Dashboard";

const apiFalsa = vi.mocked(api);

function tarefa(id: string, posicao: number, extras: Partial<Tarefa> = {}): Tarefa {
  return {
    id,
    descricao: `Tarefa ${id}`,
    prioridade: "MEDIA",
    situacao: "ABERTA",
    dataAbertura: "2026-09-19T10:00:00",
    dataPrevistaConclusao: null,
    dataConclusaoReal: null,
    valor: 0,
    posicao,
    atrasada: false,
    ...extras,
  };
}

function renderizar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={cliente}>
      <TooltipProvider>
        <Dashboard nomeUsuario="Ana Silva" />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiFalsa.listarTarefas.mockResolvedValue([tarefa("1", 1), tarefa("2", 2, { situacao: "CONCLUIDA" })]);
    apiFalsa.obterResumoFinanceiro.mockResolvedValue({ mes: 9, ano: 2026, totalAGastar: 10, totalFormatado: "R$ 10,00" });
    apiFalsa.obterPreferencias.mockResolvedValue({ filtro: "TODAS" });
    apiFalsa.salvarPreferencias.mockImplementation(async (preferencias) => preferencias);
  });

  it("deve compor barra lateral, cabeçalho e lista com os dados da API", async () => {
    renderizar();
    expect(await screen.findByText("Tarefa 1")).toBeInTheDocument();
    // Barra lateral (telas maiores) e resumo compacto (celular)
    await waitFor(() => expect(screen.getAllByText("R$ 10,00")).toHaveLength(2));
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(apiFalsa.listarTarefas).toHaveBeenCalledWith("TODAS", "");
  });

  it("deve abrir a barra lateral como menu no celular e fechá-lo ao escolher um filtro", async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText("Tarefa 1");

    await usuario.click(screen.getByRole("button", { name: "Abrir menu" }));
    const menu = await screen.findByRole("dialog", { name: "Menu" });
    await usuario.click(within(menu).getByRole("button", { name: "Concluídas" }));

    await waitFor(() => expect(apiFalsa.listarTarefas).toHaveBeenCalledWith("CONCLUIDAS", ""));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument());
  });

  it("deve abrir o menu também pelo resumo compacto do celular", async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText("Tarefa 1");

    await usuario.click(screen.getByRole("button", { name: /No mês/ }));
    expect(await screen.findByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("deve refazer a busca ao trocar o filtro e gravar a preferência na API", async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText("Tarefa 1");
    await usuario.click(screen.getByRole("button", { name: "Abertas" }));
    await waitFor(() => expect(apiFalsa.listarTarefas).toHaveBeenCalledWith("ABERTAS", ""));
    await waitFor(() =>
      expect(apiFalsa.salvarPreferencias).toHaveBeenCalledWith({ filtro: "ABERTAS" }, expect.anything()),
    );
  });

  it("deve restaurar o filtro preferido vindo da API ao abrir o dashboard", async () => {
    apiFalsa.obterPreferencias.mockResolvedValue({ filtro: "CONCLUIDAS" });
    renderizar();
    await waitFor(() => expect(apiFalsa.listarTarefas).toHaveBeenCalledWith("CONCLUIDAS", ""));
    expect(screen.getByRole("button", { name: "Concluídas" })).toHaveAttribute("aria-pressed", "true");
    expect(apiFalsa.listarTarefas).not.toHaveBeenCalledWith("TODAS", "");
  });

  it("deve concluir, reabrir, mover e excluir com notificações", async () => {
    const usuario = userEvent.setup();
    apiFalsa.concluirTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.reabrirTarefa.mockResolvedValue(tarefa("2", 2));
    apiFalsa.moverTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.excluirTarefa.mockResolvedValue(undefined);
    renderizar();
    await screen.findByText("Tarefa 1");

    await usuario.click(screen.getByLabelText("Concluir"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Tarefa concluída."));
    await usuario.click(screen.getByLabelText("Reabrir"));
    await waitFor(() => expect(apiFalsa.reabrirTarefa).toHaveBeenCalledWith("2", expect.anything()));
    await usuario.click(screen.getAllByLabelText("Mover para o topo")[1]);
    await waitFor(() => expect(apiFalsa.moverTarefa).toHaveBeenCalledWith("2", { destino: "TOPO" }));
    await usuario.click(screen.getAllByLabelText("Mover para o final")[0]);
    await waitFor(() => expect(apiFalsa.moverTarefa).toHaveBeenCalledWith("1", { destino: "FINAL" }));

    await usuario.click(screen.getByLabelText("Excluir tarefa Tarefa 1"));
    await usuario.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Tarefa excluída."));
  });

  it("deve notificar erro quando uma ação falhar", async () => {
    const usuario = userEvent.setup();
    apiFalsa.concluirTarefa.mockRejectedValue(new Error("Falhou"));
    renderizar();
    await screen.findByText("Tarefa 1");
    await usuario.click(screen.getByLabelText("Concluir"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Falhou"));
  });

  it("deve abrir o drawer de nova tarefa e criar pela API", async () => {
    const usuario = userEvent.setup();
    apiFalsa.criarTarefa.mockResolvedValue(tarefa("3", 3));
    renderizar();
    await screen.findByText("Tarefa 1");

    await usuario.click(screen.getByRole("button", { name: "Nova Tarefa" }));
    await usuario.type(await screen.findByLabelText("Descrição"), "Ler livro");
    await usuario.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() => expect(apiFalsa.criarTarefa).toHaveBeenCalledWith(expect.objectContaining({ descricao: "Ler livro" }), expect.anything()));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Tarefa criada."));
  });

  it("deve abrir o drawer de edição pela linha e salvar alterações", async () => {
    const usuario = userEvent.setup();
    apiFalsa.editarTarefa.mockResolvedValue(tarefa("1", 1));
    apiFalsa.listarHistorico.mockResolvedValue([]);
    renderizar();
    await screen.findByText("Tarefa 1");

    await usuario.click(screen.getAllByLabelText("Editar")[0]);
    expect(await screen.findByRole("heading", { name: "Editar tarefa" })).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(apiFalsa.editarTarefa).toHaveBeenCalledWith("1", expect.objectContaining({ descricao: "Tarefa 1" })));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Tarefa atualizada."));
  });

  it("deve encerrar a sessão quando a API responder 401", async () => {
    apiFalsa.listarTarefas.mockRejectedValue(new ErroApi(401, { title: "Não autenticado" }));
    renderizar();
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" }));
  });

  it("deve exibir erro de carregamento com opção de tentar novamente", async () => {
    const usuario = userEvent.setup();
    apiFalsa.listarTarefas.mockRejectedValueOnce(new Error("API indisponível")).mockResolvedValue([tarefa("1", 1)]);
    renderizar();
    expect(await screen.findByRole("alert")).toHaveTextContent("API indisponível");
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Tarefa 1")).toBeInTheDocument();
  });
});
