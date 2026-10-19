import type { DestinoMovimento, Tarefa } from "@/tipos/api";

/**
 * Aplica localmente um movimento (mesma regra da API) para atualização otimista da lista:
 * devolve uma nova lista com posições contínuas 1..N.
 */
export function reordenarLocalmente(
  tarefas: Tarefa[],
  id: string,
  destino: DestinoMovimento,
  posicao?: number | null,
): Tarefa[] {
  const ordenadas = [...tarefas].sort((a, b) => a.posicao - b.posicao);
  const indiceOrigem = ordenadas.findIndex((tarefa) => tarefa.id === id);
  if (indiceOrigem < 0) {
    return tarefas;
  }
  const total = ordenadas.length;
  let indiceDestino: number;
  if (destino === "TOPO") {
    indiceDestino = 0;
  } else if (destino === "FINAL") {
    indiceDestino = total - 1;
  } else {
    if (!posicao || posicao < 1 || posicao > total) {
      return tarefas;
    }
    indiceDestino = posicao - 1;
  }
  if (indiceDestino === indiceOrigem) {
    return tarefas;
  }
  const [movida] = ordenadas.splice(indiceOrigem, 1);
  ordenadas.splice(indiceDestino, 0, movida);
  return ordenadas.map((tarefa, indice) => ({ ...tarefa, posicao: indice + 1 }));
}

/** Posição (1..N) da tarefa cujo id foi informado, ou null. */
export function posicaoDe(tarefas: Tarefa[], id: string): number | null {
  const tarefa = tarefas.find((item) => item.id === id);
  return tarefa ? tarefa.posicao : null;
}
