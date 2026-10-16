export type SpecFaseId = "constituicao" | "especificacao" | "plano" | "tasks" | "validacao";

export type SpecImplementationStatus =
  | "NOT STARTED"
  | "IN PROGRESS"
  | "ALIGNED"
  | "PARTIALLY ALIGNED"
  | "DRIFT DETECTED"
  | "REQUIRES SPEC UPDATE"
  | "VALIDATED";

export type SpecPattern =
  | "CRUD"
  | "API"
  | "Integration"
  | "Workflow"
  | "Event"
  | "Job"
  | "Report"
  | "UI"
  | "Business Rule"
  | "Data Migration"
  | "Architecture";

export type SpecFaseEstado = "pendente" | "gerando" | "revisao" | "aprovada" | "erro";

export type SpecArtefatoTipo =
  | "constituicao"
  | "requisitos"
  | "plano"
  | "arquitetura"
  | "data-model"
  | "contratos"
  | "regras"
  | "tasks"
  | "testes"
  | "quickstart"
  | "prompt-contexto";

export type SpecArtefatoStatus = "draft" | "in_review" | "approved" | "published";

export type SpecArtefato = {
  id: string;
  faseId: SpecFaseId;
  tipo: SpecArtefatoTipo;
  titulo: string;
  formato: "markdown" | "json";
  conteudo: string;
  autor: string;
  atualizadoEm: string;
  versao: string;
  status: SpecArtefatoStatus;
  featureId?: string | undefined;
};

export type SpecTaskEstado = "a_fazer" | "em_andamento" | "concluida";

export type SpecTask = {
  id: string;
  codigo: string;
  titulo: string;
  story: string;
  dependeDe: string[];
  paralelizavel: boolean;
  estado: SpecTaskEstado;
  prompt: string;
  criterios: string[];
  featureId?: string | undefined;
  implementationStatus?: SpecImplementationStatus | undefined;
};

export type SpecRequirement = {
  id: string;
  titulo: string;
  descricao: string;
  status: "proposto" | "revisado" | "aprovado";
};

export type SpecBusinessRule = {
  codigo: string;
  descricao: string;
  status: "proposta" | "revisada" | "aprovada";
};

export type SpecAcceptanceCriterion = {
  id: string;
  descricao: string;
  status: "pending" | "met" | "failed" | "not_applicable";
};

export type SpecFeature = {
  id: string;
  codigo: string;
  nome: string;
  resumo: string;
  patterns: SpecPattern[];
  requirements: SpecRequirement[];
  businessRules: SpecBusinessRule[];
  acceptanceCriteria: SpecAcceptanceCriterion[];
  operations: string[];
  impactedRepositories: string[];
  taskIds: string[];
  implementationStatus: SpecImplementationStatus;
};

export type SpecCampo = {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
};

export type SpecOperacao = "listar" | "criar" | "editar" | "excluir" | "detalhar";

export type SpecEntidade = {
  nome: string;
  descricao: string;
  campos: SpecCampo[];
  operacoes: SpecOperacao[];
};

export type SpecFase = {
  id: SpecFaseId;
  nome: string;
  descricao: string;
  estado: SpecFaseEstado;
  responsavel: string;
  atualizadoEm: string;
  pendencias: string[];
  erro?: string | undefined;
};

export type SpecVersao = {
  versao: string;
  publicadoEm: string;
  publicadoPor: string;
  resumo: string;
  artefatos: SpecArtefato[];
  imutavel: boolean;
};

export type SpecDocumentationImpactItem = {
  path: string;
  action: "create" | "update" | "no_change";
  diff: string;
  status: "proposed" | "reviewed" | "published";
};

export type SpecDocumentationImpact = {
  status: "not_started" | "in_review" | "reviewed" | "published";
  items: SpecDocumentationImpactItem[];
  reviewedBy?: string | undefined;
};

export type SpecPublication = {
  publishedAt: string;
  publishedBy: string;
  specificationVersion: string;
  wikiUpdate: { status: "pending" | "published"; paths: string[] };
  mcpPackage: { status: "generated" | "available"; resource: string };
};

export type SpecFeedbackEvent = {
  id: string;
  type:
    | "implementation_started"
    | "task_status"
    | "evidence"
    | "test_result"
    | "divergence"
    | "implementation_completed";
  message: string;
  repository?: string | undefined;
  branch?: string | undefined;
  createdAt: string;
};

export type SpecImplementation = {
  status: SpecImplementationStatus;
  progress: number;
  feedback: SpecFeedbackEvent[];
};

export type SpecStatus = "Em elaboração" | "Em revisão" | "Aprovada" | "Publicada";

export type Spec = {
  id: string;
  codigo: string;
  titulo: string;
  projetoId: string;
  projeto: string;
  natureza: "Mudança proposta" | "Correção" | "Integração";
  promptInicial: string;
  referenciasDocumentais: string[];
  autor: string;
  criadoEm: string;
  atualizadoEm: string;
  versao: string;
  status: SpecStatus;
  fluxo: "gates" | "completo";
  fases: SpecFase[];
  artefatos: SpecArtefato[];
  features: SpecFeature[];
  tasks: SpecTask[];
  entidades: SpecEntidade[];
  safeguards: string[];
  documentationImpact: SpecDocumentationImpact;
  versoes: SpecVersao[];
  publication?: SpecPublication | undefined;
  implementation: SpecImplementation;
};

export type SpecAchado = {
  id: string;
  severidade: "Crítico" | "Alto" | "Médio";
  tipo: string;
  mensagem: string;
};

export type SpecPacoteMcp = {
  project: { id: string; nome: string; repositorios: string[] };
  spec: {
    id: string;
    codigo: string;
    titulo: string;
    projeto: string;
    versao: string;
    status: SpecStatus;
    promptInicial: string;
  };
  features: SpecFeature[];
  artefatos: {
    tipo: SpecArtefatoTipo;
    titulo: string;
    formato: string;
    conteudo: string;
    featureId?: string | undefined;
  }[];
  entidades: SpecEntidade[];
  tasks: {
    codigo: string;
    titulo: string;
    story: string;
    featureId?: string | undefined;
    dependeDe: string[];
    paralelizavel: boolean;
    prompt: string;
    criterios: string[];
  }[];
  safeguards: string[];
  promptContexto: string;
  operations: string[];
  geradoEm: string;
};
