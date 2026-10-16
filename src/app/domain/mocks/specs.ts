import type { Spec, SpecArtefato, SpecFase, SpecFeature } from "@/types/spdd";

const hoje = "11/08/2026";

function fase(
  id: SpecFase["id"],
  nome: string,
  descricao: string,
  estado: SpecFase["estado"],
  responsavel: string,
  pendencias: string[] = [],
): SpecFase {
  return { id, nome, descricao, estado, responsavel, atualizadoEm: hoje, pendencias };
}

export const FASES_PADRAO: Omit<
  SpecFase,
  "estado" | "responsavel" | "atualizadoEm" | "pendencias"
>[] = [
  {
    id: "constituicao",
    nome: "Constituição",
    descricao: "Princípios que toda fase seguinte precisa respeitar.",
  },
  {
    id: "especificacao",
    nome: "Especificação",
    descricao: "Contexto, histórias de usuário, critérios de aceite e escopo.",
  },
  {
    id: "plano",
    nome: "Plano & Arquitetura",
    descricao: "Decisões técnicas, modelo de dados, contratos e regras de negócio.",
  },
  {
    id: "tasks",
    nome: "Tarefas",
    descricao: "Tarefas ordenadas por dependência, cada uma com prompt pronto.",
  },
  {
    id: "validacao",
    nome: "Validação",
    descricao: "Cenários de teste, aceite e quickstart de verificação.",
  },
];

function art(
  faseId: SpecArtefato["faseId"],
  tipo: SpecArtefato["tipo"],
  titulo: string,
  conteudo: string,
  autor: string,
  formato: SpecArtefato["formato"] = "markdown",
): SpecArtefato {
  return {
    id: `${faseId}-${tipo}`,
    faseId,
    tipo,
    titulo,
    formato,
    conteudo,
    autor,
    atualizadoEm: hoje,
    versao: "0.1",
    status: "draft",
  };
}

function feature(
  codigo: string,
  nome: string,
  resumo: string,
  patterns: SpecFeature["patterns"],
  status: SpecFeature["implementationStatus"],
  impactedRepositories: string[],
  taskIds: string[] = [],
): SpecFeature {
  return {
    id: codigo.toLowerCase(),
    codigo,
    nome,
    resumo,
    patterns,
    requirements: [
      {
        id: `${codigo}-REQ-001`,
        titulo: `Requisito principal de ${nome}`,
        descricao: resumo,
        status: "aprovado",
      },
    ],
    businessRules: [
      {
        codigo: `${codigo}-RN-001`,
        descricao: "Toda alteração deve preservar a trilha de auditoria.",
        status: "aprovada",
      },
    ],
    acceptanceCriteria: [
      {
        id: `${codigo}-AC-001`,
        descricao: "Fluxo principal concluído conforme a intenção aprovada.",
        status: status === "ALIGNED" ? "met" : "pending",
      },
      {
        id: `${codigo}-AC-002`,
        descricao: "Testes e evidências disponíveis para revisão.",
        status: "pending",
      },
    ],
    operations: patterns.includes("CRUD")
      ? ["listar", "criar", "editar", "detalhar"]
      : ["consultar"],
    impactedRepositories,
    taskIds,
    implementationStatus: status,
  };
}

function impact(
  items: { path: string; action: "create" | "update" | "no_change"; diff: string }[],
  status: Spec["documentationImpact"]["status"] = "not_started",
): Spec["documentationImpact"] {
  return {
    status,
    items: items.map((item) => ({
      ...item,
      status: status === "published" ? "published" : "proposed",
    })),
  };
}

function implementation(
  status: Spec["implementation"]["status"],
  progress: number,
): Spec["implementation"] {
  return {
    status,
    progress,
    feedback: [
      {
        id: `feedback-${status.toLowerCase().replaceAll(" ", "-")}`,
        type: status === "NOT STARTED" ? "implementation_started" : "evidence",
        message:
          status === "NOT STARTED"
            ? "A implementação ainda não foi iniciada."
            : "Feedback mockado recebido da IDE.",
        repository: "portal-servidor-api",
        branch: "feature/spec-001",
        createdAt: hoje,
      },
    ],
  };
}

const contratoCatalogo = JSON.stringify(
  {
    openapi: "3.0.3",
    info: { title: "API de Solicitações de Acesso", version: "1.0.0" },
    paths: {
      "/solicitacoes": {
        get: {
          summary: "Lista solicitações de acesso",
          parameters: [{ name: "status", in: "query", schema: { type: "string" } }],
          responses: { "200": { description: "Lista paginada de solicitações" } },
        },
        post: {
          summary: "Cria uma solicitação de acesso",
          responses: { "201": { description: "Solicitação criada" } },
        },
      },
      "/solicitacoes/{id}/decisao": {
        post: {
          summary: "Aprova ou nega uma solicitação",
          responses: { "200": { description: "Decisão registrada" } },
        },
      },
    },
  },
  null,
  2,
);

export const specsSeed: Spec[] = [
  {
    id: "spec-001",
    codigo: "SPEC-042",
    titulo: "Solicitação de acesso a sistemas",
    projetoId: "prj-001",
    projeto: "Portal do Servidor 3.0",
    natureza: "Mudança proposta",
    promptInicial:
      "Preciso de um fluxo em que o servidor solicita acesso a um sistema do catálogo, o gestor aprova ou nega, e o pedido fica auditado com histórico.",
    referenciasDocumentais: ["doc-requisitos-autoatendimento", "doc-integracao-gov"],
    autor: "Diego Fontes",
    criadoEm: "28/07/2026",
    atualizadoEm: hoje,
    versao: "1.0",
    status: "Publicada",
    fluxo: "gates",
    fases: [
      fase("constituicao", "Constituição", FASES_PADRAO[0]!.descricao, "aprovada", "Ana Ribeiro"),
      fase(
        "especificacao",
        "Especificação",
        FASES_PADRAO[1]!.descricao,
        "aprovada",
        "Diego Fontes",
      ),
      fase("plano", "Plano & Arquitetura", FASES_PADRAO[2]!.descricao, "aprovada", "Juliana Prado"),
      fase("tasks", "Tarefas", FASES_PADRAO[3]!.descricao, "aprovada", "Diego Fontes"),
      fase("validacao", "Validação", FASES_PADRAO[4]!.descricao, "aprovada", "Rafael Duarte"),
    ],
    artefatos: [
      art(
        "constituicao",
        "constituicao",
        "Constituição",
        "# Constituição\n\n1. Toda tela segue o design system Informatiza 3.0, sem cor fora dos tokens.\n2. Interface e mensagens em português do Brasil.\n3. Toda ação sensível registra trilha de auditoria.\n4. Regra de negócio validada no servidor, nunca só na interface.\n5. Nenhum requisito entra em desenvolvimento sem critério de aceite verificável.",
        "Ana Ribeiro",
      ),
      art(
        "especificacao",
        "requisitos",
        "Especificação e requisitos",
        '# Solicitação de acesso a sistemas\n\n## Contexto\n\nHoje o pedido de acesso chega por e-mail e não há rastro de quem aprovou.\n\n## Histórias de usuário\n\n### US-1 — Solicitar acesso\nComo servidor, quero solicitar acesso a um sistema do catálogo informando justificativa.\n\nCritérios de aceite:\n- Dado um sistema do catálogo, quando envio a solicitação com justificativa preenchida, então ela é criada com situação "Pendente".\n- Justificativa vazia impede o envio com mensagem no campo.\n\n### US-2 — Decidir solicitação\nComo gestor, quero aprovar ou negar solicitações da minha área.\n\nCritérios de aceite:\n- A decisão exige parecer quando for negativa.\n- Após decidir, a solicitação não pode ser alterada.\n\n### US-3 — Auditar histórico\nComo administrador, quero ver o histórico completo de cada solicitação.\n\n## Escopo\n\n- Criação, decisão e consulta de solicitações.\n- Notificação por e-mail ao solicitante.\n\n## Fora de escopo\n\n- Provisionamento automático no sistema alvo.\n- Revisão periódica de acessos.',
        "Diego Fontes",
      ),
      art(
        "plano",
        "plano",
        "Plano de implementação",
        "# Plano\n\n## Abordagem\n\nEntregar em três incrementos: cadastro da solicitação, fila de decisão do gestor e trilha de auditoria.\n\n## Decisões\n\n- Situação da solicitação como máquina de estados explícita (Pendente, Aprovada, Negada, Cancelada).\n- Notificação assíncrona, para não bloquear o envio.\n\n## Riscos\n\n- Hierarquia de gestores incompleta na base de usuários — mitigar com fallback para o administrador da área.",
        "Juliana Prado",
      ),
      art(
        "plano",
        "arquitetura",
        "Arquitetura",
        "# Arquitetura\n\n```text\nInterface (Portal) -> API de Solicitações -> Banco\n                                  \\-> Fila de notificação -> Serviço de e-mail\n```\n\n## Componentes\n\n- Tela de solicitação e fila de decisão no Portal.\n- Serviço de Solicitações: validações, máquina de estados e auditoria.\n- Integração de leitura com o Catálogo de Sistemas.",
        "Juliana Prado",
      ),
      art(
        "plano",
        "data-model",
        "Modelo de dados",
        "# Modelo de dados\n\n## Solicitação\n\n| Campo | Tipo | Obrigatório |\n| --- | --- | --- |\n| id | uuid | sim |\n| sistema | referência (Catálogo) | sim |\n| solicitante | referência (Usuário) | sim |\n| justificativa | texto | sim |\n| situacao | enum | sim |\n| decididoPor | referência (Usuário) | não |\n| parecer | texto | não |\n\n## Evento de auditoria\n\nRegistra ação, autor, data e situação anterior/nova.",
        "Juliana Prado",
      ),
      art("plano", "contratos", "Contratos de API", contratoCatalogo, "Juliana Prado", "json"),
      art(
        "plano",
        "regras",
        "Regras de negócio",
        "# Regras de negócio\n\n- RN-1: Um servidor não pode ter duas solicitações pendentes para o mesmo sistema.\n- RN-2: Somente gestor da área do solicitante decide a solicitação.\n- RN-3: Negativa exige parecer com no mínimo 20 caracteres.\n- RN-4: Solicitação pendente há mais de 5 dias úteis é escalada ao gestor superior.\n- RN-5: Solicitação decidida é imutável.",
        "Juliana Prado",
      ),
      art(
        "tasks",
        "tasks",
        "Tarefas",
        "# Tarefas\n\nConsulte a aba de tarefas para a lista ordenada por dependência, com prompt individual.",
        "Diego Fontes",
      ),
      art(
        "validacao",
        "testes",
        "Cenários de teste e aceite",
        "# Cenários\n\n## CT-1 (US-1)\nEnviar solicitação válida cria registro Pendente e dispara notificação.\n\n## CT-2 (US-1)\nJustificativa vazia bloqueia o envio.\n\n## CT-3 (US-1, RN-1)\nSegunda solicitação pendente para o mesmo sistema é recusada.\n\n## CT-4 (US-2, RN-3)\nNegar sem parecer retorna erro de validação.\n\n## CT-5 (US-2, RN-5)\nAlterar solicitação já decidida retorna conflito.\n\n## CT-6 (US-3)\nHistórico exibe todas as transições em ordem cronológica.",
        "Rafael Duarte",
      ),
      art(
        "validacao",
        "quickstart",
        "Guia rápido de verificação",
        "# Guia rápido\n\n1. Entrar como servidor e abrir Catálogo > Sistemas.\n2. Solicitar acesso a um sistema informando justificativa.\n3. Entrar como gestor e abrir a fila de decisão.\n4. Aprovar uma solicitação e negar outra com parecer.\n5. Conferir o histórico das duas solicitações e o e-mail recebido.",
        "Rafael Duarte",
      ),
      art(
        "validacao",
        "prompt-contexto",
        "Prompt de contexto",
        'Você vai implementar a funcionalidade "Solicitação de acesso a sistemas" do Portal do Servidor 3.0. Respeite a constituição da especificação, o modelo de dados e os contratos de API anexados. Implemente uma tarefa por vez, na ordem de dependência, e valide cada uma pelos critérios de aceite antes de seguir.',
        "Diego Fontes",
      ),
    ],
    features: [
      feature(
        "FEAT-001",
        "Solicitação de acesso",
        "Servidor solicita acesso, gestor decide e o histórico permanece auditável.",
        ["Workflow", "API", "UI"],
        "IN PROGRESS",
        ["portal-servidor-api", "portal-servidor-web"],
        ["t1", "t2", "t3", "t4", "t5", "t6"],
      ),
      feature(
        "FEAT-002",
        "Notificação da decisão",
        "Solicitante recebe comunicação sobre a decisão registrada.",
        ["Integration", "Event"],
        "DRIFT DETECTED",
        ["portal-servidor-api", "portal-servidor-integrations"],
        ["t6"],
      ),
    ],
    tasks: [
      {
        id: "t1",
        codigo: "T-001",
        titulo: "Criar modelo de dados de solicitação e auditoria",
        story: "US-1",
        dependeDe: [],
        paralelizavel: false,
        estado: "concluida",
        prompt:
          "Crie as tabelas de solicitação de acesso e de evento de auditoria conforme o artefato de modelo de dados, com a máquina de estados Pendente/Aprovada/Negada/Cancelada e índices por solicitante e situação.",
        criterios: [
          "Campos e tipos iguais ao modelo de dados",
          "Situação restrita aos quatro valores",
        ],
      },
      {
        id: "t2",
        codigo: "T-002",
        titulo: "Endpoint de criação de solicitação",
        story: "US-1",
        dependeDe: ["T-001"],
        paralelizavel: false,
        estado: "concluida",
        prompt:
          "Implemente POST /solicitacoes seguindo o contrato OpenAPI, validando justificativa obrigatória e a regra RN-1 de duplicidade.",
        criterios: ["CT-1 passa", "CT-2 passa", "CT-3 passa"],
      },
      {
        id: "t3",
        codigo: "T-003",
        titulo: "Tela de solicitação no Portal",
        story: "US-1",
        dependeDe: ["T-002"],
        paralelizavel: true,
        estado: "em_andamento",
        prompt:
          "Monte o formulário de solicitação com seleção de sistema do catálogo, justificativa e validação em linha, usando os tokens do design system.",
        criterios: ["Erros exibidos no campo", "Sem cor fora dos tokens"],
      },
      {
        id: "t4",
        codigo: "T-004",
        titulo: "Fila de decisão do gestor",
        story: "US-2",
        dependeDe: ["T-002"],
        paralelizavel: true,
        estado: "a_fazer",
        prompt:
          "Implemente a fila de decisão com aprovação e negativa, exigindo parecer na negativa (RN-3) e bloqueando alteração de solicitação decidida (RN-5).",
        criterios: ["CT-4 passa", "CT-5 passa"],
      },
      {
        id: "t5",
        codigo: "T-005",
        titulo: "Trilha de auditoria e histórico",
        story: "US-3",
        dependeDe: ["T-002", "T-004"],
        paralelizavel: false,
        estado: "a_fazer",
        prompt:
          "Registre cada transição na trilha de auditoria e exiba o histórico cronológico na tela de detalhe da solicitação.",
        criterios: ["CT-6 passa"],
      },
      {
        id: "t6",
        codigo: "T-006",
        titulo: "Notificação por e-mail",
        story: "US-1",
        dependeDe: ["T-002"],
        paralelizavel: true,
        estado: "a_fazer",
        prompt:
          "Dispare notificação assíncrona ao solicitante na criação e na decisão, sem bloquear a resposta da API.",
        criterios: ["Envio fora do caminho crítico", "Falha de e-mail não derruba a solicitação"],
      },
    ],
    entidades: [
      {
        nome: "Solicitação de acesso",
        descricao: "Pedido de acesso de um servidor a um sistema do catálogo.",
        campos: [
          {
            nome: "sistema",
            tipo: "referência",
            obrigatorio: true,
            descricao: "Sistema do catálogo",
          },
          {
            nome: "solicitante",
            tipo: "referência",
            obrigatorio: true,
            descricao: "Servidor solicitante",
          },
          {
            nome: "justificativa",
            tipo: "texto longo",
            obrigatorio: true,
            descricao: "Motivo do pedido",
          },
          {
            nome: "situacao",
            tipo: "enum",
            obrigatorio: true,
            descricao: "Pendente, Aprovada, Negada, Cancelada",
          },
          {
            nome: "parecer",
            tipo: "texto longo",
            obrigatorio: false,
            descricao: "Obrigatório na negativa",
          },
          { nome: "decididoEm", tipo: "data", obrigatorio: false, descricao: "Data da decisão" },
        ],
        operacoes: ["listar", "criar", "detalhar", "editar"],
      },
    ],
    safeguards: [
      "Nenhuma implementação é executada pelo EAI.dev.",
      "Mudança de intenção exige nova versão e ponto de aprovação humana.",
    ],
    documentationImpact: impact([
      {
        path: "/requisitos/usuarios.md",
        action: "update",
        diff: "Atualiza o fluxo e critérios de aceite.",
      },
      { path: "/regras/autenticacao.md", action: "no_change", diff: "Nenhuma alteração proposta." },
      { path: "/api/usuarios.md", action: "create", diff: "Adiciona contrato da nova operação." },
    ]),
    implementation: implementation("IN PROGRESS", 60),
    publication: {
      publishedAt: "08/08/2026",
      publishedBy: "Diego Fontes",
      specificationVersion: "1.0",
      wikiUpdate: { status: "published", paths: ["/requisitos/usuarios.md", "/api/usuarios.md"] },
      mcpPackage: { status: "available", resource: "eai-dev://specs/spec-001@1.0" },
    },
    versoes: [
      {
        versao: "1.0",
        publicadoEm: "08/08/2026",
        publicadoPor: "Diego Fontes",
        resumo: "Primeira publicação com os 11 artefatos e 6 tarefas.",
        artefatos: [],
        imutavel: true,
      },
    ],
  },
  {
    id: "spec-002",
    codigo: "SPEC-043",
    titulo: "Conciliação automática de pagamentos",
    projetoId: "prj-002",
    projeto: "Integração Expresso Pagamentos",
    natureza: "Integração",
    promptInicial:
      "Rotina diária que compara os lançamentos do gateway com o extrato bancário e abre incidente quando houver divergência.",
    referenciasDocumentais: [],
    autor: "Carlos Menezes",
    criadoEm: "02/08/2026",
    atualizadoEm: "10/08/2026",
    versao: "0.4",
    status: "Em revisão",
    fluxo: "gates",
    fases: [
      fase("constituicao", "Constituição", FASES_PADRAO[0]!.descricao, "aprovada", "Ana Ribeiro"),
      fase(
        "especificacao",
        "Especificação",
        FASES_PADRAO[1]!.descricao,
        "revisao",
        "Carlos Menezes",
        ["Definir tolerância de centavos aceitável na comparação"],
      ),
      fase("plano", "Plano & Arquitetura", FASES_PADRAO[2]!.descricao, "pendente", "Juliana Prado"),
      fase("tasks", "Tarefas", FASES_PADRAO[3]!.descricao, "pendente", "Carlos Menezes"),
      fase("validacao", "Validação", FASES_PADRAO[4]!.descricao, "pendente", "Rafael Duarte"),
    ],
    artefatos: [
      art(
        "constituicao",
        "constituicao",
        "Constituição",
        "# Constituição\n\n1. Toda rotina automática é idempotente.\n2. Divergência financeira nunca é corrigida sem registro.\n3. Interface e mensagens em português do Brasil.",
        "Ana Ribeiro",
      ),
      art(
        "especificacao",
        "requisitos",
        "Especificação e requisitos",
        "# Conciliação automática\n\n## Contexto\n\nA conferência é manual e leva duas horas por dia.\n\n## Histórias de usuário\n\n### US-1 — Conciliar automaticamente\nComo analista financeiro, quero que a rotina compare gateway e extrato às 03:00.\n\nCritérios de aceite:\n- Reexecução no mesmo dia não duplica resultados.\n- Divergência gera incidente de severidade Alto.\n\n## Perguntas abertas\n\n- [NECESSITA ESCLARECIMENTO] Existe tolerância de centavos aceitável na comparação?",
        "Carlos Menezes",
      ),
    ],
    features: [
      feature(
        "FEAT-003",
        "Conciliação diária",
        "Comparar gateway e extrato bancário e registrar divergências.",
        ["Job", "Integration", "Business Rule"],
        "PARTIALLY ALIGNED",
        ["pagamentos-core", "pagamentos-jobs"],
      ),
    ],
    tasks: [],
    entidades: [],
    safeguards: [
      "Nenhuma implementação é executada pelo EAI.dev.",
      "Mudança de intenção exige nova versão e ponto de aprovação humana.",
    ],
    documentationImpact: impact([
      {
        path: "/requisitos/usuarios.md",
        action: "update",
        diff: "Atualiza o fluxo e critérios de aceite.",
      },
      { path: "/regras/autenticacao.md", action: "no_change", diff: "Nenhuma alteração proposta." },
      { path: "/api/usuarios.md", action: "create", diff: "Adiciona contrato da nova operação." },
    ]),
    implementation: implementation("IN PROGRESS", 60),
    versoes: [],
  },
  {
    id: "spec-003",
    codigo: "SPEC-044",
    titulo: "Padrão de telemetria dos serviços",
    projetoId: "prj-004",
    projeto: "Observabilidade Corporativa",
    natureza: "Mudança proposta",
    promptInicial:
      "Padronizar métricas, logs e traces de todos os serviços com atributos obrigatórios de produto e ambiente.",
    referenciasDocumentais: [],
    autor: "Rafael Duarte",
    criadoEm: "08/08/2026",
    atualizadoEm: "09/08/2026",
    versao: "0.1",
    status: "Em elaboração",
    fluxo: "gates",
    fases: [
      fase("constituicao", "Constituição", FASES_PADRAO[0]!.descricao, "revisao", "Rafael Duarte"),
      fase(
        "especificacao",
        "Especificação",
        FASES_PADRAO[1]!.descricao,
        "pendente",
        "Rafael Duarte",
      ),
      fase("plano", "Plano & Arquitetura", FASES_PADRAO[2]!.descricao, "pendente", "Juliana Prado"),
      fase("tasks", "Tarefas", FASES_PADRAO[3]!.descricao, "pendente", "Rafael Duarte"),
      fase("validacao", "Validação", FASES_PADRAO[4]!.descricao, "pendente", "Rafael Duarte"),
    ],
    artefatos: [
      art(
        "constituicao",
        "constituicao",
        "Constituição",
        "# Constituição\n\n1. Todo serviço expõe métricas no padrão OpenTelemetry.\n2. Atributos produto e ambiente são obrigatórios.\n3. Log sem dado pessoal em texto claro.",
        "Rafael Duarte",
      ),
    ],
    features: [
      feature(
        "FEAT-004",
        "Telemetria obrigatória",
        "Padronizar métricas, logs e traces com atributos de produto e ambiente.",
        ["API", "Business Rule"],
        "NOT STARTED",
        ["observabilidade-services"],
      ),
    ],
    tasks: [],
    entidades: [],
    safeguards: [
      "Nenhuma implementação é executada pelo EAI.dev.",
      "Mudança de intenção exige nova versão e ponto de aprovação humana.",
    ],
    documentationImpact: impact([
      {
        path: "/requisitos/usuarios.md",
        action: "update",
        diff: "Atualiza o fluxo e critérios de aceite.",
      },
      { path: "/regras/autenticacao.md", action: "no_change", diff: "Nenhuma alteração proposta." },
      { path: "/api/usuarios.md", action: "create", diff: "Adiciona contrato da nova operação." },
    ]),
    implementation: implementation("IN PROGRESS", 60),
    versoes: [],
  },
];
