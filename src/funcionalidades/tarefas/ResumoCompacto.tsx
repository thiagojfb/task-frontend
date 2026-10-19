"use client";

import { ChevronRight, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FiltroSituacao, ResumoFinanceiro } from "@/tipos/api";
import { FILTROS } from "./BarraLateral";

interface PropsResumoCompacto {
  filtro: FiltroSituacao;
  resumo?: ResumoFinanceiro;
  carregandoResumo?: boolean;
  aoAbrirMenu: () => void;
  className?: string;
}

/** Faixa do celular e do tablet com o filtro ativo e o total do mês (a barra lateral fica no menu ☰). */
export function ResumoCompacto({ filtro, resumo, carregandoResumo, aoAbrirMenu, className }: PropsResumoCompacto) {
  const { rotulo, Icone } = FILTROS.find((item) => item.valor === filtro) ?? FILTROS[0];

  return (
    <button
      type="button"
      onClick={aoAbrirMenu}
      className={cn(
        "bg-card flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm shadow-xs",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 font-medium">
        <Icone className="size-4" aria-hidden />
        {rotulo}
      </span>
      <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
        <Wallet className="size-3.5" aria-hidden />
        No mês:
        {carregandoResumo || !resumo ? (
          <Skeleton className="h-4 w-16" data-testid="carregando-resumo-compacto" />
        ) : (
          <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {resumo.totalFormatado}
          </span>
        )}
      </span>
      <ChevronRight className="text-muted-foreground size-4" aria-hidden />
    </button>
  );
}
