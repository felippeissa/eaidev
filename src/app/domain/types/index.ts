export * from "./spdd";

export type Projeto = {
  id: string;
  nome: string;
  codigo: string;
  orgao: string;
  /** Andamento do trabalho: onde o produto está no percurso. */
  status: "Em andamento" | "Planejado" | "Concluído" | "Pausado" | "Atrasado";
  /**
   * Vida do cadastro, que é outra coisa do que o andamento.
   *
   * Ativo é o produto que está em execução. Inativo é o que foi desativado —
   * não vai ser desenvolvido, mudou de rumo, ou simplesmente parou de existir
   * como produto. Um inativo não volta a "Planejado": ele sai de circulação
   * sem perder o histórico.
   */
  ativo: "Ativo" | "Inativo";
  responsavel: string;
  progresso: number;
  inicio: string;
  prazo: string;
  criticidade: "Alta" | "Média" | "Baixa";
  descricao: string;
};

export type Tarefa = {
  id: string;
  titulo: string;
  tipo: "Tarefa" | "Solicitação" | "Aprovação" | "Revisão";
  projeto: string;
  status: "Pendente" | "Em andamento" | "Aguardando" | "Concluído";
  prazo: string;
  prioridade: "Alta" | "Média" | "Baixa";
};

export type Software = {
  id: string;
  nome: string;
  tipo: "Aplicação" | "Serviço" | "Biblioteca" | "Banco de dados";
  linguagem: string;
  time: string;
  ambiente: "Produção" | "Homologação" | "Desenvolvimento";
  saude: "Saudável" | "Degradado" | "Indisponível";
  versao: string;
  dependencias: string[];
  descricao: string;
};

export type ApiAntiga = {
  id: string;
  nome: string;
  versao: string;
  metodoPrincipal: string;
  ambiente: "Produção" | "Homologação";
  status: "Ativo" | "Deprecado" | "Rascunho";
  time: string;
  chamadasDia: number;
  latencia: number;
};

export type Esteira = {
  id: string;
  nome: string;
  repositorio: string;
  branch: string;
  status: SituacaoPipeline;
  duracao: string;
  estagios: {
    nome: string;
    status: SituacaoPipeline;
    duracao?: string | undefined;
    responsavel?: string | undefined;
  }[];
  atualizadoEm: string;
  gitflow?: EsteiraGitFlow | undefined;
};

export type Execucao = {
  id: string;
  rotina: string;
  gatilho: "Agendado" | "Manual" | "Webhook";
  status: "Sucesso" | "Falha" | "Executando";
  inicio: string;
  duracao: string;
  responsavel: string;
  log: string[];
};

export type Incidente = {
  id: string;
  titulo: string;
  severidade: "Crítico" | "Alto" | "Médio" | "Baixo";
  status: "Aberto" | "Em andamento" | "Concluído";
  servico: string;
  aberto: string;
  responsavel: string;
  impacto: string;
};

export type ServicoSaude = {
  id: string;
  nome: string;
  status: "Saudável" | "Degradado" | "Indisponível";
  uptime: number;
  latencia: number;
  ultimoCheck: string;
};

export type CustoItem = {
  id: string;
  recurso: string;
  categoria: "Computação" | "Armazenamento" | "Banco de dados" | "Rede" | "Observabilidade";
  projeto: string;
  valorMes: number;
  variacao: number;
};

export type Usuario = {
  id: string;
  login: string;
  nome: string;
  email: string;
  /** Uma pessoa pode atuar em mais de uma frente ao mesmo tempo. */
  times: string[];
  perfil: "Administrador" | "Gestor" | "Desenvolvedor" | "Leitor";
  /**
   * Ativo: aceitou o convite e está na plataforma.
   * Pendente: foi convidado e ainda não aceitou pelo e-mail.
   * Inativo: foi desativado ou saiu do projeto.
   */
  status: "Ativo" | "Pendente" | "Inativo";
};

export type Especificacao = {
  id: string;
  titulo: string;
  projeto: string;
  versao: string;
  status: "Rascunho" | "Em revisão" | "Aprovado";
  autor: string;
  atualizadoEm: string;
  conteudo: string;
};

export type DocNode = {
  id: string;
  titulo: string;
  filhos?: DocNode[] | undefined;
  conteudo?: string | undefined;
};

export type SelfServiceAcao = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  tempoMedio: string;
  aprovacao: boolean;
};

export type GrafoDado = {
  nos: { id: string; label: string; tipo: string; grau: number }[];
  arestas: { source: string; target: string; tipo: string }[];
};

export type GitFlowTipo = "master" | "develop" | "feature" | "release" | "hotfix";

export type EsteiraGitFlow = {
  tipo: GitFlowTipo;
  commit: string;
  autor: string;
  mergeAlvo: string;
  mensagem: string;
};

export type AgenteExecucao = {
  id: string;
  agente: string;
  spec: string;
  fase: "Constituição" | "Especificação" | "Plano" | "Tasks" | "Validação";
  artefato: string;
  status: "Sucesso" | "Falha" | "Executando" | "Aguardando aprovação";
  duracao: string;
  tokens: number;
  custo: number;
  iniciadoEm: string;
};

export type AgenteFaseResumo = {
  fase: "Constituição" | "Especificação" | "Plano" | "Tasks" | "Validação";
  specs: number;
  gatesPendentes: number;
  erros: number;
  tempoMedio: string;
  sucesso: number;
};

export type AgenteAlerta = {
  id: string;
  tipo: "Falha de geração" | "Timeout" | "Inconsistência" | "Custo acima do previsto";
  severidade: "Crítico" | "Alto" | "Médio";
  agente: string;
  spec: string;
  mensagem: string;
  quando: string;
};

export type ObservabilidadeResumo = {
  execucoes24h: number;
  taxaSucesso: number;
  falhas: number;
  aprovacoesPendentes: number;
  tokens: number;
  custoEstimado: number;
};

export type ComponenteSaude = {
  id: string;
  nome: string;
  status: "Saudável" | "Degradado" | "Indisponível";
  p95: string;
  detalhe: string;
};

export type ModeloMetrica = {
  id: string;
  nome: string;
  provider: string;
  execucoes: number;
  taxaSucesso: number;
  p50: string;
  p95: string;
  p99: string;
  tokens: number;
  custoEstimado: number;
  retries: number;
  fallbacks: number;
};

export type RoteamentoModelo = {
  capability: string;
  modeloPrimario: string;
  fallback: string;
  politica: string;
};

export type WorkflowNodeExecucao = {
  id: string;
  nome: string;
  status: "Concluído" | "Em andamento" | "Falha" | "Aguardando aprovação";
  duracao: string;
  modelo?: string | undefined;
  tokens?: number | undefined;
  detalhe?: string | undefined;
};

export type WorkflowExecucao = {
  id: string;
  workflow: string;
  projeto: string;
  especificacao: string;
  status: "Sucesso" | "Em andamento" | "Falha" | "Aguardando aprovação";
  duracao: string;
  p95: string;
  nodesExecutados: number;
  modeloPrincipal: string;
  humanGate: "Aprovado" | "Pendente" | "Não aplicável";
  inicio: string;
  traceId: string;
  correlationId: string;
  nodes: WorkflowNodeExecucao[];
};

export type ContextoMetrica = {
  consultas: number;
  p95Recuperacao: string;
  zeroResults: number;
  chunksRecuperados: number;
  falhasIndexacao: number;
  indiceAtivo: string;
  modeloEmbedding: string;
  dimensao: number;
  vectorStore: string;
  consumo: string;
  embeddingP95: string;
  milvusP95: string;
  retrievalP95: string;
};

export type IntegracaoMetrica = {
  id: string;
  nome: string;
  chamadas: number;
  taxaSucesso: number;
  p50: string;
  p95: string;
  p99: string;
  falhas: number;
  status: "Saudável" | "Degradado" | "Indisponível";
};

export type PublicacaoEtapa = {
  nome: string;
  status: "Concluído" | "Em andamento" | "Falha" | "Pendente";
};

export type PublicacaoMetrica = {
  id: string;
  especificacao: string;
  versao: string;
  projeto: string;
  status: "Concluída" | "Em andamento" | "NEEDS_ATTENTION";
  inicio: string;
  retry: number;
  etapas: PublicacaoEtapa[];
};

export type ObservabilidadeAlerta = {
  id: string;
  severidade: "Crítico" | "Alto" | "Médio";
  tipo:
    | "Falha de geração"
    | "Tempo limite"
    | "Inconsistência"
    | "Custo acima do previsto"
    | "Provider indisponível"
    | "Fallback excessivo"
    | "Workflow interrompido"
    | "Human Gate parado"
    | "Falha de indexação"
    | "Publicação em NEEDS_ATTENTION"
    | "MCP indisponível"
    | "Taxa de erro anormal";
  contexto: string;
  componente: string;
  projeto?: string | undefined;
  especificacao?: string | undefined;
  quando: string;
  mensagem: string;
  traceId?: string | undefined;
  correlationId?: string | undefined;
};

export type ImpactoEngenharia = {
  especificacoesAssistidas: number;
  aprovadasSemAlteracao: number;
  aprovadasComAjustes: number;
  rejeitadas: number;
  divergenciasDetectadas: number;
  tempoDefinirPublicar: string;
};

export type ObservabilidadePlataforma = {
  resumo: ObservabilidadeResumo;
  componentes: ComponenteSaude[];
  modelos: ModeloMetrica[];
  roteamentos: RoteamentoModelo[];
  workflows: WorkflowExecucao[];
  contexto: ContextoMetrica;
  integracoes: IntegracaoMetrica[];
  publicacoes: PublicacaoMetrica[];
  alertas: ObservabilidadeAlerta[];
  impactoEngenharia: ImpactoEngenharia;
};

export type McpFerramenta = {
  nome: string;
  acesso: "Leitura" | "Escrita";
  autorizada: boolean;
};

export type McpProjetoVinculo = {
  projetoId: string;
  autorizado: boolean;
  ferramentasAutorizadas: string[];
};

export type McpSaude = {
  ultimaVerificacao: string;
  latenciaMs: number;
  ultimoErro?: string | undefined;
  versaoProtocolo: string;
};

export type Conector = {
  id: string;
  nome: string;
  tipo: "Serviço" | "MCP";
  categoria: "Código" | "Gestão" | "Comunicação" | "Dados" | "Nuvem" | "MCP";
  descricao: string;
  escopos: string[];
  status: "Conectado" | "Desconectado" | "Aguardando autorização" | "Falha";
  conta?: string | undefined;
  atualizadoEm: string;
  /** Presente somente quando `tipo === "MCP"`. */
  mcp?:
    | {
        url: string;
        transporte: "Streamable HTTP" | "SSE" | "stdio";
        autenticacao: "OAuth 2.1" | "API Key" | "Nenhuma";
        credencial: string;
        ferramentas: McpFerramenta[];
        projetos: McpProjetoVinculo[];
        ultimoHandshake: string;
        saude: McpSaude;
      }
    | undefined;
};

export type Plugin = {
  id: string;
  nome: string;
  autor: string;
  versao: string;
  descricao: string;
  permissoes: string[];
  status: "Instalado" | "Disponível";
};

export type Skill = {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string;
  arquivos: string[];
  status: "Ativa" | "Rascunho";
  usos: number;
};


/* ---------- Esteiras ---------- */

export type SituacaoPipeline =
  | "Sucesso"
  | "Falha"
  | "Executando"
  | "Pendente"
  | "Agendada"
  | "Aguardando ação manual"
  | "Cancelada"
  | "Ignorada";

/** Esteira vinculada a um Produto, com o endereço dos pipelines no GitLab. */
export type EsteiraCatalogo = Esteira & {
  produtoId: string;
  urlPipelines: string;
};

/* ---------- Catálogo de APIs ---------- */

export type AmbienteApi = "Desenvolvimento" | "Homologação" | "Produção";

export type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ParametroApi = {
  nome: string;
  local: "caminho" | "consulta" | "cabeçalho";
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
};

export type RespostaApi = {
  codigo: string;
  descricao: string;
  modelo?: string | undefined;
  exemplo?: string | undefined;
};

export type OperacaoApi = {
  metodo: MetodoHttp;
  caminho: string;
  resumo: string;
  obsoleta?: boolean | undefined;
  parametros: ParametroApi[];
  corpo?: { tipoConteudo: string; modelo?: string | undefined; exemplo?: string | undefined } | undefined;
  respostas: RespostaApi[];
};

export type ModeloDados = {
  nome: string;
  campos: {
    nome: string;
    tipo: string;
    obrigatorio: boolean;
    descricao: string;
    modeloRef?: string | undefined;
  }[];
};

export type ContratoApi = {
  /** false = formato fora do padrão (sem a aba Documentação formatada). */
  padrao: boolean;
  formato: "YAML" | "JSON";
  /** Texto original do contrato (aba Arquivo). */
  conteudo: string;
  resumo?: string | undefined;
  descricao?: string | undefined;
  servidores: { ambiente: AmbienteApi; url: string }[];
  grupos: { nome: string; operacoes: OperacaoApi[] }[];
  modelos: ModeloDados[];
};

/** Uma linha do catálogo: uma versão de uma API. */
export type Api = {
  id: string;
  apiId: string;
  nome: string;
  enderecoBase: string;
  versao: string;
  ambientes: AmbienteApi[];
  produtoId: string;
  contrato: ContratoApi;
};
