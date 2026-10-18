import type { Prioridade, Situacao } from "@/tipos/api";

const FORMATO_MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Ex.: 1250 → "R$ 1.250,00" (com espaço comum, como a API). */
export function formatarMoeda(valor: number | null | undefined): string {
  return FORMATO_MOEDA.format(valor ?? 0).replace(/ /g, " ");
}

/** "2026-09-30" → "30/09/2026"; nulo → "—". */
export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) {
    return "—";
  }
  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "2026-09-15T14:32:10" → "15/09/2026 14:32". */
export function formatarDataHora(dataHoraIso: string | null | undefined): string {
  if (!dataHoraIso) {
    return "—";
  }
  const [data, hora = ""] = dataHoraIso.split("T");
  return `${formatarData(data)} ${hora.slice(0, 5)}`.trim();
}

export const ROTULO_PRIORIDADE: Record<Prioridade, string> = { ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" };
export const ROTULO_SITUACAO: Record<Situacao, string> = { ABERTA: "Aberta", CONCLUIDA: "Concluída" };

/** Classes Tailwind da tag de prioridade (Alta vermelho, Média amarelo, Baixa azul). */
export const CLASSES_PRIORIDADE: Record<Prioridade, string> = {
  ALTA: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200",
  MEDIA: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200",
  BAIXA: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200",
};

/** Converte texto digitado ("45,90", "1.250,00", "10") em número com duas casas; vazio → 0. */
export function interpretarValor(texto: string | number | null | undefined): number {
  if (texto === null || texto === undefined || texto === "") {
    return 0;
  }
  if (typeof texto === "number") {
    return Math.round(texto * 100) / 100;
  }
  const normalizado = texto.trim().replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : 0;
}
