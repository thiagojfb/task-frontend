"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PropsPopoverExcluir {
  descricao: string;
  aoConfirmar: () => void;
  desabilitado?: boolean;
}

/** Confirmação leve de exclusão em um balão ancorado ao ícone de lixeira. */
export function PopoverExcluir({ descricao, aoConfirmar, desabilitado }: PropsPopoverExcluir) {
  const [aberto, definirAberto] = useState(false);

  return (
    <Popover open={aberto} onOpenChange={definirAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Excluir tarefa ${descricao}`}
          disabled={desabilitado}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-64 space-y-3">
        <p className="text-sm font-medium">Excluir esta tarefa?</p>
        <p className="text-muted-foreground text-xs">Esta ação é definitiva e remove também o histórico.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => definirAberto(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              definirAberto(false);
              aoConfirmar();
            }}
          >
            Excluir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
