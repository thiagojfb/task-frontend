#!/usr/bin/env node
// Aguarda a API responder "UP" em /actuator/health antes de subir o front (usado pelo launcher do VS Code).
// Uso: node scripts/aguardar-api.mjs [segundosLimite]   (API_URL define a base; padrão http://localhost:8081)

const base = (process.env.API_URL ?? "http://localhost:8081").replace(/\/$/, "");
const url = `${base}/actuator/health`;
const limiteMs = Number(process.argv[2] ?? 240) * 1000;
const intervaloMs = 3000;
const inicio = Date.now();

process.stdout.write(`Aguardando a API em ${url} `);

while (Date.now() - inicio < limiteMs) {
  try {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      if (corpo.status === "UP") {
        const segundos = Math.round((Date.now() - inicio) / 1000);
        console.log(`\nAPI no ar após ${segundos}s. Subindo o front...`);
        process.exit(0);
      }
    }
  } catch {
    // API ainda iniciando: tenta de novo
  }
  process.stdout.write(".");
  await new Promise((resolver) => setTimeout(resolver, intervaloMs));
}

console.error(`\nA API não respondeu em ${limiteMs / 1000}s. Suba o backend primeiro (launcher "API local" no task-backend).`);
process.exit(1);
