import { describe, expect, it } from "vitest";
import type { Tarefa } from "@/tipos/api";
import { posicaoDe, reordenarLocalmente } from "./ordenacao";

function tarefa(id: string, posicao: number): Tarefa {
  return {
    id,
    descricao: `T${id}`,
    prioridade: "MEDIA",
    situacao: "ABERTA",
    dataAbertura: "2026-09-19T10:00:00",
    dataPrevistaConclusao: null,
    dataConclusaoReal: null,
    valor: 0,
    posicao,
    atrasada: false,
  };
}

const lista = [tarefa("1", 1), tarefa("2", 2), tarefa("3", 3), tarefa("4", 4), tarefa("5", 5)];
const ordem = (tarefas: Tarefa[]) => tarefas.map((item) => `${item.id}:${item.posicao}`);

describe("reordenarLocalmente", () => {
  it("deve mover para o topo deslocando as anteriores", () => {
    expect(ordem(reordenarLocalmente(lista, "5", "TOPO"))).toEqual(["5:1", "1:2", "2:3", "3:4", "4:5"]);
  });

  it("deve mover para o final deslocando as seguintes", () => {
    expect(ordem(reordenarLocalmente(lista, "1", "FINAL"))).toEqual(["2:1", "3:2", "4:3", "5:4", "1:5"]);
  });

  it("deve mover para posição específica", () => {
    expect(ordem(reordenarLocalmente(lista, "4", "POSICAO", 2))).toEqual(["1:1", "4:2", "2:3", "3:4", "5:5"]);
  });

  it("deve devolver a lista original para id desconhecido, posição inválida ou mesma posição", () => {
    expect(reordenarLocalmente(lista, "99", "TOPO")).toBe(lista);
    expect(reordenarLocalmente(lista, "1", "POSICAO", 0)).toBe(lista);
    expect(reordenarLocalmente(lista, "1", "POSICAO", 6)).toBe(lista);
    expect(reordenarLocalmente(lista, "1", "POSICAO", null)).toBe(lista);
    expect(reordenarLocalmente(lista, "3", "POSICAO", 3)).toBe(lista);
  });

  it("deve ordenar por posição antes de mover, mesmo com a lista fora de ordem", () => {
    const embaralhada = [lista[2], lista[0], lista[4], lista[1], lista[3]];
    expect(ordem(reordenarLocalmente(embaralhada, "5", "TOPO"))).toEqual(["5:1", "1:2", "2:3", "3:4", "4:5"]);
  });
});

describe("posicaoDe", () => {
  it("deve devolver a posição ou null", () => {
    expect(posicaoDe(lista, "3")).toBe(3);
    expect(posicaoDe(lista, "x")).toBeNull();
  });
});
