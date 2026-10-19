import { CheckCircle2, CirclePlus, Pencil, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegistroHistorico, TipoRegistro } from "@/tipos/api";
import { formatarDataHora } from "./formatadores";

const ICONES: Record<TipoRegistro, typeof Pencil> = {
  CRIACAO: CirclePlus,
  ALTERACAO: Pencil,
  CONCLUSAO: CheckCircle2,
  REABERTURA: RotateCcw,
};

interface PropsLinhaDoTempo {
  registros?: RegistroHistorico[];
  carregando?: boolean;
  erro?: string | null;
}

/** Linha do tempo discreta com os registros automáticos enviados pela API. */
export function LinhaDoTempo({ registros, carregando, erro }: PropsLinhaDoTempo) {
  if (erro) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {erro}
      </p>
    );
  }
  if (carregando || !registros) {
    return (
      <div className="space-y-3" data-testid="carregando-historico">
        {[0, 1, 2].map((indice) => (
          <Skeleton key={indice} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (registros.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum registro no histórico.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l pl-5" aria-label="Histórico de alterações">
      {registros.map((registro) => {
        const Icone = ICONES[registro.tipo];
        return (
          <li key={registro.id} className="relative">
            <span className="bg-background absolute -left-[1.6rem] grid size-5 place-items-center rounded-full border">
              <Icone className="text-muted-foreground size-3" aria-hidden />
            </span>
            <p className="text-sm">{registro.descricao}</p>
            <time className="text-muted-foreground text-xs" dateTime={registro.dataHora}>
              {formatarDataHora(registro.dataHora)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
