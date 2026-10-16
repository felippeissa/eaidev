import{c as m}from"./chunk-N3MG33RG.js";import{a as d,b as n}from"./chunk-4CMEKOL3.js";var g={"pipe-001":{produtoId:"prj-001",grupo:"smart"},"pipe-002":{produtoId:"prj-002",grupo:"smart"},"pipe-003":{produtoId:"prj-002",grupo:"smart"},"pipe-004":{produtoId:"prj-007",grupo:"smart"}},h=m.map(o=>{let e=g[o.id]??{produtoId:"prj-001",grupo:"smart"},a=o.repositorio.split("/").pop()??o.repositorio,s=o.id==="pipe-002"?[{nome:"Publica\xE7\xE3o em produ\xE7\xE3o",status:"Agendada"},{nome:"Teste de carga",status:"Ignorada"}]:o.id==="pipe-003"?[{nome:"Valida\xE7\xE3o do contrato",status:"Cancelada"}]:[];return n(d({},o),{estagios:[...o.estagios,...s],produtoId:e.produtoId,urlPipelines:`https://codigo.dev.tools.go.gov.br/${e.grupo}/${a}/-/pipelines`})}),I={nome:"Servidor",campos:[{nome:"id",tipo:"string (uuid)",obrigatorio:!0,descricao:"Identificador do servidor."},{nome:"nome",tipo:"string",obrigatorio:!0,descricao:"Nome completo."},{nome:"matricula",tipo:"string",obrigatorio:!0,descricao:"Matr\xEDcula funcional."},{nome:"lotacao",tipo:"Lotacao",obrigatorio:!1,descricao:"Unidade de lota\xE7\xE3o atual.",modeloRef:"Lotacao"},{nome:"situacao",tipo:"string",obrigatorio:!0,descricao:"Ativo, afastado ou aposentado."}]},b={nome:"Lotacao",campos:[{nome:"orgao",tipo:"string",obrigatorio:!0,descricao:"Sigla do \xF3rg\xE3o."},{nome:"unidade",tipo:"string",obrigatorio:!0,descricao:"Nome da unidade."},{nome:"desde",tipo:"date",obrigatorio:!1,descricao:"Data de in\xEDcio na unidade."}]},l={nome:"Erro",campos:[{nome:"codigo",tipo:"string",obrigatorio:!0,descricao:"C\xF3digo est\xE1vel do erro."},{nome:"mensagem",tipo:"string",obrigatorio:!0,descricao:"Mensagem para quem consome a API."},{nome:"detalhes",tipo:"string[]",obrigatorio:!1,descricao:"Detalhes adicionais, quando houver."}]},c=[{metodo:"GET",caminho:"/servidores",resumo:"Lista os servidores com pagina\xE7\xE3o",parametros:[{nome:"pagina",local:"consulta",tipo:"integer",obrigatorio:!1,descricao:"N\xFAmero da p\xE1gina, come\xE7ando em 1."},{nome:"situacao",local:"consulta",tipo:"string",obrigatorio:!1,descricao:"Filtra por situa\xE7\xE3o."}],respostas:[{codigo:"200",descricao:"Lista de servidores.",modelo:"Servidor",exemplo:`[
  { "id": "9f1c", "nome": "Ana Ribeiro", "matricula": "102938", "situacao": "Ativo" }
]`},{codigo:"500",descricao:"Erro interno.",modelo:"Erro"}]},{metodo:"POST",caminho:"/servidores",resumo:"Cadastra um servidor",parametros:[],corpo:{tipoConteudo:"application/json",modelo:"Servidor",exemplo:`{
  "nome": "Carlos Menezes",
  "matricula": "204857"
}`},respostas:[{codigo:"201",descricao:"Servidor criado.",modelo:"Servidor"},{codigo:"422",descricao:"Dados inv\xE1lidos.",modelo:"Erro",exemplo:'{ "codigo": "VALIDACAO", "mensagem": "Matr\xEDcula j\xE1 cadastrada." }'}]},{metodo:"GET",caminho:"/servidores/{id}",resumo:"Consulta um servidor pelo identificador",parametros:[{nome:"id",local:"caminho",tipo:"string (uuid)",obrigatorio:!0,descricao:"Identificador do servidor."}],respostas:[{codigo:"200",descricao:"Servidor encontrado.",modelo:"Servidor"},{codigo:"404",descricao:"Servidor n\xE3o encontrado.",modelo:"Erro"}]},{metodo:"PUT",caminho:"/servidores/{id}",resumo:"Substitui os dados de um servidor",parametros:[{nome:"id",local:"caminho",tipo:"string (uuid)",obrigatorio:!0,descricao:"Identificador do servidor."}],corpo:{tipoConteudo:"application/json",modelo:"Servidor"},respostas:[{codigo:"200",descricao:"Servidor atualizado.",modelo:"Servidor"},{codigo:"404",descricao:"Servidor n\xE3o encontrado.",modelo:"Erro"}]},{metodo:"PATCH",caminho:"/servidores/{id}/lotacao",resumo:"Altera a lota\xE7\xE3o de um servidor",parametros:[{nome:"id",local:"caminho",tipo:"string (uuid)",obrigatorio:!0,descricao:"Identificador do servidor."}],corpo:{tipoConteudo:"application/json",modelo:"Lotacao"},respostas:[{codigo:"204",descricao:"Lota\xE7\xE3o alterada."},{codigo:"404",descricao:"Servidor n\xE3o encontrado.",modelo:"Erro"}]},{metodo:"DELETE",caminho:"/servidores/{id}",resumo:"Remove um servidor (use a inativa\xE7\xE3o)",obsoleta:!0,parametros:[{nome:"id",local:"caminho",tipo:"string (uuid)",obrigatorio:!0,descricao:"Identificador do servidor."}],respostas:[{codigo:"204",descricao:"Servidor removido."},{codigo:"403",descricao:"Opera\xE7\xE3o n\xE3o permitida.",modelo:"Erro"}]}],u=`openapi: 3.0.3
info:
  title: API de Servidores
  version: v3
servers:
  - url: https://api.go.gov.br/api/v3/servidores
paths:
  /servidores:
    get:
      summary: Lista os servidores com pagina\xE7\xE3o
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
        "404": { description: Servidor n\xE3o encontrado }
`;function i(o,e,a,s,r){let p=`/${r}`;return{padrao:!0,formato:"YAML",resumo:`${o} \u2014 ${a}`,conteudo:`openapi: 3.0.3
info:
  title: ${o}
  version: ${a}
paths:
  ${p}:
    get:
      summary: Lista ${r}
      responses:
        "200": { description: Lista de ${r} }
`,servidores:s.map(t=>({ambiente:t,url:`https://${t==="Produ\xE7\xE3o"?"api":t==="Homologa\xE7\xE3o"?"api-hml":"api-dev"}.go.gov.br${e}`})),grupos:[{nome:o,operacoes:[{metodo:"GET",caminho:p,resumo:`Lista ${r}`,parametros:[{nome:"pagina",local:"consulta",tipo:"integer",obrigatorio:!1,descricao:"N\xFAmero da p\xE1gina."}],respostas:[{codigo:"200",descricao:"Lista retornada com sucesso."},{codigo:"500",descricao:"Erro interno.",modelo:"Erro"}]}]}],modelos:[l]}}var v={padrao:!0,formato:"YAML",resumo:"Consulta e manuten\xE7\xE3o do cadastro de servidores do Estado.",descricao:"Esta API \xE9 a fonte \xFAnica do cadastro funcional. Use os identificadores (uuid) em vez da matr\xEDcula para relacionar dados entre sistemas.",conteudo:u,servidores:[{ambiente:"Homologa\xE7\xE3o",url:"https://api-hml.go.gov.br/api/v3/servidores"},{ambiente:"Produ\xE7\xE3o",url:"https://api.go.gov.br/api/v3/servidores"}],grupos:[{nome:"Cadastro",operacoes:c.slice(0,4)},{nome:"Lota\xE7\xE3o",operacoes:[c[4]]},{nome:"",operacoes:[c[5]]}],modelos:[I,b,l]},f=[{id:"api-servidores-v3",apiId:"api-servidores",nome:"API de Servidores",enderecoBase:"/api/v3/servidores",versao:"v3",ambientes:["Homologa\xE7\xE3o","Produ\xE7\xE3o"],produtoId:"prj-001",contrato:v},{id:"api-servidores-v4",apiId:"api-servidores",nome:"API de Servidores",enderecoBase:"/api/v4/servidores",versao:"v4",ambientes:["Desenvolvimento"],produtoId:"prj-001",contrato:n(d({},v),{resumo:"Nova vers\xE3o em desenvolvimento, com pagina\xE7\xE3o por cursor.",servidores:[{ambiente:"Desenvolvimento",url:"https://api-dev.go.gov.br/api/v4/servidores"}],conteudo:u.replace("version: v3","version: v4").replace("/api/v3/","/api/v4/")})},{id:"api-autenticacao-v2",apiId:"api-autenticacao",nome:"API de Autentica\xE7\xE3o",enderecoBase:"/api/v2/oauth",versao:"v2",ambientes:["Desenvolvimento","Homologa\xE7\xE3o","Produ\xE7\xE3o"],produtoId:"prj-003",contrato:i("API de Autentica\xE7\xE3o","/api/v2/oauth","v2",["Desenvolvimento","Homologa\xE7\xE3o","Produ\xE7\xE3o"],"token")},{id:"api-pagamentos-v1",apiId:"api-pagamentos",nome:"API de Pagamentos",enderecoBase:"/api/v1/pagamentos",versao:"v1",ambientes:["Homologa\xE7\xE3o"],produtoId:"prj-002",contrato:i("API de Pagamentos","/api/v1/pagamentos","v1",["Homologa\xE7\xE3o"],"pagamentos")},{id:"api-conciliacao-v1",apiId:"api-conciliacao",nome:"API de Concilia\xE7\xE3o",enderecoBase:"/api/v1/conciliacao",versao:"v1",ambientes:["Desenvolvimento","Homologa\xE7\xE3o"],produtoId:"prj-002",contrato:i("API de Concilia\xE7\xE3o","/api/v1/conciliacao","v1",["Desenvolvimento","Homologa\xE7\xE3o"],"lancamentos")},{id:"api-sistemas-v1",apiId:"api-sistemas",nome:"API do Cat\xE1logo de Sistemas",enderecoBase:"/api/v1/sistemas",versao:"v1",ambientes:["Produ\xE7\xE3o"],produtoId:"prj-003",contrato:i("API do Cat\xE1logo de Sistemas","/api/v1/sistemas","v1",["Produ\xE7\xE3o"],"sistemas")},{id:"api-legado-v1",apiId:"api-legado",nome:"API Legada de Folha",enderecoBase:"/legado/folha",versao:"v1",ambientes:["Produ\xE7\xE3o"],produtoId:"prj-008",contrato:{padrao:!1,formato:"JSON",conteudo:`{
  "swagger": "1.2",
  "apis": [{ "path": "/folha", "description": "Contracheques" }]
}`,servidores:[{ambiente:"Produ\xE7\xE3o",url:"https://legado.go.gov.br/legado/folha"}],grupos:[],modelos:[]}}];export{h as a,f as b};
