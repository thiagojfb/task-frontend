import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagPrioridade } from "./TagPrioridade";

describe("TagPrioridade", () => {
  it.each([
    ["ALTA", "Alta", "text-red-800"],
    ["MEDIA", "Média", "text-amber-800"],
    ["BAIXA", "Baixa", "text-blue-800"],
  ] as const)("deve exibir %s como \"%s\" com a cor correta", (prioridade, rotulo, classe) => {
    render(<TagPrioridade prioridade={prioridade} />);
    const tag = screen.getByText(rotulo);
    expect(tag).toHaveClass(classe);
    expect(tag).toHaveAttribute("aria-label", `Prioridade ${rotulo}`);
  });
});
