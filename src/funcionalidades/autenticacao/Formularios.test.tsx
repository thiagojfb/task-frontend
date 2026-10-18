import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
const roteador = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => roteador }));

import { signIn } from "next-auth/react";
import { FormularioCadastro } from "./FormularioCadastro";
import { FormularioLogin } from "./FormularioLogin";

const signInFalso = vi.mocked(signIn);

describe("FormularioLogin", () => {
  beforeEach(() => {
    signInFalso.mockReset();
    roteador.push.mockReset();
    roteador.refresh.mockReset();
  });

  it("deve entrar e navegar para o dashboard", async () => {
    const usuario = userEvent.setup();
    signInFalso.mockResolvedValue({ ok: true, error: undefined, code: undefined, status: 200, url: "/" });
    render(<FormularioLogin />);

    await usuario.type(screen.getByLabelText("Usuário"), "ana");
    await usuario.type(screen.getByLabelText("Senha"), "senha123");
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith("/"));
    expect(signInFalso).toHaveBeenCalledWith("credentials", { usuario: "ana", senha: "senha123", redirect: false });
  });

  it("deve exibir 'Usuário ou senha inválidos.' quando o Auth.js recusar", async () => {
    const usuario = userEvent.setup();
    signInFalso.mockResolvedValue({ ok: false, error: "CredentialsSignin", code: "credenciais_invalidas", status: 401, url: null });
    render(<FormularioLogin />);

    await usuario.type(screen.getByLabelText("Usuário"), "ana");
    await usuario.type(screen.getByLabelText("Senha"), "errada");
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Usuário ou senha inválidos.")).toBeInTheDocument();
    expect(roteador.push).not.toHaveBeenCalled();
  });

  it("deve tratar resposta ausente do signIn como indisponibilidade", async () => {
    const usuario = userEvent.setup();
    signInFalso.mockResolvedValue(undefined as never);
    render(<FormularioLogin />);
    await usuario.type(screen.getByLabelText("Usuário"), "ana");
    await usuario.type(screen.getByLabelText("Senha"), "x");
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText(/indisponível/)).toBeInTheDocument();
  });

  it("deve validar campos vazios sem chamar o Auth.js", async () => {
    const usuario = userEvent.setup();
    render(<FormularioLogin />);
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe o usuário.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(signInFalso).not.toHaveBeenCalled();
  });
});

describe("FormularioCadastro", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    signInFalso.mockReset();
    roteador.push.mockReset();
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
  });

  async function preencher(usuario: ReturnType<typeof userEvent.setup>) {
    await usuario.type(screen.getByLabelText("Nome"), "Carla");
    await usuario.type(screen.getByLabelText("Sobrenome"), "Dias");
    await usuario.type(screen.getByLabelText("E-mail"), "carla@exemplo.com.br");
    await usuario.type(screen.getByLabelText("Usuário"), "carla");
    await usuario.type(screen.getByLabelText("Senha"), "segredo123");
    await usuario.type(screen.getByLabelText("Confirmar senha"), "segredo123");
  }

  it("deve cadastrar, entrar automaticamente e navegar", async () => {
    const usuario = userEvent.setup();
    fetchFalso.mockResolvedValue(new Response("{}", { status: 201 }));
    signInFalso.mockResolvedValue({ ok: true, error: undefined, code: undefined, status: 200, url: "/" });
    render(<FormularioCadastro />);

    await preencher(usuario);
    await usuario.click(screen.getByRole("button", { name: "Criar conta e entrar" }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith("/"));
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe("/api/cadastro");
    expect(JSON.parse(opcoes.body)).toMatchObject({ usuario: "carla", senha: "segredo123" });
    expect(signInFalso).toHaveBeenCalledWith("credentials", { usuario: "carla", senha: "segredo123", redirect: false });
  });

  it("deve exibir o detalhe do ProblemDetail quando a API recusar", async () => {
    const usuario = userEvent.setup();
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ title: "Usuário já cadastrado", detail: "Já existe um usuário com este nome de usuário ou e-mail." }), { status: 409 }),
    );
    render(<FormularioCadastro />);

    await preencher(usuario);
    await usuario.click(screen.getByRole("button", { name: "Criar conta e entrar" }));

    expect(await screen.findByText("Já existe um usuário com este nome de usuário ou e-mail.")).toBeInTheDocument();
    expect(signInFalso).not.toHaveBeenCalled();
  });

  it("deve avisar quando a conta for criada mas o login automático falhar", async () => {
    const usuario = userEvent.setup();
    fetchFalso.mockResolvedValue(new Response("{}", { status: 201 }));
    signInFalso.mockResolvedValue({ ok: false, error: "CredentialsSignin", code: "indisponivel", status: 500, url: null });
    render(<FormularioCadastro />);

    await preencher(usuario);
    await usuario.click(screen.getByRole("button", { name: "Criar conta e entrar" }));

    expect(await screen.findByText(/Conta criada, mas não foi possível entrar automaticamente/)).toBeInTheDocument();
  });

  it("deve tolerar resposta de erro sem JSON", async () => {
    const usuario = userEvent.setup();
    fetchFalso.mockResolvedValue(new Response("falha", { status: 500 }));
    render(<FormularioCadastro />);
    await preencher(usuario);
    await usuario.click(screen.getByRole("button", { name: "Criar conta e entrar" }));
    expect(await screen.findByText(/código 500/)).toBeInTheDocument();
  });

  it("deve mostrar erros de validação em português", async () => {
    const usuario = userEvent.setup();
    render(<FormularioCadastro />);
    await usuario.type(screen.getByLabelText("Senha"), "abc12345");
    await usuario.type(screen.getByLabelText("Confirmar senha"), "diferente");
    await usuario.click(screen.getByRole("button", { name: "Criar conta e entrar" }));
    expect(await screen.findByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
