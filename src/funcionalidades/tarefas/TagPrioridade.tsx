import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Prioridade } from "@/tipos/api";
import { CLASSES_PRIORIDADE, ROTULO_PRIORIDADE } from "./formatadores";

/** Tag colorida: Alta vermelho, Média amarelo, Baixa azul. */
export function TagPrioridade({ prioridade, className }: { prioridade: Prioridade; className?: string }) {
  return (
    <Badge
      variant="outline"
      data-prioridade={prioridade}
      aria-label={`Prioridade ${ROTULO_PRIORIDADE[prioridade]}`}
      className={cn("font-medium", CLASSES_PRIORIDADE[prioridade], className)}
    >
      {ROTULO_PRIORIDADE[prioridade]}
    </Badge>
  );
}
