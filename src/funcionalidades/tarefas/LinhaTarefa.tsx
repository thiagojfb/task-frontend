"use client";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  CalendarDays,
  Check,
  Ellipsis,
  GripVertical,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useRef, useState, type CSSProperties, type HTMLAttributes, type Ref } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverAnchor, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Tarefa } from "@/tipos/api";
import { formatarData, formatarMoeda } from "./formatadores";
import { ConteudoPopoverExcluir } from "./PopoverExcluir";
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

// Alvo de toque maior no celular; tamanho compacto a partir de md
const CLASSES_BOTAO_ACAO = "text-muted-foreground hover:text-foreground size-9 md:size-7";

function BotaoAcao({
  rotulo,
  aoClicar,
  desabilitado,
  className,
  children,
}: {
  rotulo: string;
  aoClicar: () => void;
  desabilitado?: boolean;
  className?: string;
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
          className={cn(CLASSES_BOTAO_ACAO, className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Uma linha da lista: alça ⋮⋮, prioridade, descrição, datas, valor e ações rápidas.
 * No celular as ações secundárias ficam no menu "⋯" e o valor desce para a linha de detalhes.
 */
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
  const [confirmandoExclusao, definirConfirmandoExclusao] = useState(false);
  // O balão de exclusão só abre depois que o menu fecha, senão a devolução de foco do menu o fecharia
  const excluirAoFecharMenu = useRef(false);
  const concluida = tarefa.situacao === "CONCLUIDA";
  const temValor = tarefa.valor > 0;

  return (
    <li
      ref={refLinha}
      style={estilo}
      data-testid={`tarefa-${tarefa.id}`}
      data-situacao={tarefa.situacao}
      className={cn(
        "bg-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-2 py-2 shadow-xs transition-shadow md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:gap-3 md:px-3 md:py-2.5",
        arrastando && "opacity-70 shadow-lg ring-2 ring-primary/40",
        concluida && "bg-muted/40",
      )}
    >
      <button
        ref={alca?.ref}
        type="button"
        aria-label={`Arrastar tarefa ${tarefa.descricao}`}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none rounded p-2 active:cursor-grabbing md:p-1"
        {...alca?.propriedades}
      >
        <GripVertical className="size-5 md:size-4" aria-hidden />
      </button>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <TagPrioridade prioridade={tarefa.prioridade} className="shrink-0" />
          <button
            type="button"
            onClick={() => aoEditar(tarefa)}
            title={tarefa.descricao}
            className={cn(
              "min-w-0 truncate rounded-sm text-left font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              concluida && "text-muted-foreground line-through",
            )}
          >
            {tarefa.descricao}
          </button>
        </div>
        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="hidden md:inline">Aberta em {formatarData(tarefa.dataAbertura)}</span>
          <span
            data-testid="prazo"
            className={cn("inline-flex items-center gap-1", tarefa.atrasada && "font-semibold text-red-600")}
            title={tarefa.atrasada ? "Atrasada" : undefined}
          >
            <CalendarDays className="size-3.5" aria-hidden />
            {tarefa.dataPrevistaConclusao ? formatarData(tarefa.dataPrevistaConclusao) : "Sem prazo"}
            {tarefa.atrasada && <span>(atrasada)</span>}
          </span>
          {temValor && (
            <span
              data-testid="valor-compacto"
              className="font-semibold tabular-nums text-emerald-700 md:hidden dark:text-emerald-400"
            >
              {formatarMoeda(tarefa.valor)}
            </span>
          )}
          {concluida && tarefa.dataConclusaoReal && <span>Concluída em {formatarData(tarefa.dataConclusaoReal)}</span>}
        </div>
      </div>

      <span
        data-testid="valor"
        className={cn(
          "hidden min-w-24 text-right text-sm tabular-nums md:block",
          temValor ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground/50",
        )}
      >
        {temValor ? formatarMoeda(tarefa.valor) : "—"}
      </span>

      <Popover open={confirmandoExclusao} onOpenChange={definirConfirmandoExclusao}>
        <PopoverAnchor asChild>
          <div className="flex items-center gap-1">
            <BotaoAcao
              rotulo="Mover para o topo"
              aoClicar={() => aoMoverTopo(tarefa.id)}
              desabilitado={ocupado}
              className="hidden md:inline-flex"
            >
              <ArrowUpToLine />
            </BotaoAcao>
            <BotaoAcao
              rotulo="Mover para o final"
              aoClicar={() => aoMoverFinal(tarefa.id)}
              desabilitado={ocupado}
              className="hidden md:inline-flex"
            >
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
            <BotaoAcao
              rotulo="Editar"
              aoClicar={() => aoEditar(tarefa)}
              desabilitado={ocupado}
              className="hidden md:inline-flex"
            >
              <Pencil />
            </BotaoAcao>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Excluir tarefa ${tarefa.descricao}`}
                disabled={ocupado}
                className="text-muted-foreground hover:text-destructive hidden md:inline-flex"
              >
                <Trash2 />
              </Button>
            </PopoverTrigger>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Mais ações da tarefa ${tarefa.descricao}`}
                  disabled={ocupado}
                  className={cn(CLASSES_BOTAO_ACAO, "md:hidden")}
                >
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-auto min-w-48"
                onCloseAutoFocus={(evento) => {
                  if (excluirAoFecharMenu.current) {
                    excluirAoFecharMenu.current = false;
                    evento.preventDefault();
                    definirConfirmandoExclusao(true);
                  }
                }}
              >
                <DropdownMenuItem className="py-2.5" onSelect={() => aoEditar(tarefa)}>
                  <Pencil aria-hidden />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2.5" onSelect={() => aoMoverTopo(tarefa.id)}>
                  <ArrowUpToLine aria-hidden />
                  Mover para o topo
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2.5" onSelect={() => aoMoverFinal(tarefa.id)}>
                  <ArrowDownToLine aria-hidden />
                  Mover para o final
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="py-2.5"
                  onSelect={() => {
                    excluirAoFecharMenu.current = true;
                  }}
                >
                  <Trash2 aria-hidden />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PopoverAnchor>
        <ConteudoPopoverExcluir
          aoCancelar={() => definirConfirmandoExclusao(false)}
          aoConfirmar={() => {
            definirConfirmandoExclusao(false);
            aoExcluir(tarefa.id);
          }}
        />
      </Popover>
    </li>
  );
}
