import type { Spec, SpecArtefato, SpecFaseId, SpecTask } from "@/types/spdd";

export type ResultadoGeracao = {
  artefatos: { tipo: SpecArtefato["tipo"]; titulo: string; formato: string; conteudo: string }[];
  tasks: Omit<SpecTask, "id" | "estado">[];
  entidades: Spec["entidades"];
  pendencias: string[];
};

/**
 * Gera localmente o rascunho de uma fase.
 *
 * No app em React a geração chama um modelo no servidor; aqui não há servidor,
 * então o rascunho é montado a partir do pedido inicial. O contrato é o mesmo
 * (artefatos, tarefas, entidades, pendências), para a tela não saber a diferença.
 */
export function gerarFaseLocal(spec: Spec, faseId: SpecFaseId, ajustes: string): Promise<ResultadoGeracao> {
  const base = `${spec.titulo} — ${spec.projeto}`;
  const pedido = spec.promptInicial.trim() || spec.titulo;
  // A marca de dúvida não volta para o texto: o ajuste é a resposta que a resolveu.
  const resultado = montar(faseId, base, pedido, ajustes.replace(/\[NECESSITA ESCLARECIMENTO\]\s*/g, "").trim());
  return new Promise((resolve) => setTimeout(() => resolve(resultado), 2500));
}

function montar(faseId: SpecFaseId, base: string, pedido: string, ajustes: string): ResultadoGeracao {
  const vazio = { tasks: [], entidades: [], pendencias: [] as string[] };
  switch (faseId) {
    case "constituicao":
      return {
        ...vazio,
        artefatos: [
          {
            tipo: "constituicao",
            titulo: "Constituição",
            formato: "markdown",
            conteudo: `# Constituição — ${base}\n\n1. Toda tela usa o design system do portal.\n2. Textos e mensagens em português do Brasil.\n3. Toda ação relevante gera registro de auditoria.\n4. Validações valem também no servidor.\n5. Nenhuma funcionalidade é entregue sem critério de aceite.\n`,
          },
        ],
      };
    case "especificacao":
      return {
        ...vazio,
        // Sem ajustes, a primeira geração deixa uma dúvida aberta: é o que faz o ciclo passar pela pendência.
        pendencias: ajustes ? [] : ["[NECESSITA ESCLARECIMENTO] Quem aprova a solicitação e em quanto tempo?"],
        artefatos: [
          {
            tipo: "requisitos",
            titulo: "Requisitos",
            formato: "markdown",
            conteudo: `# Requisitos — ${base}\n\n## Contexto\n${pedido}\n\n## User stories\n- **US-1** Como usuário, quero concluir o fluxo principal, para atingir o resultado esperado.\n  - Dado que estou autenticado, quando envio o pedido, então ele é registrado e confirmado.\n- **US-2** Como gestor, quero acompanhar os pedidos, para decidir com rapidez.\n${ajustes ? `\n## Decisões registradas\n${ajustes}\n` : ""}\n## Escopo\nFluxo principal, acompanhamento e auditoria.\n\n## Fora de escopo\nIntegrações externas não citadas no pedido.\n`,
          },
        ],
      };
    case "plano":
      return {
        ...vazio,
        artefatos: [
          { tipo: "plano", titulo: "Plano de implementação", formato: "markdown", conteudo: `# Plano — ${base}\n\nAbordagem incremental: modelo de dados, contratos, telas e auditoria.\n\n## Riscos\n- Regras de aprovação ainda sem dono.\n` },
          { tipo: "arquitetura", titulo: "Arquitetura", formato: "markdown", conteudo: "# Arquitetura\n\n```text\nFront-end -> API -> Banco\n              \\-> Auditoria\n```\n" },
          { tipo: "data-model", titulo: "Modelo de dados", formato: "markdown", conteudo: "# Modelo de dados\n\n| Entidade | Campos |\n| --- | --- |\n| Pedido | id, solicitante, situacao, criadoEm |\n" },
          { tipo: "contratos", titulo: "Contratos (OpenAPI)", formato: "json", conteudo: JSON.stringify({ openapi: "3.0.3", info: { title: base, version: "0.1" }, paths: { "/pedidos": { get: { summary: "Lista pedidos" }, post: { summary: "Cria pedido" } } } }, null, 2) },
          { tipo: "regras", titulo: "Regras de negócio", formato: "markdown", conteudo: "# Regras\n\n- **RN-1** Todo pedido nasce como Pendente.\n- **RN-2** Só o gestor aprova ou nega.\n" },
        ],
      };
    case "tasks": {
      const tarefas = [
        ["Criar o modelo de dados do pedido", "US-1", [], true],
        ["Expor a API de pedidos", "US-1", ["T-001"], false],
        ["Montar a tela de solicitação", "US-1", ["T-002"], false],
        ["Montar a tela de acompanhamento", "US-2", ["T-002"], true],
        ["Registrar auditoria das ações", "US-2", ["T-002"], true],
      ] as const;
      return {
        artefatos: [{ tipo: "tasks", titulo: "Tarefas", formato: "markdown", conteudo: `# Tarefas — ${base}\n\n${tarefas.map((t, i) => `- T-00${i + 1} ${t[0]}`).join("\n")}\n` }],
        entidades: [],
        pendencias: [],
        tasks: tarefas.map((t, i) => ({
          codigo: `T-00${i + 1}`,
          titulo: t[0],
          story: t[1],
          dependeDe: [...t[2]],
          paralelizavel: t[3],
          prompt: `Implemente: ${t[0]}. Contexto: ${pedido}. Siga a constituição e os contratos da especificação.`,
          criterios: ["Cobre o critério de aceite da história", "Tem teste automatizado"],
        })),
      };
    }
    case "validacao":
      return {
        ...vazio,
        artefatos: [
          { tipo: "testes", titulo: "Cenários de teste", formato: "markdown", conteudo: "# Cenários\n\n- **CT-1** (US-1, RN-1) Pedido enviado fica Pendente.\n- **CT-2** (US-2, RN-2) Gestor aprova um pedido.\n" },
          { tipo: "quickstart", titulo: "Guia rápido", formato: "markdown", conteudo: "# Guia rápido\n\n1. Entre com um usuário.\n2. Envie um pedido.\n3. Entre como gestor e aprove.\n" },
          { tipo: "prompt-contexto", titulo: "Prompt de contexto", formato: "markdown", conteudo: `Implemente a especificação "${base}" seguindo constituição, requisitos, plano e tarefas aprovados. Pedido original: ${pedido}` },
        ],
      };
  }
}
