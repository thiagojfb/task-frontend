import { auth } from "@/auth";
import { Dashboard } from "@/funcionalidades/tarefas/Dashboard";

export const dynamic = "force-dynamic";

export default async function PaginaInicial() {
  const sessao = await auth();
  const nomeUsuario = sessao?.user?.name ?? sessao?.usuario ?? "Usuário";
  return <Dashboard nomeUsuario={nomeUsuario} />;
}
