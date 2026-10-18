import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { esquemaLogin } from "@/funcionalidades/autenticacao/esquemas";
import {
  ErroAutenticacao,
  autenticarComSenha,
  decodificarClaims,
  nomeDeExibicao,
} from "@/funcionalidades/autenticacao/keycloak";
import { atualizarTokenSessao } from "@/funcionalidades/autenticacao/sessao";

/** Propaga o código do erro de autenticação para a tela de login. */
class FalhaLogin extends CredentialsSignin {
  constructor(codigo: string) {
    super();
    this.code = codigo;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { usuario: { label: "Usuário" }, senha: { label: "Senha", type: "password" } },
      async authorize(credenciais) {
        const dados = esquemaLogin.safeParse(credenciais);
        if (!dados.success) {
          throw new FalhaLogin("credenciais_invalidas");
        }
        try {
          const tokens = await autenticarComSenha(dados.data.usuario, dados.data.senha);
          const claims = decodificarClaims(tokens.accessToken);
          return {
            id: claims.sub,
            name: nomeDeExibicao(claims),
            email: claims.email,
            usuario: claims.preferred_username ?? dados.data.usuario,
            tokens,
          };
        } catch (erro) {
          throw new FalhaLogin(erro instanceof ErroAutenticacao ? erro.codigo : "indisponivel");
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => atualizarTokenSessao(token, user),
    // Tokens NUNCA vão para a sessão vista pelo navegador (Constituição, Princípio IV)
    session({ session, token }) {
      session.usuario = token.usuario;
      session.erro = token.erro;
      return session;
    },
  },
});
