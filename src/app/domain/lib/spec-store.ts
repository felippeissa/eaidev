import { FASES_PADRAO, specsSeed } from "@/mocks/specs";
import type {
  Spec,
  SpecAchado,
  SpecArtefato,
  SpecFase,
  SpecFaseEstado,
  SpecFaseId,
  SpecPacoteMcp,
  SpecTask,
  SpecFeature,
  SpecTaskEstado,
} from "@/types/spdd";

const STORAGE_KEY = "eai-dev-specs";

export const ORDEM_FASES: SpecFaseId[] = [
  "constituicao",
  "especificacao",
  "plano",
  "tasks",
  "validacao",
];

export const ESTADOS_KANBAN: { id: SpecFaseEstado; nome: string }[] = [
  { id: "pendente", nome: "Pendente" },
  { id: "gerando", nome: "Gerando" },
  { id: "revisao", nome: "Em revisão" },
  { id: "aprovada", nome: "Aprovada" },
];

export const ESTADOS_TASK: { id: SpecTaskEstado; nome: string }[] = [
  { id: "a_fazer", nome: "A fazer" },
  { id: "em_andamento", nome: "Em andamento" },
  { id: "concluida", nome: "Concluída" },
];

export const ROTULO_ARTEFATO: Record<SpecArtefato["tipo"], string> = {
  constituicao: "Constituição",
  requisitos: "Especificação e requisitos",
  plano: "Plano de implementação",
  arquitetura: "Arquitetura",
  "data-model": "Modelo de dados",
  contratos: "Contratos de API",
  regras: "Regras de negócio",
  tasks: "Tarefas",
  testes: "Cenários de teste e aceite",
  quickstart: "Guia rápido de verificação",
  "prompt-contexto": "Prompt de contexto",
};

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

function proporFeature(spec: Spec): SpecFeature {
  return {
    id: `${spec.id}-feat-001`,
    codigo: "FEAT-001",
    nome: spec.titulo,
    resumo: spec.promptInicial,
    patterns: ["UI", "API"],
    requirements: [
      {
        id: `${spec.id}-req-001`,
        titulo: "Requisito derivado da intenção",
        descricao: spec.promptInicial,
        status: "proposto",
      },
    ],
    businessRules: [],
    acceptanceCriteria: [
      {
        id: `${spec.id}-ac-001`,
        descricao: "Fluxo principal atende à intenção aprovada.",
        status: "pending",
      },
    ],
    operations: ["consultar"],
    impactedRepositories: [],
    taskIds: [],
    implementationStatus: "NOT STARTED",
  };
}

function normalizarSpec(item: Spec): Spec {
  const legado = item as Spec & { tipo?: string };
  return {
    ...item,
    codigo: item.codigo ?? `SPEC-${item.id.slice(-3).toUpperCase()}`,
    projetoId: item.projetoId ?? "prj-001",
    natureza: item.natureza ?? (legado.tipo === "Integração" ? "Integração" : "Mudança proposta"),
    referenciasDocumentais: item.referenciasDocumentais ?? [],
    artefatos: (item.artefatos ?? []).map((artefato) => ({
      ...artefato,
      versao: artefato.versao ?? item.versao,
      status: artefato.status ?? "draft",
    })),
    features: item.features ?? [],
    safeguards: item.safeguards ?? [],
    documentationImpact:
      item.status === "Publicada"
        ? {
            ...(item.documentationImpact ?? { status: "published", items: [] }),
            status: "published",
            items: (item.documentationImpact?.items ?? []).map((impact) => ({
              ...impact,
              status: "published",
            })),
          }
        : (item.documentationImpact ?? { status: "not_started", items: [] }),
    versoes: (item.versoes ?? []).map((versao) => ({
      ...versao,
      imutavel: versao.imutavel ?? true,
    })),
    implementation: item.implementation ?? { status: "NOT STARTED", progress: 0, feedback: [] },
  };
}

function ler(): Spec[] {
  if (typeof window === "undefined") return specsSeed.map(normalizarSpec);
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    if (!bruto) return specsSeed.map(normalizarSpec);
    const dados = JSON.parse(bruto) as Spec[];
    return Array.isArray(dados) && dados.length > 0
      ? dados.map(normalizarSpec)
      : specsSeed.map(normalizarSpec);
  } catch {
    return specsSeed.map(normalizarSpec);
  }
}

function gravar(specs: Spec[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
}

function delay<T>(valor: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

export function listarSpecs(): Promise<Spec[]> {
  return delay(ler());
}

export function obterSpec(id: string): Promise<Spec | undefined> {
  return delay(ler().find((s) => s.id === id));
}

function salvar(spec: Spec): Spec {
  const specs = ler();
  const atualizado = { ...spec, atualizadoEm: hoje() };
  const proximas = specs.some((s) => s.id === spec.id)
    ? specs.map((s) => (s.id === spec.id ? atualizado : s))
    : [atualizado, ...specs];
  gravar(proximas);
  return atualizado;
}

export function criarSpec(entrada: {
  titulo: string;
  projetoId: string;
  projeto: string;
  natureza: Spec["natureza"];
  promptInicial: string;
  referenciasDocumentais: string[];
  fluxo: Spec["fluxo"];
  autor: string;
}): Promise<Spec> {
  const id = `spec-${Math.random().toString(36).slice(2, 8)}`;
  const fases: SpecFase[] = FASES_PADRAO.map((f, indice) => ({
    ...f,
    estado: indice === 0 ? "pendente" : "pendente",
    responsavel: entrada.autor,
    atualizadoEm: hoje(),
    pendencias: [],
  }));
  const spec: Spec = {
    id,
    codigo: `SPEC-${String(Date.now()).slice(-3)}`,
    titulo: entrada.titulo,
    projetoId: entrada.projetoId,
    projeto: entrada.projeto,
    natureza: entrada.natureza,
    promptInicial: entrada.promptInicial,
    referenciasDocumentais: entrada.referenciasDocumentais,
    autor: entrada.autor,
    criadoEm: hoje(),
    atualizadoEm: hoje(),
    versao: "0.1",
    status: "Em elaboração",
    fluxo: entrada.fluxo,
    fases,
    artefatos: [],
    features: [],
    tasks: [],
    entidades: [],
    safeguards: ["Implementação ocorre externamente na IDE/coding assistant."],
    documentationImpact: { status: "not_started", items: [] },
    versoes: [],
    implementation: { status: "NOT STARTED", progress: 0, feedback: [] },
  };
  return delay(salvar(spec));
}

export function faseAnteriorAprovada(spec: Spec, faseId: SpecFaseId): boolean {
  const indice = ORDEM_FASES.indexOf(faseId);
  if (indice <= 0) return true;
  const anterior = spec.fases.find((f) => f.id === ORDEM_FASES[indice - 1]);
  return anterior?.estado === "aprovada";
}

export function validarTransicao(
  spec: Spec,
  faseId: SpecFaseId,
  destino: SpecFaseEstado,
): { ok: boolean; motivo?: string } {
  const fase = spec.fases.find((f) => f.id === faseId);
  if (!fase) return { ok: false, motivo: "Fase não encontrada." };
  if (spec.status === "Publicada")
    return {
      ok: false,
      motivo: "A especificação publicada é imutável. Crie uma nova versão para alterar.",
    };
  if (fase.estado === "gerando")
    return { ok: false, motivo: "A fase está sendo gerada e não aceita movimentação manual." };
  if (destino === "gerando")
    return { ok: false, motivo: 'Use "Gerar com IA" para colocar a fase em geração.' };
  if (!faseAnteriorAprovada(spec, faseId))
    return { ok: false, motivo: "A fase anterior precisa estar aprovada antes desta avançar." };
  if (destino === "aprovada") {
    if (fase.pendencias.length > 0)
      return { ok: false, motivo: "Resolva as pendências abertas antes de aprovar." };
    const temArtefato = spec.artefatos.some((a) => a.faseId === faseId);
    if (!temArtefato) return { ok: false, motivo: "A fase não tem artefato gerado." };
  }
  if (destino === "pendente" && spec.artefatos.some((a) => a.faseId === faseId))
    return { ok: false, motivo: "A fase já tem artefato; use “Em revisão”." };
  return { ok: true };
}

function recalcularStatus(spec: Spec): Spec {
  if (spec.status === "Publicada") return spec;
  const todasAprovadas = spec.fases.every((f) => f.estado === "aprovada");
  const alguma = spec.fases.some((f) => f.estado !== "pendente");
  return {
    ...spec,
    status: todasAprovadas ? "Aprovada" : alguma ? "Em revisão" : "Em elaboração",
  };
}

export function moverFase(
  specId: string,
  faseId: SpecFaseId,
  destino: SpecFaseEstado,
): Promise<{ spec?: Spec | undefined; erro?: string | undefined }> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay({ erro: "Especificação não encontrada." });
  const validacao = validarTransicao(spec, faseId, destino);
  if (!validacao.ok) return delay({ erro: validacao.motivo });
  const proxima = recalcularStatus({
    ...spec,
    fases: spec.fases.map((f) =>
      f.id === faseId ? { ...f, estado: destino, atualizadoEm: hoje(), erro: undefined } : f,
    ),
  });
  return delay({ spec: salvar(proxima) });
}

export function moverTask(
  specId: string,
  taskId: string,
  destino: SpecTaskEstado,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec || spec.status === "Publicada") return delay(undefined);
  const proxima = {
    ...spec,
    tasks: spec.tasks.map((t) => (t.id === taskId ? { ...t, estado: destino } : t)),
  };
  return delay(salvar(proxima));
}

export function salvarArtefato(
  specId: string,
  artefatoId: string,
  conteudo: string,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec || spec.status === "Publicada") return delay(undefined);
  const proxima = {
    ...spec,
    artefatos: spec.artefatos.map((a) =>
      a.id === artefatoId ? { ...a, conteudo, atualizadoEm: hoje() } : a,
    ),
  };
  return delay(salvar(proxima));
}

export function aplicarGeracao(
  specId: string,
  faseId: SpecFaseId,
  resultado: {
    artefatos: { tipo: SpecArtefato["tipo"]; titulo: string; formato: string; conteudo: string }[];
    tasks: Omit<SpecTask, "id" | "estado">[];
    entidades: Spec["entidades"];
    pendencias: string[];
  },
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined);
  const novos: SpecArtefato[] = resultado.artefatos.map((a) => ({
    id: `${faseId}-${a.tipo}`,
    faseId,
    tipo: a.tipo,
    titulo: a.titulo || ROTULO_ARTEFATO[a.tipo],
    formato: a.formato === "json" ? "json" : "markdown",
    conteudo: a.conteudo,
    autor: "Lovable AI",
    atualizadoEm: hoje(),
    versao: spec.versao,
    status: "draft",
  }));
  const restantes = spec.artefatos.filter(
    (a) => a.faseId !== faseId || !novos.some((n) => n.id === a.id),
  );
  const tasks: SpecTask[] =
    resultado.tasks.length > 0
      ? resultado.tasks.map((t, i) => ({ ...t, id: `t-${i + 1}-${Date.now()}`, estado: "a_fazer" }))
      : spec.tasks;
  const proxima = recalcularStatus({
    ...spec,
    artefatos: [...restantes, ...novos],
    features:
      faseId === "especificacao" && spec.features.length === 0
        ? [proporFeature(spec)]
        : spec.features,
    tasks,
    entidades: resultado.entidades.length > 0 ? resultado.entidades : spec.entidades,
    fases: spec.fases.map((f) =>
      f.id === faseId
        ? {
            ...f,
            estado: "revisao",
            pendencias: resultado.pendencias,
            atualizadoEm: hoje(),
            erro: undefined,
          }
        : f,
    ),
  });
  return delay(salvar(proxima), 60);
}

export function marcarFaseGerando(specId: string, faseId: SpecFaseId): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined, 0);
  return delay(
    salvar({
      ...spec,
      fases: spec.fases.map((f) =>
        f.id === faseId ? { ...f, estado: "gerando", erro: undefined } : f,
      ),
    }),
    0,
  );
}

export function marcarFaseErro(
  specId: string,
  faseId: SpecFaseId,
  erro: string,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined, 0);
  return delay(
    salvar({
      ...spec,
      fases: spec.fases.map((f) => (f.id === faseId ? { ...f, estado: "erro", erro } : f)),
    }),
    0,
  );
}

export function resolverPendencia(
  specId: string,
  faseId: SpecFaseId,
  pendencia: string,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined);
  return delay(
    salvar({
      ...spec,
      fases: spec.fases.map((f) =>
        f.id === faseId ? { ...f, pendencias: f.pendencias.filter((p) => p !== pendencia) } : f,
      ),
    }),
  );
}

/**
 * Some a fase de "Refinar a intenção" assim que as respostas são salvas, sem
 * esperar a geração terminar — a fase ainda passa por "Gerando" de novo em
 * seguida, mas as perguntas já respondidas não devem continuar pendentes na
 * tela enquanto isso acontece.
 */
export function limparPendencias(specId: string, faseId: SpecFaseId): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined, 0);
  return delay(
    salvar({
      ...spec,
      fases: spec.fases.map((f) => (f.id === faseId ? { ...f, pendencias: [] } : f)),
    }),
    0,
  );
}

export function revisarDocumentationImpact(
  specId: string,
  revisadoPor: string,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined);
  return delay(
    salvar({
      ...spec,
      documentationImpact: {
        ...spec.documentationImpact,
        status: "reviewed",
        reviewedBy: revisadoPor,
        items: spec.documentationImpact.items.map((item) => ({ ...item, status: "reviewed" })),
      },
    }),
  );
}

export function analisarConsistencia(spec: Spec): SpecAchado[] {
  const achados: SpecAchado[] = [];
  const requisitos = spec.artefatos.find((a) => a.tipo === "requisitos")?.conteudo ?? "";
  const testes = spec.artefatos.find((a) => a.tipo === "testes")?.conteudo ?? "";
  const stories = [...requisitos.matchAll(/US-\d+/g)].map((m) => m[0]);
  const storiesUnicas = [...new Set(stories)];

  for (const fase of spec.fases) {
    for (const pendencia of fase.pendencias) {
      achados.push({
        id: `pend-${fase.id}-${pendencia.slice(0, 12)}`,
        severidade: "Crítico",
        tipo: "Pendência aberta",
        mensagem: `${fase.nome}: ${pendencia}`,
      });
    }
  }

  if (requisitos.includes("NECESSITA ESCLARECIMENTO")) {
    achados.push({
      id: "esclarecimento",
      severidade: "Crítico",
      tipo: "Requisito ambíguo",
      mensagem: "A especificação contém marcações [NECESSITA ESCLARECIMENTO] não resolvidas.",
    });
  }

  for (const task of spec.tasks) {
    if (task.story && !storiesUnicas.includes(task.story)) {
      achados.push({
        id: `task-sem-story-${task.codigo}`,
        severidade: "Alto",
        tipo: "Tarefa sem requisito",
        mensagem: `${task.codigo} referencia ${task.story}, que não existe na especificação.`,
      });
    }
    for (const dep of task.dependeDe) {
      if (!spec.tasks.some((t) => t.codigo === dep)) {
        achados.push({
          id: `dep-${task.codigo}-${dep}`,
          severidade: "Alto",
          tipo: "Dependência inexistente",
          mensagem: `${task.codigo} depende de ${dep}, que não está na lista de tarefas.`,
        });
      }
    }
    if (task.criterios.length === 0) {
      achados.push({
        id: `task-sem-criterio-${task.codigo}`,
        severidade: "Médio",
        tipo: "Tarefa sem critério",
        mensagem: `${task.codigo} não tem critério de verificação.`,
      });
    }
  }

  for (const story of storiesUnicas) {
    if (spec.tasks.length > 0 && !spec.tasks.some((t) => t.story === story)) {
      achados.push({
        id: `story-sem-task-${story}`,
        severidade: "Alto",
        tipo: "Requisito sem tarefa",
        mensagem: `${story} não é coberta por nenhuma tarefa.`,
      });
    }
    if (testes && !testes.includes(story)) {
      achados.push({
        id: `story-sem-teste-${story}`,
        severidade: "Médio",
        tipo: "Requisito sem teste",
        mensagem: `${story} não aparece em nenhum cenário de teste.`,
      });
    }
  }

  const tiposEsperados: SpecArtefato["tipo"][] = [
    "constituicao",
    "requisitos",
    "plano",
    "arquitetura",
    "data-model",
    "contratos",
    "regras",
    "testes",
    "quickstart",
    "prompt-contexto",
  ];
  for (const tipo of tiposEsperados) {
    if (!spec.artefatos.some((a) => a.tipo === tipo)) {
      achados.push({
        id: `falta-${tipo}`,
        severidade: "Médio",
        tipo: "Artefato ausente",
        mensagem: `O artefato "${ROTULO_ARTEFATO[tipo]}" ainda não foi gerado.`,
      });
    }
  }

  return achados;
}

export function podePublicar(spec: Spec): { ok: boolean; motivo?: string } {
  if (spec.status === "Publicada") return { ok: false, motivo: "Esta versão já está publicada." };
  if (!spec.fases.every((f) => f.estado === "aprovada"))
    return { ok: false, motivo: "Todas as fases precisam estar aprovadas." };
  const criticos = analisarConsistencia(spec).filter((a) => a.severidade === "Crítico");
  if (criticos.length > 0)
    return { ok: false, motivo: `${criticos.length} pendência(s) crítica(s) na análise.` };
  if (spec.documentationImpact.status !== "reviewed")
    return {
      ok: false,
      motivo: "A análise de impacto documental precisa passar por revisão humana.",
    };
  return { ok: true };
}

export function publicarSpec(
  specId: string,
): Promise<{ spec?: Spec | undefined; erro?: string | undefined }> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay({ erro: "Especificação não encontrada." });
  const check = podePublicar(spec);
  if (!check.ok) return delay({ erro: check.motivo });
  const partes = spec.versao.split(".");
  const maior = Number(partes[0] ?? "0");
  const novaVersao = maior === 0 ? "1.0" : `${maior + 1}.0`;
  const proxima: Spec = {
    ...spec,
    versao: novaVersao,
    status: "Publicada",
    artefatos: spec.artefatos.map((artefato) => ({
      ...artefato,
      status: "published",
      versao: novaVersao,
    })),
    documentationImpact: {
      ...spec.documentationImpact,
      status: "published",
      items: spec.documentationImpact.items.map((item) => ({ ...item, status: "published" })),
    },
    publication: {
      publishedAt: hoje(),
      publishedBy: spec.autor,
      specificationVersion: novaVersao,
      wikiUpdate: {
        status: "published",
        paths: spec.documentationImpact.items.map((item) => item.path),
      },
      mcpPackage: { status: "available", resource: `eai-dev://specs/${spec.id}@${novaVersao}` },
    },
    versoes: [
      {
        versao: novaVersao,
        publicadoEm: hoje(),
        publicadoPor: spec.autor,
        resumo: `Publicação com ${spec.artefatos.length} artefatos e ${spec.tasks.length} tarefas.`,
        artefatos: spec.artefatos,
        imutavel: true,
      },
      ...spec.versoes,
    ],
  };
  return delay({ spec: salvar(proxima) });
}

export function reabrirSpec(specId: string): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined);
  return delay(
    salvar({
      ...spec,
      status: "Em revisão",
      fases: spec.fases.map((f) => ({ ...f, estado: "revisao" })),
    }),
  );
}

export function salvarFeature(specId: string, feature: SpecFeature): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec || spec.status === "Publicada") return delay(undefined);
  const features = spec.features.some((item) => item.id === feature.id)
    ? spec.features.map((item) => (item.id === feature.id ? feature : item))
    : [...spec.features, feature];
  return delay(salvar({ ...spec, features }));
}

export function removerFeature(specId: string, featureId: string): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec || spec.status === "Publicada") return delay(undefined);
  return delay(
    salvar({ ...spec, features: spec.features.filter((feature) => feature.id !== featureId) }),
  );
}

export function registrarFeedback(
  specId: string,
  evento: Omit<Spec["implementation"]["feedback"][number], "id" | "createdAt">,
): Promise<Spec | undefined> {
  const spec = ler().find((s) => s.id === specId);
  if (!spec) return delay(undefined);
  const status = evento.type === "divergence" ? "DRIFT DETECTED" : spec.implementation.status;
  return delay(
    salvar({
      ...spec,
      implementation: {
        status,
        progress:
          evento.type === "implementation_completed"
            ? 100
            : Math.max(spec.implementation.progress, 60),
        feedback: [
          { ...evento, id: `feedback-${Date.now()}`, createdAt: hoje() },
          ...spec.implementation.feedback,
        ],
      },
    }),
  );
}

export function montarPacoteMcp(spec: Spec): SpecPacoteMcp {
  return {
    project: {
      id: spec.projetoId,
      nome: spec.projeto,
      repositorios: [...new Set(spec.features.flatMap((feature) => feature.impactedRepositories))],
    },
    spec: {
      id: spec.id,
      codigo: spec.codigo,
      titulo: spec.titulo,
      projeto: spec.projeto,
      versao: spec.versao,
      status: spec.status,
      promptInicial: spec.promptInicial,
    },
    features: spec.features,
    artefatos: spec.artefatos.map((a) => ({
      tipo: a.tipo,
      titulo: a.titulo,
      formato: a.formato,
      conteudo: a.conteudo,
      featureId: a.featureId,
    })),
    entidades: spec.entidades,
    tasks: spec.tasks.map((t) => ({
      codigo: t.codigo,
      titulo: t.titulo,
      story: t.story,
      featureId: t.featureId,
      dependeDe: t.dependeDe,
      paralelizavel: t.paralelizavel,
      prompt: t.prompt,
      criterios: t.criterios,
    })),
    safeguards: spec.safeguards,
    operations: [
      "list_specs",
      "get_spec",
      "get_feature",
      "get_requirement",
      "get_task",
      "get_context",
      "start_implementation",
      "update_task_status",
      "report_evidence",
      "report_test_result",
      "report_divergence",
      "finish_implementation",
    ],
    promptContexto:
      spec.artefatos.find((a) => a.tipo === "prompt-contexto")?.conteudo ??
      `Implemente a especificação "${spec.titulo}" respeitando a constituição, o modelo de dados e os contratos anexados.`,
    geradoEm: hoje(),
  };
}

export function contextoAprovado(spec: Spec, faseId: SpecFaseId): string {
  const indice = ORDEM_FASES.indexOf(faseId);
  return spec.artefatos
    .filter((a) => ORDEM_FASES.indexOf(a.faseId) < indice)
    .map((a) => `## ${a.titulo}\n\n${a.conteudo}`)
    .join("\n\n");
}
