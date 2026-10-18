import { z } from "zod";

const MENSAGEM_USUARIO =
  "O nome de usuário deve ter de 3 a 50 caracteres (letras, números, ponto, hífen ou sublinhado).";
const MENSAGEM_SENHA = "A senha deve ter entre 8 e 128 caracteres.";

export const esquemaLogin = z.object({
  usuario: z.string().trim().min(1, "Informe o usuário."),
  senha: z.string().min(1, "Informe a senha."),
});

export const esquemaCadastro = z
  .object({
    nome: z.string().trim().min(1, "O nome é obrigatório.").max(100, "O nome deve ter no máximo 100 caracteres."),
    sobrenome: z
      .string()
      .trim()
      .min(1, "O sobrenome é obrigatório.")
      .max(100, "O sobrenome deve ter no máximo 100 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "O e-mail é obrigatório.")
      .email("O e-mail é inválido.")
      .max(255, "O e-mail deve ter no máximo 255 caracteres."),
    usuario: z.string().trim().regex(/^[A-Za-z0-9._-]{3,50}$/, MENSAGEM_USUARIO),
    senha: z.string().min(8, MENSAGEM_SENHA).max(128, MENSAGEM_SENHA),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem.",
  });

export type DadosLogin = z.infer<typeof esquemaLogin>;
export type DadosCadastro = z.infer<typeof esquemaCadastro>;
