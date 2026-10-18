"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { esquemaLogin, type DadosLogin } from "./esquemas";
import { mensagemParaCodigo } from "./mensagens";

/** Autentica no Keycloak pelo servidor Next (Auth.js Credentials) e vai para o dashboard. */
export async function entrar(dados: DadosLogin): Promise<string | null> {
  const resultado = await signIn("credentials", { ...dados, redirect: false });
  if (!resultado || resultado.error) {
    return mensagemParaCodigo(resultado?.code);
  }
  return null;
}

export function FormularioLogin() {
  const roteador = useRouter();
  const [erro, definirErro] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<DadosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { usuario: "", senha: "" },
  });

  const submeter = handleSubmit(async (dados) => {
    definirErro(null);
    const mensagem = await entrar(dados);
    if (mensagem) {
      definirErro(mensagem);
      return;
    }
    roteador.push("/");
    roteador.refresh();
  });

  return (
    <form onSubmit={submeter} noValidate className="flex flex-col gap-4" aria-label="Entrar">
      <div className="grid gap-1.5">
        <Label htmlFor="login-usuario">Usuário</Label>
        <Input id="login-usuario" autoComplete="username" autoFocus {...register("usuario")} />
        {formState.errors.usuario && (
          <p role="alert" className="text-destructive text-xs">
            {formState.errors.usuario.message}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="login-senha">Senha</Label>
        <Input id="login-senha" type="password" autoComplete="current-password" {...register("senha")} />
        {formState.errors.senha && (
          <p role="alert" className="text-destructive text-xs">
            {formState.errors.senha.message}
          </p>
        )}
      </div>
      {erro && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {erro}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        <LogIn aria-hidden />
        {formState.isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
