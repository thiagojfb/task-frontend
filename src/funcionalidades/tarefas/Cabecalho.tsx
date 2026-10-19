"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PropsCabecalho {
  busca: string;
  aoBuscar: (termo: string) => void;
  aoNovaTarefa: () => void;
  atrasoMs?: number;
}

/** Topo do dashboard: busca (com debounce) e botão de destaque para nova tarefa. */
export function Cabecalho({ busca, aoBuscar, aoNovaTarefa, atrasoMs = 300 }: PropsCabecalho) {
  const [texto, definirTexto] = useState(busca);
  const [buscaSincronizada, definirBuscaSincronizada] = useState(busca);

  // Sincroniza o campo quando a busca externa muda (estado derivado durante a renderização)
  if (busca !== buscaSincronizada) {
    definirBuscaSincronizada(busca);
    definirTexto(busca);
  }

  useEffect(() => {
    if (texto === busca) {
      return;
    }
    const temporizador = setTimeout(() => aoBuscar(texto), atrasoMs);
    return () => clearTimeout(temporizador);
  }, [texto, busca, aoBuscar, atrasoMs]);

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 flex items-center gap-4 border-b px-6 py-4 backdrop-blur">
      <div className="relative flex-1 max-w-xl">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          aria-label="Buscar tarefas"
          placeholder="Buscar tarefas pela descrição…"
          value={texto}
          onChange={(evento) => definirTexto(evento.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="button" onClick={aoNovaTarefa} className="ml-auto">
        <Plus aria-hidden />
        Nova Tarefa
      </Button>
    </header>
  );
}
