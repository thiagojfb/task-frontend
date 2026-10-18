import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Provedores } from "@/componentes/Provedores";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Lista de tarefas com prioridade, controle financeiro e histórico de alterações",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
