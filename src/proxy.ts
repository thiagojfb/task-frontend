import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Proxy (Next 16): protege todas as rotas — sem sessão válida → /login; com sessão em /login → dashboard. */
export default auth((requisicao) => {
  const { pathname } = requisicao.nextUrl;
  const autenticado = Boolean(requisicao.auth) && !requisicao.auth?.erro;

  if (!autenticado && pathname !== "/login") {
    const destino = new URL("/login", requisicao.nextUrl);
    return NextResponse.redirect(destino);
  }
  if (autenticado && pathname === "/login") {
    return NextResponse.redirect(new URL("/", requisicao.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|api/cadastro|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|ico|webmanifest)$).*)"],
};
