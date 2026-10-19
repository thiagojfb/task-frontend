"use client";

import { CircleCheckBig, CircleDashed, ListTodo, LogOut, Wallet } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FiltroSituacao, ResumoFinanceiro } from "@/tipos/api";

export const FILTROS: { valor: FiltroSituacao; rotulo: string; Icone: typeof ListTodo }[] = [
  { valor: "TODAS", rotulo: "Todas", Icone: ListTodo },
  { valor: "ABERTAS", rotulo: "Abertas", Icone: CircleDashed },
  { valor: "CONCLUIDAS", rotulo: "Concluídas", Icone: CircleCheckBig },
];

interface PropsBarraLateral {
  filtro: FiltroSituacao;
  aoFiltrar: (filtro: FiltroSituacao) => void;
  resumo?: ResumoFinanceiro;
  carregandoResumo?: boolean;
  nomeUsuario: string;
  aoSair?: () => void;
  className?: string;
}

/** Filtros, total do mês e usuário. Fixa à esquerda a partir de lg; abaixo disso, aberta pelo menu ☰. */
export function BarraLateral({
  filtro,
  aoFiltrar,
  resumo,
  carregandoResumo,
  nomeUsuario,
  aoSair,
  className,
}: PropsBarraLateral) {
  const sair = aoSair ?? (() => signOut({ callbackUrl: "/login" }));

  return (
    <aside className={cn("bg-sidebar text-sidebar-foreground flex h-full w-64 shrink-0 flex-col border-r", className)}>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg font-bold">T</div>
        <span className="text-lg font-semibold">Tarefas</span>
      </div>

      <nav aria-label="Filtros rápidos" className="px-3">
        <p className="text-muted-foreground px-2 pb-2 text-xs font-medium uppercase tracking-wide">Filtros</p>
        <ul className="space-y-1">
          {FILTROS.map(({ valor, rotulo, Icone }) => (
            <li key={valor}>
              <button
                type="button"
                onClick={() => aoFiltrar(valor)}
                aria-pressed={filtro === valor}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors md:py-2",
                  filtro === valor
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <Icone className="size-4" aria-hidden />
                {rotulo}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-label="Indicador financeiro" className="mx-3 mt-6 rounded-lg border bg-card p-4 shadow-xs">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <Wallet className="size-4" aria-hidden />
          Total a gastar neste mês
        </div>
        {carregandoResumo || !resumo ? (
          <Skeleton className="mt-2 h-7 w-32" data-testid="carregando-resumo" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {resumo.totalFormatado}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">Tarefas abertas com prazo no mês corrente</p>
      </section>

      <div className="mt-auto border-t px-4 py-4">
        <p className="truncate text-sm font-medium" title={nomeUsuario}>
          {nomeUsuario}
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-2 -ml-2" onClick={sair}>
          <LogOut aria-hidden />
          Sair
        </Button>
      </div>
    </aside>
  );
}
