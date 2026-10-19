"use client";

import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";

interface PropsConteudoPopoverExcluir {
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/**
 * Balão de confirmação leve de exclusão. O `Popover` fica na linha da tarefa, que o abre pela lixeira
 * (telas maiores) ou pelo item "Excluir" do menu de ações (celular).
 */
export function ConteudoPopoverExcluir({ aoConfirmar, aoCancelar }: PropsConteudoPopoverExcluir) {
  return (
    <PopoverContent side="top" align="end" className="w-64 space-y-3">
      <p className="text-sm font-medium">Excluir esta tarefa?</p>
      <p className="text-muted-foreground text-xs">Esta ação é definitiva e remove também o histórico.</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={aoCancelar}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={aoConfirmar}>
          Excluir
        </Button>
      </div>
    </PopoverContent>
  );
}
