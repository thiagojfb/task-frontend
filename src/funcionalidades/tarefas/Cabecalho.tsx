"use client";

import { Menu, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PropsCabecalho {
  busca: string;
  aoBuscar: (termo: string) => void;
  aoNovaTarefa: () => void;
  aoAbrirMenu: () => void;
  atrasoMs?: number;
}

/** Topo do dashboard: menu ☰ (celular e tablet), busca (com debounce) e botão de destaque para nova tarefa. */
export function Cabecalho({ busca, aoBuscar, aoNovaTarefa, aoAbrirMenu, atrasoMs = 300 }: PropsCabecalho) {
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
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 flex items-center gap-2 border-b px-4 py-3 backdrop-blur md:gap-4 md:px-6 md:py-4">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Abrir menu"
        onClick={aoAbrirMenu}
        className="-ml-2 lg:hidden"
      >
        <Menu aria-hidden />
      </Button>
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
      {/* No celular só o ícone "+"; o texto continua como nome acessível */}
      <Button type="button" onClick={aoNovaTarefa} className="ml-auto h-9 w-9 px-0 sm:h-8 sm:w-auto sm:px-2.5">
        <Plus aria-hidden />
        <span className="sr-only sm:not-sr-only">Nova Tarefa</span>
      </Button>
    </header>
  );
}
