/**
 * Os dez papéis que um repositório pode ter. Command API e Query API não
 * existem mais como tipos próprios — os dois entram em "Backend", que é o
 * mesmo balde para qualquer coisa do lado do servidor.
 */
export type RepositorioTipo =
  | "Wiki"
  | "API"
  | "Backend"
  | "Front-end"
  | "Consumer"
  | "Producer"
  | "BFF"
  | "Docs"
  | "MCP"
  | "Outro";

export type OnboardingCenario = "wiki" | "legado-sem-wiki" | "greenfield";
export type OnboardingEstado =
  "discovery" | "wiki-found" | "no-wiki" | "draft" | "review" | "published" | "workspace-ready";
export type DocumentacaoStatus =
  "DRAFT" | "IN REVIEW" | "PROPOSED DIFF" | "PUBLISHED" | "SYNC PENDING" | "SYNCED";

export type Repositorio = {
  id: string;
  nome: string;
  url: string;
  tipo: RepositorioTipo;
  validado: boolean;
  branch?: string | undefined;
  descobertoEm?: string | undefined;
  /**
   * Como o repositório entrou na lista: criado pela convenção do grupo, ou
   * vinculado — já existia no GitLab, seja por busca automática ou por URL
   * colada à mão. Não é o mesmo que `descobertoEm`: um repositório vinculado
   * manualmente também nunca foi criado por aqui.
   */
  origem?: "criado" | "vinculado" | undefined;
  /**
   * Ativo é o que está em uso. Arquivado saiu de circulação sem perder o
   * vínculo — ao contrário de desvincular, que tira da lista. Ausente conta
   * como Ativo, para repositório gravado antes deste campo existir.
   */
  status?: "Ativo" | "Arquivado" | undefined;
};

export type BancoDados = {
  banco: string;
  usuario: string;
};

export type IngestaoRag = {
  documentos: number;
  trechos: number;
  atualizadoEm: string;
  situacao: "Concluída" | "Em andamento" | "Pendente";
};

export type ProjetoDetalhe = {
  projetoId: string;
  urlRaiz: string;
  grupo?: string | undefined;
  subgrupo?: string | undefined;
  repositorios: Repositorio[];
  wikiRepositorioId?: string | undefined;
  onboardingCenario?: OnboardingCenario | undefined;
  onboardingEstado?: OnboardingEstado | undefined;
  documentacaoStatus?: DocumentacaoStatus | undefined;
  banco?: BancoDados | undefined;
  ingestao: IngestaoRag;
};

export type DocumentoProjeto = {
  id: string;
  titulo: string;
  classe: string;
  origem: string;
  versao: string;
  ambiente: "oficial" | "sandbox";
  conteudo: string;
  filhos?: DocumentoProjeto[] | undefined;
};

export type FuncionalidadeTipo =
  | "CRUD"
  | "Integração"
  | "Relatório"
  | "Workflow"
  | "Job/rotina"
  | "API"
  | "Tela"
  | "Regra de negócio";

export type PreviewCampo = {
  nome: string;
  rotulo: string;
  tipo: string;
  obrigatorio: boolean;
};

export type PreviewInterface =
  | {
      kind: "formulario";
      titulo: string;
      campos: PreviewCampo[];
      filtros: string[];
      colunas: string[];
    }
  | {
      kind: "workflow";
      titulo: string;
      etapas: { nome: string; responsavel: string; saidas: string[] }[];
    }
  | {
      kind: "relatorio";
      titulo: string;
      filtros: string[];
      colunas: string[];
      agregacoes: string[];
    }
  | {
      kind: "integracao";
      titulo: string;
      passos: { nome: string; sistema: string; detalhe: string }[];
    }
  | {
      kind: "sem-interface";
      titulo: string;
      motivo: string;
    };

export type PreviewContrato = {
  metodo: string;
  caminho: string;
  descricao: string;
  payload?: string | undefined;
};

export type PreviewCodigoArquivo = {
  camada: string;
  arquivo: string;
  linguagem: string;
  conteudo: string;
};

export type PreviewSpec = {
  interface: PreviewInterface;
  dados: {
    entidade: string;
    campos: { nome: string; tipo: string; nulo: boolean; descricao: string }[];
  }[];
  contratos: PreviewContrato[];
  regras: { codigo: string; descricao: string }[];
  criterios: string[];
  codigo: {
    json?: string | undefined;
    html?: string | undefined;
    scss?: string | undefined;
    backend: PreviewCodigoArquivo[];
  };
};

export type FuncionalidadeEstado = "Em especificação" | "Em revisão" | "Aprovada" | "Publicada";

export type Funcionalidade = {
  id: string;
  projetoId: string;
  specId?: string | undefined;
  nome: string;
  tipo: FuncionalidadeTipo;
  resumo: string;
  estado: FuncionalidadeEstado;
  versao: string;
  atualizadoEm: string;
  preview: PreviewSpec;
};

export type MensagemChat = {
  id: string;
  autor: "usuario" | "agente";
  texto: string;
  citacoes?: { titulo: string }[] | undefined;
};

export type DocBlocoTipo =
  | "paragrafo"
  | "h1"
  | "h2"
  | "h3"
  | "lista"
  | "numerada"
  | "checklist"
  | "citacao"
  | "divisor"
  | "codigo"
  | "callout"
  | "tabela";

export type DocBloco = {
  id: string;
  tipo: DocBlocoTipo;
  texto: string;
  marcado?: boolean | undefined;
  linguagem?: string | undefined;
};

export type DocVersao = {
  versao: string;
  atualizadoEm: string;
  /** Quem publicou esta versão. Um histórico sem autor não responde a "quem mudou isso". */
  autor: string;
  blocos: DocBloco[];
};

export type DocumentoWorkspace = {
  id: string;
  projetoId: string;
  /**
   * Página mãe, como na wiki do GitLab: a hierarquia é feita de páginas, em
   * qualquer profundidade, e não de pastas. Toda página pode ter filhas e
   * continua sendo um documento que se abre e se edita.
   */
  paiId?: string | undefined;
  /**
   * Quando esta página é o rascunho de uma oficial, o id da oficial.
   *
   * Serve para não abrir dois rascunhos da mesma página: editar de novo
   * reaproveita o que já existe, em vez de espalhar cópias.
   */
  rascunhoDe?: string | undefined;
  titulo: string;
  icone: string;
  classe: string;
  origem: string;
  versao: string;
  ambiente: "oficial" | "sandbox";
  documentacaoStatus: DocumentacaoStatus;
  wikiPath?: string | undefined;
  blocos: DocBloco[];
  atualizadoEm: string;
  versoes: DocVersao[];
};

export type DocArvore = {
  documentos: DocumentoWorkspace[];
};
