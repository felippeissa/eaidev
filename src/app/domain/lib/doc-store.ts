import { documentosPorProjeto } from "@/mocks/workspace";
import { lerSessao } from "@/lib/auth";
import { usuarios as usuariosSeed } from "@/mocks/data";
import type {
  DocArvore,
  DocBloco,
  DocBlocoTipo,
  DocVersao,
  DocumentoProjeto,
  DocumentoWorkspace,
} from "@/types/workspace";

/**
 * A chave sobe de v1 para v2 porque o formato mudou: o v1 guardava `pastas`
 * separadas e um `pastaId` em cada documento, e agora a hierarquia é feita de
 * páginas, por `paiId`. Lido pelo código novo, o dado antigo não quebra nada —
 * ele silenciosamente perde a hierarquia e mostra tudo na raiz, o que é pior
 * que um erro. Como é dado de protótipo, a árvore é semeada de novo a partir
 * dos mocks em vez de convertida.
 */
const STORAGE_KEY = "eai-dev-docs-v2";

type Persistido = Record<string, DocArvore>;

function agora() {
  return new Date().toISOString();
}

function id(prefixo: string) {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`;
}

function delay<T>(valor: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

/**
 * Próximo marco do documento: só o inteiro seguinte.
 *
 * Aceita o formato antigo ("3.2") do que já está gravado no navegador e
 * devolve o inteiro seguinte, para quem já usava a tela não ficar preso numa
 * numeração que não existe mais.
 */
function proximaVersao(atual: string) {
  // parseInt("3.2") devolve 3, e é isso que se quer: o formato antigo gravado
  // no navegador de quem já usou a tela vira o inteiro seguinte.
  const maior = Number.parseInt(atual, 10);
  return Number.isNaN(maior) ? 1 : maior + 1;
}

export function novoBloco(tipo: DocBlocoTipo = "paragrafo", texto = ""): DocBloco {
  return { id: id("b"), tipo, texto };
}

/** Converte markdown simples (mocks/wiki) em blocos do editor. */
export function markdownParaBlocos(markdown: string): DocBloco[] {
  const linhas = markdown.split("\n");
  const blocos: DocBloco[] = [];
  let emCodigo = false;
  let bufferCodigo: string[] = [];

  for (const linha of linhas) {
    if (linha.trim().startsWith("```")) {
      if (emCodigo) {
        blocos.push({ ...novoBloco("codigo", bufferCodigo.join("\n")), linguagem: "text" });
        bufferCodigo = [];
        emCodigo = false;
      } else {
        emCodigo = true;
      }
      continue;
    }
    if (emCodigo) {
      bufferCodigo.push(linha);
      continue;
    }
    const texto = linha.trim();
    if (!texto) continue;
    if (texto.startsWith("### ")) blocos.push(novoBloco("h3", texto.slice(4)));
    else if (texto.startsWith("## ")) blocos.push(novoBloco("h2", texto.slice(3)));
    else if (texto.startsWith("# ")) blocos.push(novoBloco("h1", texto.slice(2)));
    else if (texto.startsWith("> ")) blocos.push(novoBloco("citacao", texto.slice(2)));
    else if (/^[-*]\s/.test(texto)) blocos.push(novoBloco("lista", texto.replace(/^[-*]\s/, "")));
    else if (/^\d+\.\s/.test(texto))
      blocos.push(novoBloco("numerada", texto.replace(/^\d+\.\s/, "")));
    else if (texto === "---") blocos.push(novoBloco("divisor"));
    else blocos.push(novoBloco("paragrafo", texto));
  }

  if (blocos.length === 0) blocos.push(novoBloco());
  return blocos;
}

export function blocosParaMarkdown(blocos: DocBloco[]): string {
  return blocos
    .map((bloco) => {
      switch (bloco.tipo) {
        case "h1":
          return `# ${bloco.texto}`;
        case "h2":
          return `## ${bloco.texto}`;
        case "h3":
          return `### ${bloco.texto}`;
        case "lista":
          return `- ${bloco.texto}`;
        case "numerada":
          return `1. ${bloco.texto}`;
        case "checklist":
          return `- [${bloco.marcado ? "x" : " "}] ${bloco.texto}`;
        case "citacao":
          return `> ${bloco.texto}`;
        case "divisor":
          return "---";
        case "codigo":
          return `\`\`\`${bloco.linguagem ?? ""}\n${bloco.texto}\n\`\`\``;
        default:
          return bloco.texto;
      }
    })
    .join("\n\n");
}

/**
 * Achata a árvore dos mocks guardando quem é mãe de quem.
 *
 * A hierarquia vem de `filhos` no mock e vira `paiId` em cada documento, em
 * qualquer profundidade — não há mais o degrau único de pasta.
 */
function achatar(
  nodes: DocumentoProjeto[],
  projetoId: string,
  paiId?: string | undefined,
): DocumentoWorkspace[] {
  return nodes.flatMap((node) => [
    paraWorkspace(node, projetoId, paiId),
    ...achatar(node.filhos ?? [], projetoId, node.id),
  ]);
}

/** Constrói a árvore inicial a partir dos mocks de documentação ingerida. */
function semear(projetoId: string): DocArvore {
  const raiz = documentosPorProjeto[projetoId];
  if (!raiz) return { documentos: [] };
  return { documentos: achatar(raiz, projetoId) };
}

/**
 * Reconstrói o histórico de uma página que já nasce numa versão avançada.
 *
 * Uma página em v4 sem nenhuma versão anterior é uma contradição visível: o
 * número diz que houve três publicações antes, e o histórico diz que não
 * houve nenhuma. Aqui as anteriores são derivadas do conteúdo atual — a
 * página vai encurtando para trás, como se tivesse crescido a cada revisão —
 * e datadas em semanas anteriores.
 */
/** Quem está usando a aplicação agora, para assinar a versão que publicar. */
function autorAtual() {
  return lerSessao()?.usuario.nome ?? "Equipe do produto";
}

function historicoAnterior(versaoAtual: string, blocos: DocBloco[], hoje: Date): DocVersao[] {
  const atual = Number.parseInt(versaoAtual, 10);
  if (Number.isNaN(atual) || atual <= 1) return [];

  const anteriores: DocVersao[] = [];
  for (let numero = atual - 1; numero >= 1; numero -= 1) {
    // Cada versão para trás tem uma parcela menor do conteúdo de hoje, com
    // pelo menos o primeiro bloco: versão vazia não seria uma versão.
    const parcela = Math.max(1, Math.round((blocos.length * numero) / atual));
    const data = new Date(hoje);
    data.setDate(data.getDate() - (atual - numero) * 21);
    anteriores.push({
      versao: `${numero}`,
      atualizadoEm: data.toISOString(),
      // Autores variados, e não sempre o mesmo: um histórico em que tudo foi
      // escrito pela mesma pessoa não mostra para que serve a coluna.
      autor: usuariosSeed[(atual + numero) % usuariosSeed.length]?.nome ?? "Equipe do produto",
      blocos: blocos.slice(0, parcela),
    });
  }
  return anteriores;
}

function paraWorkspace(
  doc: DocumentoProjeto,
  projetoId: string,
  paiId: string | undefined,
): DocumentoWorkspace {
  const blocos = markdownParaBlocos(doc.conteudo);
  return {
    id: doc.id,
    projetoId,
    paiId,
    titulo: doc.titulo,
    icone: "📄",
    classe: doc.classe,
    origem: doc.origem,
    versao: doc.versao,
    ambiente: doc.ambiente,
    documentacaoStatus: doc.ambiente === "oficial" ? "SYNCED" : "DRAFT",
    blocos,
    atualizadoEm: agora(),
    versoes: historicoAnterior(doc.versao, blocos, new Date()),
  };
}

function lerTudo(): Persistido {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    const dados = bruto ? (JSON.parse(bruto) as Persistido) : {};
    return dados && typeof dados === "object" ? dados : {};
  } catch {
    return {};
  }
}

function gravarTudo(dados: Persistido) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function lerProjeto(projetoId: string): DocArvore {
  const tudo = lerTudo();
  const existente = tudo[projetoId];
  if (existente) {
    return {
      ...existente,
      documentos: existente.documentos.map((documento) => ({
        ...documento,
        documentacaoStatus:
          documento.documentacaoStatus ?? (documento.ambiente === "oficial" ? "SYNCED" : "DRAFT"),
      })),
    };
  }
  const semeada = semear(projetoId);
  gravarTudo({ ...tudo, [projetoId]: semeada });
  return semeada;
}

function gravarProjeto(projetoId: string, arvore: DocArvore) {
  gravarTudo({ ...lerTudo(), [projetoId]: arvore });
}

export function listarArvore(projetoId: string): Promise<DocArvore> {
  return delay(lerProjeto(projetoId));
}

export function criarDocumento(
  projetoId: string,
  entrada: {
    titulo?: string;
    paiId?: string | undefined;
    blocos?: DocBloco[];
    ambiente?: DocumentoWorkspace["ambiente"];
  } = {},
): Promise<DocumentoWorkspace> {
  const arvore = lerProjeto(projetoId);
  const documento: DocumentoWorkspace = {
    id: id("doc"),
    projetoId,
    paiId: entrada.paiId,
    titulo: entrada.titulo?.trim() || "Página sem título",
    icone: "📄",
    classe: "Rascunho",
    origem: "Criado no workspace",
    versao: "1",
    // Nasce no ambiente que está aberto na tela. Fixo em "sandbox", a página
    // era criada e sumia da árvore sempre que a aba escolhida era Oficial.
    ambiente: entrada.ambiente ?? "sandbox",
    // O status acompanha o ambiente. Em Oficial, "Rascunho" colidia com o
    // outro sentido da palavra — o da aba ao lado — e a página aparecia como
    // rascunho dentro da visão oficial. Uma página oficial recém-criada não é
    // rascunho: é oficial e ainda não foi para a wiki.
    documentacaoStatus: entrada.ambiente === "oficial" ? "SYNC PENDING" : "DRAFT",
    blocos: entrada.blocos ?? [novoBloco()],
    atualizadoEm: agora(),
    versoes: [],
  };
  gravarProjeto(projetoId, { ...arvore, documentos: [...arvore.documentos, documento] });
  return delay(documento);
}

/**
 * Abre um rascunho a partir de uma página oficial.
 *
 * A oficial não muda: ela é o que está publicado, e editá-la no lugar faria o
 * publicado divergir sem que ninguém tivesse decidido publicar. O trabalho
 * acontece na cópia, e a cópia vira oficial quando for publicada.
 *
 * Chamar de novo para a mesma página devolve o rascunho que já existe, em vez
 * de criar outro — dois rascunhos da mesma página não têm como conviver.
 */
export function abrirRascunho(
  projetoId: string,
  documentoId: string,
): Promise<DocumentoWorkspace | undefined> {
  const arvore = lerProjeto(projetoId);
  const existente = arvore.documentos.find(
    (doc) => doc.rascunhoDe === documentoId && doc.ambiente === "sandbox",
  );
  if (existente) return delay(existente);

  const oficial = arvore.documentos.find((doc) => doc.id === documentoId);
  if (!oficial) return delay(undefined);

  // O pai do rascunho é o rascunho do pai, quando já houver um: assim a árvore
  // de Rascunho espelha a hierarquia da Oficial em vez de achatar tudo na raiz.
  const paiRascunho = oficial.paiId
    ? arvore.documentos.find(
        (doc) => doc.rascunhoDe === oficial.paiId && doc.ambiente === "sandbox",
      )?.id
    : undefined;

  const rascunho: DocumentoWorkspace = {
    ...oficial,
    id: id("doc"),
    paiId: paiRascunho,
    rascunhoDe: oficial.id,
    ambiente: "sandbox",
    documentacaoStatus: "DRAFT",
    atualizadoEm: agora(),
    versoes: [],
  };
  gravarProjeto(projetoId, { ...arvore, documentos: [...arvore.documentos, rascunho] });
  return delay(rascunho);
}

export function atualizarDocumento(
  projetoId: string,
  documentoId: string,
  patch: Partial<Pick<DocumentoWorkspace, "titulo" | "icone" | "blocos" | "paiId" | "ambiente">>,
): Promise<DocumentoWorkspace | undefined> {
  const arvore = lerProjeto(projetoId);
  let atualizado: DocumentoWorkspace | undefined;
  const documentos = arvore.documentos.map((doc) => {
    if (doc.id !== documentoId) return doc;
    // Editar não transforma uma página oficial em rascunho. "Rascunho" é o
    // outro ambiente, a aba ao lado; dentro do Oficial a palavra passa a
    // significar duas coisas e a página aparece como rascunho na visão
    // oficial. O que uma edição em Oficial produz é divergência com a wiki,
    // que é exatamente "Sincronização pendente".
    const proximoStatus = (patch.ambiente ?? doc.ambiente) === "oficial" ? "SYNC PENDING" : "DRAFT";
    atualizado = { ...doc, ...patch, documentacaoStatus: proximoStatus, atualizadoEm: agora() };
    return atualizado;
  });
  gravarProjeto(projetoId, { ...arvore, documentos });
  return delay(atualizado, 60);
}

export function salvarVersao(
  projetoId: string,
  documentoId: string,
): Promise<DocumentoWorkspace | undefined> {
  const arvore = lerProjeto(projetoId);
  let atualizado: DocumentoWorkspace | undefined;
  const documentos = arvore.documentos.map((doc) => {
    if (doc.id !== documentoId) return doc;
    atualizado = {
      ...doc,
      // Inteiro, como as tags do GitLab: v1, v2, v3. Sem maior e menor —
      // documento não tem compatibilidade a quebrar, cada marco é um número.
      versao: `${proximaVersao(doc.versao)}`,
      atualizadoEm: agora(),
      versoes: [
        {
          versao: doc.versao,
          atualizadoEm: doc.atualizadoEm,
          autor: autorAtual(),
          blocos: doc.blocos,
        },
        ...doc.versoes,
      ].slice(0, 20),
    };
    return atualizado;
  });
  gravarProjeto(projetoId, { ...arvore, documentos });
  return delay(atualizado, 60);
}

export function revisarDocumento(
  projetoId: string,
  documentoId: string,
): Promise<DocumentoWorkspace | undefined> {
  const arvore = lerProjeto(projetoId);
  let atualizado: DocumentoWorkspace | undefined;
  const documentos = arvore.documentos.map((doc) => {
    if (doc.id !== documentoId) return doc;
    atualizado = { ...doc, documentacaoStatus: "IN REVIEW", atualizadoEm: agora() };
    return atualizado;
  });
  gravarProjeto(projetoId, { ...arvore, documentos });
  return delay(atualizado, 60);
}

/**
 * Publica: o rascunho passa a ser a oficial.
 *
 * Quando o rascunho nasceu de uma página oficial, ele **substitui** a origem
 * em vez de virar uma segunda página oficial com o mesmo assunto. Antes o
 * rascunho apenas trocava de ambiente, e a árvore Oficial ficava com duas
 * páginas — a antiga e a nova — sem nada dizendo qual valia.
 *
 * O conteúdo publicado vai para a página de origem, que guarda o próprio
 * histórico e mantém o id: quem tinha ligação com ela continua tendo. O
 * rascunho sai da árvore, porque virou a oficial.
 */
export function publicarDocumento(
  projetoId: string,
  documentoId: string,
): Promise<DocumentoWorkspace | undefined> {
  const arvore = lerProjeto(projetoId);
  const rascunho = arvore.documentos.find((doc) => doc.id === documentoId);
  if (!rascunho) return delay(undefined, 220);

  const origem = rascunho.rascunhoDe
    ? arvore.documentos.find((doc) => doc.id === rascunho.rascunhoDe)
    : undefined;

  if (origem) {
    const publicada: DocumentoWorkspace = {
      ...origem,
      titulo: rascunho.titulo,
      icone: rascunho.icone,
      blocos: rascunho.blocos,
      versao: `${proximaVersao(origem.versao)}`,
      documentacaoStatus: "SYNCED",
      atualizadoEm: agora(),
      versoes: [
        {
          versao: origem.versao,
          atualizadoEm: origem.atualizadoEm,
          autor: autorAtual(),
          blocos: origem.blocos,
        },
        ...origem.versoes,
      ].slice(0, 20),
    };
    gravarProjeto(projetoId, {
      ...arvore,
      documentos: arvore.documentos
        .filter((doc) => doc.id !== rascunho.id)
        // As filhas do rascunho passam a responder à oficial, senão ficariam
        // apontando para uma página que acabou de deixar de existir.
        .map((doc) =>
          doc.id === origem.id
            ? publicada
            : doc.paiId === rascunho.id
              ? { ...doc, paiId: origem.id }
              : doc,
        ),
    });
    return delay(publicada, 220);
  }

  // Rascunho que não veio de nenhuma oficial — uma página nova — só muda de
  // ambiente: não há origem para substituir.
  const promovida: DocumentoWorkspace = {
    ...rascunho,
    ambiente: "oficial",
    versao: `${proximaVersao(rascunho.versao)}`,
    documentacaoStatus: "SYNCED",
    atualizadoEm: agora(),
    versoes: [
      {
        versao: rascunho.versao,
        atualizadoEm: rascunho.atualizadoEm,
        autor: autorAtual(),
        blocos: rascunho.blocos,
      },
      ...rascunho.versoes,
    ].slice(0, 20),
  };
  gravarProjeto(projetoId, {
    ...arvore,
    documentos: arvore.documentos.map((doc) => (doc.id === rascunho.id ? promovida : doc)),
  });
  return delay(promovida, 220);
}

export function excluirDocumento(projetoId: string, documentoId: string): Promise<void> {
  const arvore = lerProjeto(projetoId);
  const excluido = arvore.documentos.find((doc) => doc.id === documentoId);
  gravarProjeto(projetoId, {
    ...arvore,
    documentos: arvore.documentos
      .filter((doc) => doc.id !== documentoId)
      // As filhas sobem para a mãe da página excluída, em vez de sumirem da
      // árvore apontando para algo que não existe mais.
      .map((doc) => (doc.paiId === documentoId ? { ...doc, paiId: excluido?.paiId } : doc)),
  });
  return delay(undefined, 60);
}

/** Importa documentação da wiki do GitLab (mock). */
export function gerarDraftDaBaseTecnica(projetoId: string): Promise<DocArvore> {
  const arvore = lerProjeto(projetoId);
  const mae = id("doc");
  const documentos: DocumentoWorkspace[] = [
    {
      id: mae,
      projetoId,
      titulo: "Rascunho de documentação",
      icone: "📁",
      classe: "Rascunho de documentação",
      origem: "Gerado a partir dos repositórios (mock)",
      versao: "1",
      ambiente: "sandbox",
      documentacaoStatus: "DRAFT",
      blocos: markdownParaBlocos(
        "Páginas propostas pelo agente a partir do que existe nos repositórios. Revise antes de publicar.",
      ),
      atualizadoEm: agora(),
      versoes: [],
    },
    {
      id: id("doc"),
      projetoId,
      paiId: mae,
      titulo: "Visão geral gerada a partir do sistema",
      icone: "📝",
      classe: "Rascunho de documentação",
      origem: "Gerado a partir dos repositórios (mock)",
      versao: "1",
      ambiente: "sandbox",
      documentacaoStatus: "DRAFT",
      blocos: markdownParaBlocos(
        "# Visão geral\n\nRascunho gerado a partir dos repositórios descobertos. Revise as informações antes de publicar no wiki-repo.",
      ),
      atualizadoEm: agora(),
      versoes: [],
    },
  ];
  const proxima = { documentos: [...arvore.documentos, ...documentos] };
  gravarProjeto(projetoId, proxima);
  return delay(proxima, 500);
}

export function importarDaWiki(projetoId: string): Promise<DocArvore> {
  const arvore = lerProjeto(projetoId);
  const mae = id("doc");
  const modelos: { titulo: string; classe: string; conteudo: string }[] = [
    {
      titulo: "Visão geral do sistema",
      classe: "Visão geral",
      conteudo:
        "# Visão geral\n\nDescreve o objetivo do sistema, atores e principais processos.\n\n- Atores: servidor, gestor, auditoria\n- Processos: cadastro, análise, publicação",
    },
    {
      titulo: "Regras de negócio",
      classe: "Regra",
      conteudo:
        "## Regras\n\n1. Toda solicitação exige vínculo ativo.\n2. Alterações geram trilha de auditoria.\n3. Publicação depende de aprovação do gestor.",
    },
    {
      titulo: "Padrões de integração",
      classe: "Contrato",
      conteudo:
        "### Integrações\n\nAutenticação via OIDC e mensageria pelo barramento corporativo.\n\n```\nPOST /api/v1/eventos\n```",
    },
  ];
  const documentos: DocumentoWorkspace[] = modelos.map((modelo) => ({
    id: id("doc"),
    projetoId,
    paiId: mae,
    titulo: modelo.titulo,
    icone: "📘",
    classe: modelo.classe,
    origem: "wiki (GitLab)",
    versao: "1",
    ambiente: "oficial",
    documentacaoStatus: "SYNCED",
    blocos: markdownParaBlocos(modelo.conteudo),
    atualizadoEm: agora(),
    versoes: [],
  }));
  const proxima: DocArvore = {
    documentos: [
      ...arvore.documentos,
      {
        id: mae,
        projetoId,
        titulo: "Wiki do GitLab",
        icone: "📁",
        classe: "Wiki",
        origem: "wiki (GitLab)",
        versao: "1",
        ambiente: "oficial",
        documentacaoStatus: "SYNCED",
        blocos: markdownParaBlocos("Páginas importadas da wiki do repositório."),
        atualizadoEm: agora(),
        versoes: [],
      },
      ...documentos,
    ],
  };
  gravarProjeto(projetoId, proxima);
  return delay(proxima, 500);
}
