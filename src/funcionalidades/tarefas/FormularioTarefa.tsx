"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tarefa, TarefaRequisicao } from "@/tipos/api";
import { esquemaTarefa, paraRequisicao, valoresIniciais, type DadosFormularioTarefa } from "./esquemas";
import { ROTULO_PRIORIDADE } from "./formatadores";

interface PropsFormularioTarefa {
  tarefa?: Tarefa | null;
  aoSalvar: (dados: TarefaRequisicao) => Promise<void> | void;
  aoCancelar: () => void;
  salvando?: boolean;
  erroServidor?: string | null;
}

function MensagemErro({ id, texto }: { id: string; texto?: string }) {
  if (!texto) {
    return null;
  }
  return (
    <p id={id} role="alert" className="text-destructive text-xs">
      {texto}
    </p>
  );
}

/** Formulário unificado de criação e edição de tarefa. */
export function FormularioTarefa({ tarefa, aoSalvar, aoCancelar, salvando, erroServidor }: PropsFormularioTarefa) {
  const formulario = useForm<DadosFormularioTarefa>({
    resolver: zodResolver(esquemaTarefa),
    defaultValues: valoresIniciais(tarefa),
  });
  const { register, handleSubmit, reset, formState } = formulario;

  useEffect(() => {
    reset(valoresIniciais(tarefa));
  }, [tarefa, reset]);

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit((dados) => aoSalvar(paraRequisicao(dados)))}
      aria-label={tarefa ? "Editar tarefa" : "Nova tarefa"}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          rows={3}
          maxLength={500}
          placeholder="O que precisa ser feito?"
          aria-invalid={Boolean(formState.errors.descricao)}
          aria-describedby="erro-descricao"
          {...register("descricao")}
        />
        <MensagemErro id="erro-descricao" texto={formState.errors.descricao?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="prioridade">Prioridade</Label>
          <select
            id="prioridade"
            className="border-input bg-background h-9 rounded-md border px-3 text-base shadow-xs md:text-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            {...register("prioridade")}
          >
            {(Object.keys(ROTULO_PRIORIDADE) as (keyof typeof ROTULO_PRIORIDADE)[]).map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {ROTULO_PRIORIDADE[prioridade]}
              </option>
            ))}
          </select>
          <MensagemErro id="erro-prioridade" texto={formState.errors.prioridade?.message} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="dataPrevistaConclusao">Data prevista de conclusão</Label>
          <Input
            id="dataPrevistaConclusao"
            type="date"
            aria-invalid={Boolean(formState.errors.dataPrevistaConclusao)}
            {...register("dataPrevistaConclusao")}
          />
          <MensagemErro id="erro-data" texto={formState.errors.dataPrevistaConclusao?.message} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input
          id="valor"
          inputMode="decimal"
          placeholder="0,00"
          aria-invalid={Boolean(formState.errors.valor)}
          aria-describedby="erro-valor"
          {...register("valor")}
        />
        <p className="text-muted-foreground text-xs">Deixe em branco se a tarefa não envolve gasto.</p>
        <MensagemErro id="erro-valor" texto={formState.errors.valor?.message} />
      </div>

      {erroServidor && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {erroServidor}
        </p>
      )}

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={aoCancelar} disabled={salvando} className="h-10 sm:h-8">
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando} className="h-10 sm:h-8">
          {salvando ? "Salvando…" : tarefa ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}
