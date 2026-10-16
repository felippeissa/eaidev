import { projetos as projetosSeed } from "@/mocks/data";
import {
  detalhePadrao,
  documentosPadrao,
  documentosPorProjeto,
  funcionalidades as funcionalidadesSeed,
  projetoDetalhes,
} from "@/mocks/workspace";
import type { Projeto } from "@/types";
import type {
  DocumentoProjeto,
  Funcionalidade,
  ProjetoDetalhe,
  OnboardingCenario,
  Repositorio,
} from "@/types/workspace";

const STORAGE_PROJETOS = "eai-dev-projetos";
const STORAGE_DETALHES = "eai-dev-projetos-detalhe";
/**
 * Mudanças em produtos que vieram dos mocks.
 *
 * Os de exemplo são um array importado, que não dá para alterar em memória.
 * Editar um deles grava a mudança à parte e a aplica na leitura — é o que
 * permite mexer neles sem tocar no arquivo de mocks.
 */
const STORAGE_ALTERADOS = "eai-dev-projetos-alterados";

type Persistido = { projetos: Projeto[]; detalhes: ProjetoDetalhe[] };

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

function delay<T>(valor: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

function lerLocal(): Persistido {
  if (typeof window === "undefined") return { projetos: [], detalhes: [] };
  try {
    const projetos = JSON.parse(window.localStorage.getItem(STORAGE_PROJETOS) ?? "[]") as Projeto[];
    const detalhes = JSON.parse(
      window.localStorage.getItem(STORAGE_DETALHES) ?? "[]",
    ) as ProjetoDetalhe[];
    return {
      // Produto gravado antes de o campo existir não tem `ativo`. Ler direto
      // deixaria a coluna vazia no navegador de quem já usou a tela, sem erro
      // nenhum — e quem estava em execução é ativo, que é o caso normal.
      projetos: Array.isArray(projetos)
        ? projetos.map((projeto) => ({ ...projeto, ativo: projeto.ativo ?? "Ativo" }))
        : [],
      detalhes: Array.isArray(detalhes) ? detalhes : [],
    };
  } catch {
    return { projetos: [], detalhes: [] };
  }
}

function gravarLocal(dados: Persistido) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PROJETOS, JSON.stringify(dados.projetos));
  window.localStorage.setItem(STORAGE_DETALHES, JSON.stringify(dados.detalhes));
}

function lerAlterados(): Record<string, Partial<Projeto>> {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(STORAGE_ALTERADOS);
    const dados = bruto ? (JSON.parse(bruto) as Record<string, Partial<Projeto>>) : {};
    return dados && typeof dados === "object" ? dados : {};
  } catch {
    return {};
  }
}

function todosProjetos(): Projeto[] {
  const local = lerLocal();
  const alterados = lerAlterados();
  return [...local.projetos, ...projetosSeed].map((projeto) => ({
    ...projeto,
    ...alterados[projeto.id],
  }));
}

export function listarProjetos(): Promise<Projeto[]> {
  return delay(todosProjetos());
}

export function obterProjeto(id: string): Promise<Projeto | undefined> {
  return delay(todosProjetos().find((p) => p.id === id));
}

/**
 * Grava a mudança na camada à parte, e não no produto.
 *
 * Vale para os dois casos sem ramificar: o produto criado aqui e o que veio
 * dos mocks. Na leitura os dois passam pelo mesmo merge.
 */
export function atualizarProjeto(id: string, patch: Partial<Projeto>): Promise<void> {
  if (typeof window !== "undefined") {
    const alterados = lerAlterados();
    window.localStorage.setItem(
      STORAGE_ALTERADOS,
      JSON.stringify({ ...alterados, [id]: { ...alterados[id], ...patch } }),
    );
  }
  return delay(undefined, 60);
}

/** Salva os repositórios do produto, que moram no detalhe e não no produto. */
export function salvarRepositorios(projetoId: string, repositorios: Repositorio[]): Promise<void> {
  const local = lerLocal();
  const atual =
    local.detalhes.find((d) => d.projetoId === projetoId) ??
    projetoDetalhes.find((d) => d.projetoId === projetoId) ??
    detalhePadrao(projetoId);
  const proximo = { ...atual, repositorios };
  gravarLocal({
    ...local,
    detalhes: [...local.detalhes.filter((d) => d.projetoId !== projetoId), proximo],
  });
  return delay(undefined, 60);
}

export function obterDetalhe(projetoId: string): Promise<ProjetoDetalhe> {
  const local = lerLocal();
  const encontrado =
    local.detalhes.find((d) => d.projetoId === projetoId) ??
    projetoDetalhes.find((d) => d.projetoId === projetoId);
  return delay(encontrado ?? detalhePadrao(projetoId));
}

export function listarDocumentos(projetoId: string): Promise<DocumentoProjeto[]> {
  return delay(documentosPorProjeto[projetoId] ?? documentosPadrao);
}

export function listarFuncionalidades(projetoId: string): Promise<Funcionalidade[]> {
  return delay(funcionalidadesSeed.filter((f) => f.projetoId === projetoId));
}

export function criarProjeto(entrada: {
  nome: string;
  descricao: string;
  orgao: string;
  responsavel: string;
  urlRaiz: string;
  repositorios: Repositorio[];
  cenario: OnboardingCenario;
  banco?: { banco: string; usuario: string } | undefined;
}): Promise<Projeto> {
  const local = lerLocal();
  const sufixo = String(local.projetos.length + projetosSeed.length + 1).padStart(3, "0");
  const projeto: Projeto = {
    id: `prj-${Math.random().toString(36).slice(2, 8)}`,
    nome: entrada.nome,
    codigo: `EAI-2026-${sufixo}`,
    orgao: entrada.orgao || "Não informado",
    status: "Planejado",
    // Produto nasce ativo: acabou de ser criado para ser trabalhado.
    ativo: "Ativo",
    responsavel: entrada.responsavel,
    progresso: 0,
    inicio: hoje(),
    prazo: "A definir",
    criticidade: "Média",
    descricao: entrada.descricao,
  };
  const wiki = entrada.repositorios.find((repo) => repo.tipo === "Wiki");
  const detalhe: ProjetoDetalhe = {
    projetoId: projeto.id,
    urlRaiz: entrada.urlRaiz,
    repositorios: entrada.repositorios,
    wikiRepositorioId: wiki?.id,
    onboardingCenario: entrada.cenario,
    onboardingEstado:
      entrada.cenario === "wiki" && wiki
        ? "workspace-ready"
        : entrada.cenario === "greenfield"
          ? "discovery"
          : "no-wiki",
    documentacaoStatus: wiki ? "SYNCED" : "DRAFT",
    banco: entrada.banco,
    ingestao: {
      documentos: entrada.repositorios.filter((r) => r.tipo === "Wiki").length * 6,
      trechos: entrada.repositorios.filter((r) => r.tipo === "Wiki").length * 180,
      atualizadoEm: hoje(),
      situacao: entrada.repositorios.some((r) => r.tipo === "Wiki") ? "Em andamento" : "Pendente",
    },
  };
  gravarLocal({
    projetos: [projeto, ...local.projetos],
    detalhes: [detalhe, ...local.detalhes],
  });
  return delay(projeto);
}

const templates = ["spring-boot-api", "angular-sakai", "wiki-markdown", "worker-batch"];

export function buscarRepositorios(
  urlRaiz: string,
  cenario: OnboardingCenario = "wiki",
): Promise<Repositorio[]> {
  if (cenario === "greenfield") return delay([]);
  const base = urlRaiz.replace(/\/$/, "");
  const nome = base.split("/").filter(Boolean).pop() ?? "produto";
  // Descoberto é sempre vinculado, nunca criado: a busca só encontra o que já
  // existe no GitLab, e a branch de um repositório existente é a que ele tem.
  const encontrados: Repositorio[] = [
    ...(cenario === "wiki"
      ? [
          {
            id: `r-${nome}-wiki`,
            nome: `${nome}-wiki`,
            url: `${base}/wiki`,
            tipo: "Wiki" as const,
            validado: true,
            descobertoEm: new Date().toISOString(),
            origem: "vinculado" as const,
            branch: "Develop",
          },
        ]
      : []),
    {
      id: `r-${nome}-api`,
      nome: `${nome}-api`,
      url: `${base}/api`,
      tipo: "API",
      validado: true,
      descobertoEm: new Date().toISOString(),
      origem: "vinculado",
      branch: "Develop",
    },
    {
      id: `r-${nome}-web`,
      nome: `${nome}-web`,
      url: `${base}/web`,
      tipo: "Front-end",
      validado: true,
      descobertoEm: new Date().toISOString(),
      origem: "vinculado",
      branch: "Develop",
    },
    {
      id: `r-${nome}-infra`,
      nome: `${nome}-infra`,
      url: `${base}/infra`,
      tipo: "Outro",
      validado: false,
      descobertoEm: new Date().toISOString(),
      origem: "vinculado",
      branch: "Develop",
    },
  ];
  return delay(encontrados, 600);
}

export const TEMPLATES_REPOSITORIO = templates;
