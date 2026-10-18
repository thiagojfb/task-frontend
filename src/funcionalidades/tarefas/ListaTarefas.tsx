"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tarefa } from "@/tipos/api";
import { LinhaTarefa, type AcoesTarefa } from "./LinhaTarefa";

interface PropsListaTarefas extends AcoesTarefa {
  tarefas: Tarefa[] | undefined;
  carregando: boolean;
  erro: string | null;
  aoTentarNovamente: () => void;
  aoMoverPara: (id: string, posicao: number) => void;
  ocupado?: boolean;
  filtrada?: boolean;
}

function LinhaOrdenavel({ tarefa, ...resto }: { tarefa: Tarefa; ocupado?: boolean } & AcoesTarefa) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: tarefa.id,
  });
  return (
    <LinhaTarefa
      tarefa={tarefa}
      refLinha={setNodeRef}
      estilo={{ transform: CSS.Transform.toString(transform), transition }}
      arrastando={isDragging}
      alca={{ ref: setActivatorNodeRef, propriedades: { ...attributes, ...listeners } }}
      {...resto}
    />
  );
}

/** Lista central com arrastar-e-soltar (dnd-kit) e estados de carregamento, erro e vazio. */
export function ListaTarefas({
  tarefas,
  carregando,
  erro,
  aoTentarNovamente,
  aoMoverPara,
  ocupado,
  filtrada,
  ...acoes
}: PropsListaTarefas) {
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (erro) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertCircle />
        <AlertTitle>Não foi possível carregar as tarefas</AlertTitle>
        <AlertDescription>
          <p>{erro}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={aoTentarNovamente}>
            <RefreshCw aria-hidden />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (carregando || !tarefas) {
    return (
      <div className="space-y-2" data-testid="carregando-tarefas" aria-busy="true">
        {[0, 1, 2, 3].map((indice) => (
          <Skeleton key={indice} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (tarefas.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Inbox className="size-8" aria-hidden />
        <p className="font-medium">{filtrada ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa por aqui"}</p>
        <p className="text-sm">
          {filtrada ? "Ajuste os filtros ou a busca." : "Clique em “Nova Tarefa” para criar a primeira."}
        </p>
      </div>
    );
  }

  const aoSoltar = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) {
      return;
    }
    const destino = tarefas.find((tarefa) => tarefa.id === over.id);
    if (destino) {
      aoMoverPara(String(active.id), destino.posicao);
    }
  };

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
      <SortableContext items={tarefas.map((tarefa) => tarefa.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2" aria-label="Lista de tarefas">
          {tarefas.map((tarefa) => (
            <LinhaOrdenavel key={tarefa.id} tarefa={tarefa} ocupado={ocupado} {...acoes} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
