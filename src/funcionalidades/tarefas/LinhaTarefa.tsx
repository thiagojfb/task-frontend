"use client";

import { ArrowDownToLine, ArrowUpToLine, CalendarDays, Check, GripVertical, Pencil, RotateCcw } from "lucide-react";
import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Tarefa } from "@/tipos/api";
import { formatarData, formatarMoeda } from "./formatadores";
import { PopoverExcluir } from "./PopoverExcluir";
import { TagPrioridade } from "./TagPrioridade";

export interface AlcaArrastar {
  ref: Ref<HTMLButtonElement>;
  propriedades: HTMLAttributes<HTMLButtonElement>;
}

export interface AcoesTarefa {
  aoEditar: (tarefa: Tarefa) => void;
  aoConcluir: (id: string) => void;
  aoReabrir: (id: string) => void;
  aoMoverTopo: (id: string) => void;
  aoMoverFinal: (id: string) => void;
  aoExcluir: (id: string) => void;
}

interface PropsLinhaTarefa extends AcoesTarefa {
  tarefa: Tarefa;
  alca?: AlcaArrastar;
  estilo?: CSSProperties;
  arrastando?: boolean;
  ocupado?: boolean;
  refLinha?: Ref<HTMLLIElement>;
}

function BotaoAcao({
  rotulo,
  aoClicar,
  desabilitado,
  children,
}: {
  rotulo: string;
  aoClicar: () => void;
  desabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={rotulo}
          onClick={aoClicar}
          disabled={desabilitado}
          className="text-muted-foreground hover:text-foreground"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  );
}

/** Uma linha da lista: alça ⋮⋮, prioridade, descrição, datas, valor e ações rápidas. */
export function LinhaTarefa({
  tarefa,
  alca,
  estilo,
  arrastando,
  ocupado,
  refLinha,
  aoEditar,
  aoConcluir,
  aoReabrir,
  aoMoverTopo,
  aoMoverFinal,
  aoExcluir,
}: PropsLinhaTarefa) {
  const concluida = tarefa.situacao === "CONCLUIDA";
  const temValor = tarefa.valor > 0;

  return (
    <li
      ref={refLinha}
      style={estilo}
      data-testid={`tarefa-${tarefa.id}`}
      data-situacao={tarefa.situacao}
      className={cn(
        "bg-card grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2.5 shadow-xs transition-shadow",
        arrastando && "opacity-70 shadow-lg ring-2 ring-primary/40",
        concluida && "bg-muted/40",
      )}
    >
      <button
        ref={alca?.ref}
        type="button"
        aria-label={`Arrastar tarefa ${tarefa.descricao}`}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none rounded p-1 active:cursor-grabbing"
        {...alca?.propriedades}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <TagPrioridade prioridade={tarefa.prioridade} />

      <div className="min-w-0">
        <p className={cn("truncate font-medium", concluida && "text-muted-foreground line-through")}>
          {tarefa.descricao}
        </p>
        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>Aberta em {formatarData(tarefa.dataAbertura)}</span>
          <span
            data-testid="prazo"
            className={cn("inline-flex items-center gap-1", tarefa.atrasada && "font-semibold text-red-600")}
            title={tarefa.atrasada ? "Atrasada" : undefined}
          >
            <CalendarDays className="size-3.5" aria-hidden />
            {tarefa.dataPrevistaConclusao ? formatarData(tarefa.dataPrevistaConclusao) : "Sem prazo"}
            {tarefa.atrasada && <span>(atrasada)</span>}
          </span>
          {concluida && tarefa.dataConclusaoReal && <span>Concluída em {formatarData(tarefa.dataConclusaoReal)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span
          data-testid="valor"
          className={cn(
            "mr-2 min-w-24 text-right text-sm tabular-nums",
            temValor ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground/50",
          )}
        >
          {temValor ? formatarMoeda(tarefa.valor) : "—"}
        </span>
        <BotaoAcao rotulo="Mover para o topo" aoClicar={() => aoMoverTopo(tarefa.id)} desabilitado={ocupado}>
          <ArrowUpToLine />
        </BotaoAcao>
        <BotaoAcao rotulo="Mover para o final" aoClicar={() => aoMoverFinal(tarefa.id)} desabilitado={ocupado}>
          <ArrowDownToLine />
        </BotaoAcao>
        {concluida ? (
          <BotaoAcao rotulo="Reabrir" aoClicar={() => aoReabrir(tarefa.id)} desabilitado={ocupado}>
            <RotateCcw />
          </BotaoAcao>
        ) : (
          <BotaoAcao rotulo="Concluir" aoClicar={() => aoConcluir(tarefa.id)} desabilitado={ocupado}>
            <Check />
          </BotaoAcao>
        )}
        <BotaoAcao rotulo="Editar" aoClicar={() => aoEditar(tarefa)} desabilitado={ocupado}>
          <Pencil />
        </BotaoAcao>
        <PopoverExcluir descricao={tarefa.descricao} aoConfirmar={() => aoExcluir(tarefa.id)} desabilitado={ocupado} />
      </div>
    </li>
  );
}
