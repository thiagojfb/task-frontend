import { z } from "zod";
import type { Tarefa, TarefaRequisicao } from "@/tipos/api";
import { interpretarValor } from "./formatadores";

export const esquemaTarefa = z.object({
  descricao: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória.")
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
  prioridade: z.enum(["ALTA", "MEDIA", "BAIXA"], { message: "A prioridade é obrigatória." }),
  dataPrevistaConclusao: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Informe uma data válida."),
  valor: z
    .string()
    .trim()
    .regex(/^(\d{1,3}(\.\d{3})*|\d+)?([.,]\d{1,2})?$/, "Informe um valor válido (até duas casas decimais)."),
});

export type DadosFormularioTarefa = z.infer<typeof esquemaTarefa>;

/** Valores iniciais do formulário unificado (criação ou edição). */
export function valoresIniciais(tarefa?: Tarefa | null): DadosFormularioTarefa {
  if (!tarefa) {
    return { descricao: "", prioridade: "MEDIA", dataPrevistaConclusao: "", valor: "" };
  }
  return {
    descricao: tarefa.descricao,
    prioridade: tarefa.prioridade,
    dataPrevistaConclusao: tarefa.dataPrevistaConclusao ?? "",
    valor: tarefa.valor > 0 ? tarefa.valor.toFixed(2).replace(".", ",") : "",
  };
}

/** Converte os dados do formulário no corpo esperado pela API. */
export function paraRequisicao(dados: DadosFormularioTarefa): TarefaRequisicao {
  return {
    descricao: dados.descricao.trim(),
    prioridade: dados.prioridade,
    dataPrevistaConclusao: dados.dataPrevistaConclusao || null,
    valor: interpretarValor(dados.valor),
  };
}
