// Espelho do contrato OpenAPI do backend (task-backend/specs/001-gerenciamento-tarefas-api/contracts/openapi.yaml)

export type Prioridade = "ALTA" | "MEDIA" | "BAIXA";
export type Situacao = "ABERTA" | "CONCLUIDA";
export type FiltroSituacao = "TODAS" | "ABERTAS" | "CONCLUIDAS";
export type DestinoMovimento = "TOPO" | "FINAL" | "POSICAO";
export type TipoRegistro = "CRIACAO" | "ALTERACAO" | "CONCLUSAO" | "REABERTURA";

export interface Tarefa {
  id: string;
  descricao: string;
  prioridade: Prioridade;
  situacao: Situacao;
  dataAbertura: string;
  dataPrevistaConclusao: string | null;
  dataConclusaoReal: string | null;
  valor: number;
  posicao: number;
  atrasada: boolean;
}

export interface TarefaRequisicao {
  descricao: string;
  prioridade: Prioridade;
  dataPrevistaConclusao: string | null;
  valor: number | null;
}

export interface MoverTarefaRequisicao {
  destino: DestinoMovimento;
  posicao?: number | null;
}

export interface RegistroHistorico {
  id: string;
  usuarioNome: string;
  dataHora: string;
  tipo: TipoRegistro;
  campo: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  descricao: string;
}

export interface ResumoFinanceiro {
  mes: number;
  ano: number;
  totalAGastar: number;
  totalFormatado: string;
}

export interface Preferencias {
  filtro: FiltroSituacao;
}

export interface CadastroUsuarioRequisicao {
  nome: string;
  sobrenome: string;
  email: string;
  usuario: string;
  senha: string;
}

export interface UsuarioCadastrado {
  usuario: string;
  email: string;
  nome: string;
}

/** Erro padronizado da API (RFC 9457). */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  erros?: { campo: string; mensagem: string }[];
}
