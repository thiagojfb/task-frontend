"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mensagemDoProblema } from "@/lib/erros";
import type { ProblemDetail } from "@/tipos/api";
import { esquemaCadastro, type DadosCadastro } from "./esquemas";
import { entrar } from "./FormularioLogin";

/** Cria a conta pela rota /api/cadastro (→ API → Keycloak); devolve mensagem de erro ou null. */
export async function cadastrar(dados: DadosCadastro): Promise<string | null> {
  const resposta = await fetch("/api/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (resposta.ok) {
    return null;
  }
  const problema = (await resposta.json().catch(() => null)) as ProblemDetail | null;
  return mensagemDoProblema(problema, resposta.status);
}

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro && (
        <p role="alert" className="text-destructive text-xs">
          {erro}
        </p>
      )}
    </div>
  );
}

export function FormularioCadastro() {
  const roteador = useRouter();
  const [erro, definirErro] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<DadosCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: { nome: "", sobrenome: "", email: "", usuario: "", senha: "", confirmarSenha: "" },
  });
  const erros = formState.errors;

  const submeter = handleSubmit(async (dados) => {
    definirErro(null);
    const falhaCadastro = await cadastrar(dados);
    if (falhaCadastro) {
      definirErro(falhaCadastro);
      return;
    }
    const falhaLogin = await entrar({ usuario: dados.usuario, senha: dados.senha });
    if (falhaLogin) {
      definirErro(`Conta criada, mas não foi possível entrar automaticamente: ${falhaLogin}`);
      return;
    }
    roteador.push("/");
    roteador.refresh();
  });

  return (
    <form onSubmit={submeter} noValidate className="flex flex-col gap-4" aria-label="Criar conta">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="cadastro-nome" rotulo="Nome" erro={erros.nome?.message}>
          <Input id="cadastro-nome" autoComplete="given-name" {...register("nome")} />
        </Campo>
        <Campo id="cadastro-sobrenome" rotulo="Sobrenome" erro={erros.sobrenome?.message}>
          <Input id="cadastro-sobrenome" autoComplete="family-name" {...register("sobrenome")} />
        </Campo>
      </div>
      <Campo id="cadastro-email" rotulo="E-mail" erro={erros.email?.message}>
        <Input id="cadastro-email" type="email" autoComplete="email" {...register("email")} />
      </Campo>
      <Campo id="cadastro-usuario" rotulo="Usuário" erro={erros.usuario?.message}>
        <Input id="cadastro-usuario" autoComplete="username" {...register("usuario")} />
      </Campo>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="cadastro-senha" rotulo="Senha" erro={erros.senha?.message}>
          <Input id="cadastro-senha" type="password" autoComplete="new-password" {...register("senha")} />
        </Campo>
        <Campo id="cadastro-confirmar" rotulo="Confirmar senha" erro={erros.confirmarSenha?.message}>
          <Input id="cadastro-confirmar" type="password" autoComplete="new-password" {...register("confirmarSenha")} />
        </Campo>
      </div>
      {erro && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {erro}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        <UserPlus aria-hidden />
        {formState.isSubmitting ? "Criando conta…" : "Criar conta e entrar"}
      </Button>
    </form>
  );
}
