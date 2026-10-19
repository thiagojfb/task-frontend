"use client";

import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ErroApi, mensagemDeErro } from "@/lib/erros";
import type { Tarefa, TarefaRequisicao } from "@/tipos/api";
import { BarraLateral } from "./BarraLateral";
import { Cabecalho } from "./Cabecalho";
import { DrawerTarefa } from "./DrawerTarefa";
import { useMutacoesTarefa, useResumoFinanceiro, useTarefas } from "./hooks";
import { ListaTarefas } from "./ListaTarefas";
import { usePreferenciaFiltro } from "./preferencias";
import { ResumoCompacto } from "./ResumoCompacto";

interface EstadoDrawer {
  aberto: boolean;
  tarefa: Tarefa | null;
}

/**
 * Tela principal: barra lateral + cabeçalho + lista, com o drawer de criação/edição.
 * Abaixo de lg a barra lateral sai da tela e abre como menu pelo botão ☰.
 */
export function Dashboard({ nomeUsuario }: { nomeUsuario: string }) {
  const { filtro, definirFiltro, pronto } = usePreferenciaFiltro();
  const [busca, definirBusca] = useState("");
  const [drawer, definirDrawer] = useState<EstadoDrawer>({ aberto: false, tarefa: null });
  const [menuAberto, definirMenuAberto] = useState(false);

  const tarefas = useTarefas(filtro, busca, pronto);
  const resumo = useResumoFinanceiro();
  const mutacoes = useMutacoesTarefa();

  // Sessão inválida no BFF (401) → volta ao login
  useEffect(() => {
    if (tarefas.error instanceof ErroApi && tarefas.error.status === 401) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [tarefas.error]);

  const executar = useCallback(async (acao: Promise<unknown>, mensagemSucesso: string) => {
    try {
      await acao;
      toast.success(mensagemSucesso);
    } catch (erro) {
      toast.error(mensagemDeErro(erro));
    }
  }, []);

  const salvar = async (dados: TarefaRequisicao) => {
    if (drawer.tarefa) {
      await mutacoes.editar.mutateAsync({ id: drawer.tarefa.id, dados });
      toast.success("Tarefa atualizada.");
    } else {
      await mutacoes.criar.mutateAsync(dados);
      toast.success("Tarefa criada.");
    }
  };

  const ocupado =
    mutacoes.concluir.isPending || mutacoes.reabrir.isPending || mutacoes.excluir.isPending || mutacoes.mover.isPending;

  return (
    // h-dvh: no celular, h-screen (100vh) passa por baixo da barra de endereço e corta o fim da lista
    <div className="bg-background flex h-dvh overflow-hidden">
      <BarraLateral
        filtro={filtro}
        aoFiltrar={definirFiltro}
        resumo={resumo.data}
        carregandoResumo={resumo.isPending}
        nomeUsuario={nomeUsuario}
        className="hidden lg:flex"
      />
      <Sheet open={menuAberto} onOpenChange={definirMenuAberto}>
        <SheetContent side="left" className="gap-0 p-0 lg:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Filtros, total do mês e conta</SheetDescription>
          <BarraLateral
            filtro={filtro}
            aoFiltrar={(novoFiltro) => {
              definirFiltro(novoFiltro);
              definirMenuAberto(false);
            }}
            resumo={resumo.data}
            carregandoResumo={resumo.isPending}
            nomeUsuario={nomeUsuario}
            className="w-full border-r-0"
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Cabecalho
          busca={busca}
          aoBuscar={definirBusca}
          aoNovaTarefa={() => definirDrawer({ aberto: true, tarefa: null })}
          aoAbrirMenu={() => definirMenuAberto(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <ResumoCompacto
              filtro={filtro}
              resumo={resumo.data}
              carregandoResumo={resumo.isPending}
              aoAbrirMenu={() => definirMenuAberto(true)}
              className="mb-3 lg:hidden"
            />
            <ListaTarefas
              tarefas={tarefas.data}
              carregando={!pronto || tarefas.isPending}
              erro={tarefas.error ? mensagemDeErro(tarefas.error) : null}
              aoTentarNovamente={() => void tarefas.refetch()}
              ocupado={ocupado}
              filtrada={filtro !== "TODAS" || busca.trim().length > 0}
              aoEditar={(tarefa) => definirDrawer({ aberto: true, tarefa })}
              aoConcluir={(id) => executar(mutacoes.concluir.mutateAsync(id), "Tarefa concluída.")}
              aoReabrir={(id) => executar(mutacoes.reabrir.mutateAsync(id), "Tarefa reaberta.")}
              aoMoverTopo={(id) =>
                executar(mutacoes.mover.mutateAsync({ id, movimento: { destino: "TOPO" } }), "Movida para o topo.")
              }
              aoMoverFinal={(id) =>
                executar(mutacoes.mover.mutateAsync({ id, movimento: { destino: "FINAL" } }), "Movida para o final.")
              }
              aoMoverPara={(id, posicao) =>
                executar(mutacoes.mover.mutateAsync({ id, movimento: { destino: "POSICAO", posicao } }), "Tarefa reordenada.")
              }
              aoExcluir={(id) => executar(mutacoes.excluir.mutateAsync(id), "Tarefa excluída.")}
            />
          </div>
        </main>
      </div>
      <DrawerTarefa
        aberto={drawer.aberto}
        tarefa={drawer.tarefa}
        aoFechar={() => definirDrawer((atual) => ({ ...atual, aberto: false }))}
        aoSalvar={salvar}
      />
    </div>
  );
}
