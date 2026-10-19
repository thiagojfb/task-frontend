"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mensagemDeErro } from "@/lib/erros";
import type { Tarefa, TarefaRequisicao } from "@/tipos/api";
import { FormularioTarefa } from "./FormularioTarefa";
import { useHistorico } from "./hooks";
import { LinhaDoTempo } from "./LinhaDoTempo";

interface PropsDrawerTarefa {
  aberto: boolean;
  tarefa: Tarefa | null;
  aoFechar: () => void;
  aoSalvar: (dados: TarefaRequisicao) => Promise<unknown>;
}

/** Drawer lateral com o formulário unificado e, em edição, a aba Histórico. */
export function DrawerTarefa({ aberto, tarefa, aoFechar, aoSalvar }: PropsDrawerTarefa) {
  const [salvando, definirSalvando] = useState(false);
  const [erroServidor, definirErroServidor] = useState<string | null>(null);
  const historico = useHistorico(aberto && tarefa ? tarefa.id : null);

  const salvar = async (dados: TarefaRequisicao) => {
    definirSalvando(true);
    definirErroServidor(null);
    try {
      await aoSalvar(dados);
      aoFechar();
    } catch (erro) {
      definirErroServidor(mensagemDeErro(erro));
    } finally {
      definirSalvando(false);
    }
  };

  const fechar = (permanecerAberto: boolean) => {
    if (!permanecerAberto) {
      definirErroServidor(null);
      aoFechar();
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={fechar}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{tarefa ? "Editar tarefa" : "Nova tarefa"}</SheetTitle>
          <SheetDescription>
            {tarefa
              ? "Altere os dados ou consulte o histórico de alterações."
              : "A data de abertura é registrada automaticamente."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {tarefa ? (
            <Tabs defaultValue="dados">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="dados" className="flex-1">
                  Dados
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex-1">
                  Histórico
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dados">
                <FormularioTarefa
                  tarefa={tarefa}
                  aoSalvar={salvar}
                  aoCancelar={aoFechar}
                  salvando={salvando}
                  erroServidor={erroServidor}
                />
              </TabsContent>
              <TabsContent value="historico">
                <LinhaDoTempo
                  registros={historico.data}
                  carregando={historico.isPending}
                  erro={historico.error ? mensagemDeErro(historico.error) : null}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <FormularioTarefa aoSalvar={salvar} aoCancelar={aoFechar} salvando={salvando} erroServidor={erroServidor} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
