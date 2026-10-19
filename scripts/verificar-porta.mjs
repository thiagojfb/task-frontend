#!/usr/bin/env node
// Falha se a porta informada estiver ocupada — evita que o Next suba silenciosamente em outra porta
// (o que quebraria AUTH_URL). Uso: node scripts/verificar-porta.mjs 3000

import { createServer } from "node:net";

const porta = Number(process.argv[2] ?? 3000);

const servidor = createServer();
servidor.once("error", (erro) => {
  console.error(
    `A porta ${porta} está em uso (${erro.code}). Encerre o processo que a ocupa ou rode "docker compose rm -sf web" e tente de novo.`,
  );
  process.exit(1);
});
servidor.listen(porta, "0.0.0.0", () => {
  servidor.close(() => {
    console.log(`Porta ${porta} livre.`);
    process.exit(0);
  });
});
