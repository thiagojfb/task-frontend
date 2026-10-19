import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import caminhosTsconfig from "vite-tsconfig-paths";

// Cobertura mínima de 90 % (Constituição, Princípio III). Exclusões: primitivos gerados pelo shadcn,
// arquivos que só compõem outros componentes (layout/page), configuração declarativa do Auth.js,
// middleware, tipos e o próprio suporte de testes.
export default defineConfig({
  plugins: [react(), caminhosTsconfig()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/testes/configuracao.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/components/ui/**",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/api/auth/**",
        "src/middleware.ts",
        "src/proxy.ts",
        "src/auth.ts",
        "src/tipos/**",
        "src/testes/**",
        "src/**/*.test.{ts,tsx}",
      ],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
