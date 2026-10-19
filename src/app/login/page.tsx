import { ListTodo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormularioCadastro } from "@/funcionalidades/autenticacao/FormularioCadastro";
import { FormularioLogin } from "@/funcionalidades/autenticacao/FormularioLogin";

export const metadata = { title: "Entrar · Tarefas" };

export default function PaginaLogin() {
  return (
    <main className="from-muted/60 to-background flex min-h-dvh items-center justify-center bg-linear-to-b p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="bg-primary text-primary-foreground mb-2 grid size-12 place-items-center rounded-xl">
            <ListTodo className="size-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Tarefas</CardTitle>
          <CardDescription>Organize suas pendências e controle seus gastos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="entrar">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="entrar" className="flex-1">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="flex-1">
                Criar conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="entrar">
              <FormularioLogin />
            </TabsContent>
            <TabsContent value="cadastro">
              <FormularioCadastro />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
