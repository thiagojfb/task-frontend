import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { FiltroSituacao } from "@/tipos/api";
import { ResumoCompacto } from "./ResumoCompacto";

const resumo = { mes: 9, ano: 2026, totalAGastar: 1250, totalFormatado: "R$ 1.250,00" };

describe("ResumoCompacto", () => {
  it("deve exibir o filtro ativo e o total do mês, abrindo o menu ao tocar", async () => {
    const usuario = userEvent.setup();
    const aoAbrirMenu = vi.fn();
    render(<ResumoCompacto filtro="CONCLUIDAS" resumo={resumo} aoAbrirMenu={aoAbrirMenu} />);

    const faixa = screen.getByRole("button");
    expect(faixa).toHaveTextContent("Concluídas");
    expect(faixa).toHaveTextContent("No mês:R$ 1.250,00");
    await usuario.click(faixa);
    expect(aoAbrirMenu).toHaveBeenCalled();
  });

  it("deve exibir um esqueleto enquanto o total carrega", () => {
    render(<ResumoCompacto filtro="TODAS" carregandoResumo aoAbrirMenu={vi.fn()} />);
    expect(screen.getByTestId("carregando-resumo-compacto")).toBeInTheDocument();
  });

  it("deve exibir 'Todas' quando o filtro for desconhecido", () => {
    render(<ResumoCompacto filtro={"OUTRO" as FiltroSituacao} resumo={resumo} aoAbrirMenu={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Todas");
  });
});
