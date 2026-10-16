import { esteiras as esteirasBase } from "@/mocks/data";
import type { Api, ContratoApi, EsteiraCatalogo, ModeloDados, OperacaoApi } from "@/types";

/* ---------- Esteiras: cada uma pertence a um Produto e aponta para os pipelines no GitLab ---------- */

const VINCULO: Record<string, { produtoId: string; grupo: string }> = {
  "pipe-001": { produtoId: "prj-001", grupo: "smart" },
  "pipe-002": { produtoId: "prj-002", grupo: "smart" },
  "pipe-003": { produtoId: "prj-002", grupo: "smart" },
  "pipe-004": { produtoId: "prj-007", grupo: "smart" },
};

export const esteirasCatalogo: EsteiraCatalogo[] = esteirasBase.map((e) => {
  const vinculo = VINCULO[e.id] ?? { produtoId: "prj-001", grupo: "smart" };
  const repo = e.repositorio.split("/").pop() ?? e.repositorio;
  const extras =
    e.id === "pipe-002"
      ? [
          { nome: "Publicação em produção", status: "Agendada" as const },
          { nome: "Teste de carga", status: "Ignorada" as const },
        ]
      : e.id === "pipe-003"
        ? [{ nome: "Validação do contrato", status: "Cancelada" as const }]
        : [];
  return {
    ...e,
    estagios: [...e.estagios, ...extras],
    produtoId: vinculo.produtoId,
    urlPipelines: `https://codigo.dev.tools.go.gov.br/${vinculo.grupo}/${repo}/-/pipelines`,
  };
});

/* ---------- Catálogo de APIs ---------- */

const pessoa: ModeloDados = {
  nome: "Servidor",
  campos: [
    { nome: "id", tipo: "string (uuid)", obrigatorio: true, descricao: "Identificador do servidor." },
    { nome: "nome", tipo: "string", obrigatorio: true, descricao: "Nome completo." },
    { nome: "matricula", tipo: "string", obrigatorio: true, descricao: "Matrícula funcional." },
    { nome: "lotacao", tipo: "Lotacao", obrigatorio: false, descricao: "Unidade de lotação atual.", modeloRef: "Lotacao" },
    { nome: "situacao", tipo: "string", obrigatorio: true, descricao: "Ativo, afastado ou aposentado." },
  ],
};
const lotacao: ModeloDados = {
  nome: "Lotacao",
  campos: [
    { nome: "orgao", tipo: "string", obrigatorio: true, descricao: "Sigla do órgão." },
    { nome: "unidade", tipo: "string", obrigatorio: true, descricao: "Nome da unidade." },
    { nome: "desde", tipo: "date", obrigatorio: false, descricao: "Data de início na unidade." },
  ],
};
const erro: ModeloDados = {
  nome: "Erro",
  campos: [
    { nome: "codigo", tipo: "string", obrigatorio: true, descricao: "Código estável do erro." },
    { nome: "mensagem", tipo: "string", obrigatorio: true, descricao: "Mensagem para quem consome a API." },
    { nome: "detalhes", tipo: "string[]", obrigatorio: false, descricao: "Detalhes adicionais, quando houver." },
  ],
};

const operacoesServidores: OperacaoApi[] = [
  {
    metodo: "GET",
    caminho: "/servidores",
    resumo: "Lista os servidores com paginação",
    parametros: [
      { nome: "pagina", local: "consulta", tipo: "integer", obrigatorio: false, descricao: "Número da página, começando em 1." },
      { nome: "situacao", local: "consulta", tipo: "string", obrigatorio: false, descricao: "Filtra por situação." },
    ],
    respostas: [
      { codigo: "200", descricao: "Lista de servidores.", modelo: "Servidor", exemplo: '[\n  { "id": "9f1c", "nome": "Ana Ribeiro", "matricula": "102938", "situacao": "Ativo" }\n]' },
      { codigo: "500", descricao: "Erro interno.", modelo: "Erro" },
    ],
  },
  {
    metodo: "POST",
    caminho: "/servidores",
    resumo: "Cadastra um servidor",
    parametros: [],
    corpo: { tipoConteudo: "application/json", modelo: "Servidor", exemplo: '{\n  "nome": "Carlos Menezes",\n  "matricula": "204857"\n}' },
    respostas: [
      { codigo: "201", descricao: "Servidor criado.", modelo: "Servidor" },
      { codigo: "422", descricao: "Dados inválidos.", modelo: "Erro", exemplo: '{ "codigo": "VALIDACAO", "mensagem": "Matrícula já cadastrada." }' },
    ],
  },
  {
    metodo: "GET",
    caminho: "/servidores/{id}",
    resumo: "Consulta um servidor pelo identificador",
    parametros: [{ nome: "id", local: "caminho", tipo: "string (uuid)", obrigatorio: true, descricao: "Identificador do servidor." }],
    respostas: [
      { codigo: "200", descricao: "Servidor encontrado.", modelo: "Servidor" },
      { codigo: "404", descricao: "Servidor não encontrado.", modelo: "Erro" },
    ],
  },
  {
    metodo: "PUT",
    caminho: "/servidores/{id}",
    resumo: "Substitui os dados de um servidor",
    parametros: [{ nome: "id", local: "caminho", tipo: "string (uuid)", obrigatorio: true, descricao: "Identificador do servidor." }],
    corpo: { tipoConteudo: "application/json", modelo: "Servidor" },
    respostas: [
      { codigo: "200", descricao: "Servidor atualizado.", modelo: "Servidor" },
      { codigo: "404", descricao: "Servidor não encontrado.", modelo: "Erro" },
    ],
  },
  {
    metodo: "PATCH",
    caminho: "/servidores/{id}/lotacao",
    resumo: "Altera a lotação de um servidor",
    parametros: [{ nome: "id", local: "caminho", tipo: "string (uuid)", obrigatorio: true, descricao: "Identificador do servidor." }],
    corpo: { tipoConteudo: "application/json", modelo: "Lotacao" },
    respostas: [{ codigo: "204", descricao: "Lotação alterada." }, { codigo: "404", descricao: "Servidor não encontrado.", modelo: "Erro" }],
  },
  {
    metodo: "DELETE",
    caminho: "/servidores/{id}",
    resumo: "Remove um servidor (use a inativação)",
    obsoleta: true,
    parametros: [{ nome: "id", local: "caminho", tipo: "string (uuid)", obrigatorio: true, descricao: "Identificador do servidor." }],
    respostas: [{ codigo: "204", descricao: "Servidor removido." }, { codigo: "403", descricao: "Operação não permitida.", modelo: "Erro" }],
  },
];

const yamlServidores = `openapi: 3.0.3
info:
  title: API de Servidores
  version: v3
servers:
  - url: https://api.go.gov.br/api/v3/servidores
paths:
  /servidores:
    get:
      summary: Lista os servidores com paginação
      parameters:
        - name: pagina
          in: query
          schema: { type: integer }
      responses:
        "200": { description: Lista de servidores }
    post:
      summary: Cadastra um servidor
      responses:
        "201": { description: Servidor criado }
  /servidores/{id}:
    get:
      summary: Consulta um servidor pelo identificador
      responses:
        "200": { description: Servidor encontrado }
        "404": { description: Servidor não encontrado }
`;

/** Contrato pequeno, para as APIs que não são o foco da demonstração. */
function contratoSimples(titulo: string, base: string, versao: string, ambientes: Api["ambientes"], recurso: string): ContratoApi {
  const caminho = `/${recurso}`;
  return {
    padrao: true,
    formato: "YAML",
    resumo: `${titulo} — ${versao}`,
    conteudo: `openapi: 3.0.3\ninfo:\n  title: ${titulo}\n  version: ${versao}\npaths:\n  ${caminho}:\n    get:\n      summary: Lista ${recurso}\n      responses:\n        "200": { description: Lista de ${recurso} }\n`,
    servidores: ambientes.map((ambiente) => ({ ambiente, url: `https://${ambiente === "Produção" ? "api" : ambiente === "Homologação" ? "api-hml" : "api-dev"}.go.gov.br${base}` })),
    grupos: [
      {
        nome: titulo,
        operacoes: [
          {
            metodo: "GET",
            caminho,
            resumo: `Lista ${recurso}`,
            parametros: [{ nome: "pagina", local: "consulta", tipo: "integer", obrigatorio: false, descricao: "Número da página." }],
            respostas: [{ codigo: "200", descricao: "Lista retornada com sucesso." }, { codigo: "500", descricao: "Erro interno.", modelo: "Erro" }],
          },
        ],
      },
    ],
    modelos: [erro],
  };
}

const servidoresV3: ContratoApi = {
  padrao: true,
  formato: "YAML",
  resumo: "Consulta e manutenção do cadastro de servidores do Estado.",
  descricao: "Esta API é a fonte única do cadastro funcional. Use os identificadores (uuid) em vez da matrícula para relacionar dados entre sistemas.",
  conteudo: yamlServidores,
  servidores: [
    { ambiente: "Homologação", url: "https://api-hml.go.gov.br/api/v3/servidores" },
    { ambiente: "Produção", url: "https://api.go.gov.br/api/v3/servidores" },
  ],
  grupos: [
    { nome: "Cadastro", operacoes: operacoesServidores.slice(0, 4) },
    { nome: "Lotação", operacoes: [operacoesServidores[4]!] },
    { nome: "", operacoes: [operacoesServidores[5]!] },
  ],
  modelos: [pessoa, lotacao, erro],
};

export const apis: Api[] = [
  { id: "api-servidores-v3", apiId: "api-servidores", nome: "API de Servidores", enderecoBase: "/api/v3/servidores", versao: "v3", ambientes: ["Homologação", "Produção"], produtoId: "prj-001", contrato: servidoresV3 },
  {
    id: "api-servidores-v4",
    apiId: "api-servidores",
    nome: "API de Servidores",
    enderecoBase: "/api/v4/servidores",
    versao: "v4",
    ambientes: ["Desenvolvimento"],
    produtoId: "prj-001",
    contrato: { ...servidoresV3, resumo: "Nova versão em desenvolvimento, com paginação por cursor.", servidores: [{ ambiente: "Desenvolvimento", url: "https://api-dev.go.gov.br/api/v4/servidores" }], conteudo: yamlServidores.replace("version: v3", "version: v4").replace("/api/v3/", "/api/v4/") },
  },
  { id: "api-autenticacao-v2", apiId: "api-autenticacao", nome: "API de Autenticação", enderecoBase: "/api/v2/oauth", versao: "v2", ambientes: ["Desenvolvimento", "Homologação", "Produção"], produtoId: "prj-003", contrato: contratoSimples("API de Autenticação", "/api/v2/oauth", "v2", ["Desenvolvimento", "Homologação", "Produção"], "token") },
  { id: "api-pagamentos-v1", apiId: "api-pagamentos", nome: "API de Pagamentos", enderecoBase: "/api/v1/pagamentos", versao: "v1", ambientes: ["Homologação"], produtoId: "prj-002", contrato: contratoSimples("API de Pagamentos", "/api/v1/pagamentos", "v1", ["Homologação"], "pagamentos") },
  { id: "api-conciliacao-v1", apiId: "api-conciliacao", nome: "API de Conciliação", enderecoBase: "/api/v1/conciliacao", versao: "v1", ambientes: ["Desenvolvimento", "Homologação"], produtoId: "prj-002", contrato: contratoSimples("API de Conciliação", "/api/v1/conciliacao", "v1", ["Desenvolvimento", "Homologação"], "lancamentos") },
  { id: "api-sistemas-v1", apiId: "api-sistemas", nome: "API do Catálogo de Sistemas", enderecoBase: "/api/v1/sistemas", versao: "v1", ambientes: ["Produção"], produtoId: "prj-003", contrato: contratoSimples("API do Catálogo de Sistemas", "/api/v1/sistemas", "v1", ["Produção"], "sistemas") },
  {
    id: "api-legado-v1",
    apiId: "api-legado",
    nome: "API Legada de Folha",
    enderecoBase: "/legado/folha",
    versao: "v1",
    ambientes: ["Produção"],
    produtoId: "prj-008",
    contrato: { padrao: false, formato: "JSON", conteudo: '{\n  "swagger": "1.2",\n  "apis": [{ "path": "/folha", "description": "Contracheques" }]\n}', servidores: [{ ambiente: "Produção", url: "https://legado.go.gov.br/legado/folha" }], grupos: [], modelos: [] },
  },
];
