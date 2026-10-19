import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));

import { signOut } from "next-auth/react";
import { BarraLateral } from "./BarraLateral";

describe("BarraLateral", () => {
  it("deve destacar o filtro ativo e disparar a troca de filtro", async () => {
    const usuario = userEvent.setup();
    const aoFiltrar = vi.fn();
    render(<BarraLateral filtro="ABERTAS" aoFiltrar={aoFiltrar} nomeUsuario="Ana Silva" />);

    expect(screen.getByRole("button", { name: "Abertas" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "false");
    await usuario.click(screen.getByRole("button", { name: "Concluídas" }));
    expect(aoFiltrar).toHaveBeenCalledWith("CONCLUIDAS");
  });

  it("deve exibir o total do mês ou um esqueleto enquanto carrega", () => {
    const { rerender } = render(
      <BarraLateral filtro="TODAS" aoFiltrar={vi.fn()} nomeUsuario="Ana" carregandoResumo />,
    );
    expect(screen.getByTestId("carregando-resumo")).toBeInTheDocument();

    rerender(
      <BarraLateral
        filtro="TODAS"
        aoFiltrar={vi.fn()}
        nomeUsuario="Ana"
        resumo={{ mes: 9, ano: 2026, totalAGastar: 1250, totalFormatado: "R$ 1.250,00" }}
      />,
    );
    expect(screen.getByText("R$ 1.250,00")).toBeInTheDocument();
    expect(screen.getByText("Total a gastar neste mês")).toBeInTheDocument();
  });

  it("deve mostrar o nome do usuário e sair pelo Auth.js por padrão", async () => {
    const usuario = userEvent.setup();
    render(<BarraLateral filtro="TODAS" aoFiltrar={vi.fn()} nomeUsuario="Ana Silva" />);
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Sair" }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("deve usar a ação de sair informada quando fornecida", async () => {
    const usuario = userEvent.setup();
    const aoSair = vi.fn();
    render(<BarraLateral filtro="TODAS" aoFiltrar={vi.fn()} nomeUsuario="Ana" aoSair={aoSair} />);
    await usuario.click(screen.getByRole("button", { name: "Sair" }));
    expect(aoSair).toHaveBeenCalled();
  });
});
