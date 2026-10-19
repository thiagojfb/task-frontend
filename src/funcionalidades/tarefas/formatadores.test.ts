import { describe, expect, it } from "vitest";
import { formatarData, formatarDataHora, formatarMoeda, interpretarValor } from "./formatadores";

describe("formatadores", () => {
  it("deve formatar moeda em reais com espaço comum", () => {
    expect(formatarMoeda(1250)).toBe("R$ 1.250,00");
    expect(formatarMoeda(45.9)).toBe("R$ 45,90");
    expect(formatarMoeda(null)).toBe("R$ 0,00");
  });

  it("deve formatar datas e data/hora no padrão brasileiro", () => {
    expect(formatarData("2026-09-30")).toBe("30/09/2026");
    expect(formatarData(null)).toBe("—");
    expect(formatarDataHora("2026-09-15T14:32:10.123")).toBe("15/09/2026 14:32");
    expect(formatarDataHora("2026-09-15")).toBe("15/09/2026");
    expect(formatarDataHora(undefined)).toBe("—");
  });

  it("deve interpretar valores digitados em formato brasileiro ou numérico", () => {
    expect(interpretarValor("45,90")).toBe(45.9);
    expect(interpretarValor("1.250,00")).toBe(1250);
    expect(interpretarValor("10")).toBe(10);
    expect(interpretarValor(12.345)).toBe(12.35);
    expect(interpretarValor("")).toBe(0);
    expect(interpretarValor(null)).toBe(0);
    expect(interpretarValor("abc")).toBe(0);
  });
});
