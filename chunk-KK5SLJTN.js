import{a as p}from"./chunk-N3MG33RG.js";import{a as r,b as l}from"./chunk-4CMEKOL3.js";var c="14/08/2026",u=[{projetoId:"prj-001",urlRaiz:"https://codigo.dev.tools.go.gov.br/smart/portal-servidor",grupo:"eaidev",subgrupo:"portal",wikiRepositorioId:"repo-001",onboardingCenario:"wiki",onboardingEstado:"workspace-ready",documentacaoStatus:"SYNCED",repositorios:[{id:"repo-001",nome:"portal-servidor-wiki",url:"https://codigo.dev.tools.go.gov.br/smart/portal-servidor/wiki",tipo:"Wiki",validado:!0,descobertoEm:c,origem:"vinculado",branch:"Develop"},{id:"repo-002",nome:"portal-servidor-api",url:"https://codigo.dev.tools.go.gov.br/smart/portal-servidor/api",tipo:"API",validado:!0,descobertoEm:c,origem:"vinculado",branch:"Develop"},{id:"repo-003",nome:"portal-servidor-web",url:"https://codigo.dev.tools.go.gov.br/smart/portal-servidor/web",tipo:"Front-end",validado:!0,descobertoEm:c,origem:"vinculado",branch:"Develop"}],banco:{banco:"portal_servidor",usuario:"svc_portal"},ingestao:{documentos:42,trechos:1380,atualizadoEm:c,situacao:"Conclu\xEDda"}},{projetoId:"prj-002",urlRaiz:"https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos",grupo:"eaidev",subgrupo:"financas",wikiRepositorioId:"repo-004",onboardingCenario:"wiki",onboardingEstado:"workspace-ready",documentacaoStatus:"IN REVIEW",repositorios:[{id:"repo-004",nome:"pagamentos-wiki",url:"https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos/wiki",tipo:"Wiki",validado:!0,descobertoEm:c,origem:"vinculado",branch:"Develop"},{id:"repo-005",nome:"pagamentos-core",url:"https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos/core",tipo:"API",validado:!0,descobertoEm:c,origem:"vinculado",branch:"Develop"}],banco:{banco:"pagamentos",usuario:"svc_pagamentos"},ingestao:{documentos:18,trechos:610,atualizadoEm:"12/08/2026",situacao:"Em andamento"}}],v=o=>({projetoId:o,urlRaiz:"",repositorios:[],ingestao:{documentos:0,trechos:0,atualizadoEm:c,situacao:"Pendente"}}),g={"prj-001":[{id:"doc-visao-produto",titulo:"Vis\xE3o do produto",classe:"Dom\xEDnio",origem:"portal-servidor-wiki",versao:"4",ambiente:"oficial",conteudo:"Re\xFAne o que o produto se prop\xF5e a resolver, para quem, e o vocabul\xE1rio usado pelo time.",filhos:[{id:"doc-visao-geral",titulo:"Vis\xE3o geral e objetivos",classe:"Vis\xE3o",origem:"portal-servidor-wiki/visao-geral.md",versao:"4",ambiente:"oficial",conteudo:`## Por que o produto existe

O servidor estadual precisava ir presencialmente ao \xF3rg\xE3o para pedir contracheque, certid\xE3o de tempo de servi\xE7o e atualiza\xE7\xE3o cadastral. O Portal concentra esses servi\xE7os em autoatendimento.

### Objetivos
1. Reduzir atendimento presencial nos servi\xE7os de rotina.
2. Dar ao servidor acesso ao pr\xF3prio hist\xF3rico funcional.
3. Registrar em trilha de auditoria toda emiss\xE3o de documento.

### Fora de escopo
- Folha de pagamento, que permanece no sistema de origem.
- Processo administrativo disciplinar.`},{id:"doc-personas",titulo:"Personas e jornadas",classe:"Pesquisa",origem:"portal-servidor-wiki/personas.md",versao:"2",ambiente:"oficial",conteudo:`## Servidor ativo
Acessa pelo celular, quase sempre para contracheque. Espera resolver em menos de um minuto.

## Servidor aposentado
Usa com menos frequ\xEAncia e costuma precisar de certid\xE3o para comprova\xE7\xE3o junto a bancos. Tem mais dificuldade com autentica\xE7\xE3o.

## Servidor de RH do \xF3rg\xE3o
N\xE3o \xE9 o p\xFAblico principal, mas consulta o portal para conferir dados antes de responder ao servidor.`},{id:"doc-glossario",titulo:"Gloss\xE1rio do dom\xEDnio",classe:"Gloss\xE1rio",origem:"portal-servidor-wiki/glossario.md",versao:"3",ambiente:"oficial",conteudo:`**V\xEDnculo**: rela\xE7\xE3o funcional entre servidor e \xF3rg\xE3o. Um servidor pode ter mais de um.

**Matr\xEDcula**: identificador do v\xEDnculo, n\xE3o da pessoa.

**Protocolo**: identificador \xFAnico de uma solicita\xE7\xE3o administrativa.

**Contracheque**: demonstrativo mensal de pagamento referente a um v\xEDnculo.

**Certid\xE3o de tempo de servi\xE7o**: documento que comprova per\xEDodo trabalhado, usado em aposentadoria e averba\xE7\xE3o.`}]},{id:"doc-dominio-servidor",titulo:"Dom\xEDnio \u2014 Servidor",classe:"Dom\xEDnio",origem:"portal-servidor-wiki",versao:"3",ambiente:"oficial",conteudo:"Cadastro, v\xEDnculos e hist\xF3rico funcional do servidor p\xFAblico estadual.",filhos:[{id:"doc-cadastro-funcional",titulo:"Cadastro funcional",classe:"Requisito",origem:"portal-servidor-wiki/cadastro.md",versao:"3",ambiente:"oficial",conteudo:`## Dados do servidor

O cadastro \xE9 espelho do sistema de origem e n\xE3o \xE9 edit\xE1vel pelo portal, com exce\xE7\xE3o dos dados de contato.

### Edit\xE1vel pelo servidor
- Telefone celular
- E-mail pessoal
- Endere\xE7o de correspond\xEAncia

### Somente leitura
- Nome civil e social
- CPF, PIS/PASEP
- Data de admiss\xE3o e cargo

### Regras
1. Altera\xE7\xE3o de contato exige confirma\xE7\xE3o por c\xF3digo enviado ao canal novo.
2. Mudan\xE7a de endere\xE7o gera registro com data e origem da altera\xE7\xE3o.`},{id:"doc-vinculos",titulo:"V\xEDnculos e lota\xE7\xE3o",classe:"Requisito",origem:"portal-servidor-wiki/vinculos.md",versao:"2",ambiente:"oficial",conteudo:`## M\xFAltiplos v\xEDnculos

Servidores com ac\xFAmulo l\xEDcito de cargos t\xEAm mais de um v\xEDnculo ativo. O portal exige a escolha do v\xEDnculo antes de qualquer consulta que dependa dele.

### Regras
1. V\xEDnculo encerrado permanece consult\xE1vel por cinco anos.
2. Contracheque e certid\xE3o s\xE3o sempre por v\xEDnculo, nunca consolidados.
3. A lota\xE7\xE3o exibida \xE9 a vigente na data da consulta.`},{id:"doc-historico-funcional",titulo:"Hist\xF3rico funcional",classe:"Requisito",origem:"portal-servidor-wiki/historico.md",versao:"1",ambiente:"oficial",conteudo:`Linha do tempo com admiss\xE3o, promo\xE7\xF5es, licen\xE7as, cess\xF5es e desligamento.

Os eventos v\xEAm do sistema de origem e o portal n\xE3o os altera. Per\xEDodos de licen\xE7a sem vencimento aparecem destacados, porque afetam a contagem de tempo para aposentadoria.`}]},{id:"doc-dominio-autoatendimento",titulo:"Dom\xEDnio \u2014 Autoatendimento",classe:"Dom\xEDnio",origem:"portal-servidor-wiki",versao:"3",ambiente:"oficial",conteudo:"Os servi\xE7os que o servidor resolve sozinho, sem abrir chamado.",filhos:[{id:"doc-requisitos-autoatendimento",titulo:"Requisitos do autoatendimento",classe:"Requisito",origem:"portal-servidor-wiki/requisitos.md",versao:"3",ambiente:"oficial",conteudo:`## Autoatendimento

O servidor autenticado consulta contracheque, solicita certid\xF5es e acompanha protocolos.

- Consulta de contracheque dos \xFAltimos 60 meses
- Emiss\xE3o de certid\xE3o de tempo de servi\xE7o
- Acompanhamento de protocolos abertos

### Regras
1. Somente v\xEDnculos ativos podem emitir certid\xE3o.
2. Toda emiss\xE3o \xE9 registrada em trilha de auditoria.`},{id:"doc-contracheque",titulo:"Contracheque",classe:"Requisito",origem:"portal-servidor-wiki/contracheque.md",versao:"2",ambiente:"oficial",conteudo:`## Consulta

Dispon\xEDvel a partir do quinto dia \xFAtil do m\xEAs seguinte \xE0 compet\xEAncia.

### Regras
1. Janela de 60 meses, por v\xEDnculo.
2. O PDF gerado leva assinatura digital do \xF3rg\xE3o e c\xF3digo de verifica\xE7\xE3o.
3. Compet\xEAncias anteriores \xE0 migra\xE7\xE3o aparecem com aviso de origem legada.`},{id:"doc-certidoes",titulo:"Certid\xF5es e comprovantes",classe:"Requisito",origem:"portal-servidor-wiki/certidoes.md",versao:"2",ambiente:"oficial",conteudo:`## Tipos dispon\xEDveis
- Certid\xE3o de tempo de servi\xE7o
- Declara\xE7\xE3o de v\xEDnculo
- Comprovante de rendimentos anual

### Regras
1. Certid\xE3o de tempo de servi\xE7o exige v\xEDnculo ativo ou encerrado h\xE1 menos de cinco anos.
2. O documento vale por 90 dias e traz c\xF3digo de verifica\xE7\xE3o p\xFAblica.
3. Pedido com pend\xEAncia cadastral \xE9 recusado com o motivo expl\xEDcito.`,filhos:[{id:"doc-certidao-tempo",titulo:"Certid\xE3o de tempo de servi\xE7o",classe:"Requisito",origem:"portal-servidor-wiki/certidoes/tempo-servico.md",versao:"2",ambiente:"oficial",conteudo:`## C\xE1lculo do tempo

Soma os per\xEDodos de v\xEDnculo, descontando licen\xE7a sem vencimento e faltas n\xE3o abonadas.

### Regras
1. Per\xEDodos anteriores \xE0 migra\xE7\xE3o dependem de averba\xE7\xE3o manual.
2. Tempo concomitante em dois v\xEDnculos conta uma vez s\xF3.
3. A certid\xE3o informa a data-base do c\xE1lculo.`},{id:"doc-declaracao-vinculo",titulo:"Declara\xE7\xE3o de v\xEDnculo",classe:"Requisito",origem:"portal-servidor-wiki/certidoes/vinculo.md",versao:"1",ambiente:"oficial",conteudo:"Documento simples, com nome, matr\xEDcula, cargo, lota\xE7\xE3o e situa\xE7\xE3o do v\xEDnculo na data da emiss\xE3o. N\xE3o informa remunera\xE7\xE3o."},{id:"doc-comprovante-rendimentos",titulo:"Comprovante de rendimentos",classe:"Requisito",origem:"portal-servidor-wiki/certidoes/rendimentos.md",versao:"2",ambiente:"oficial",conteudo:`Emitido por ano-calend\xE1rio, para declara\xE7\xE3o de imposto de renda.

Fica dispon\xEDvel a partir de fevereiro e considera todos os v\xEDnculos do servidor no mesmo documento, separados por fonte pagadora.`}]},{id:"doc-protocolos",titulo:"Protocolos e acompanhamento",classe:"Requisito",origem:"portal-servidor-wiki/protocolos.md",versao:"1",ambiente:"oficial",conteudo:`Toda solicita\xE7\xE3o que n\xE3o se resolve na hora vira protocolo, com n\xFAmero, situa\xE7\xE3o e prazo estimado.

Situa\xE7\xF5es poss\xEDveis: recebido, em an\xE1lise, pendente de documento, conclu\xEDdo e indeferido. Indeferimento sempre acompanha justificativa.`}]},{id:"doc-integracoes",titulo:"Integra\xE7\xF5es",classe:"Dom\xEDnio",origem:"portal-servidor-api",versao:"3",ambiente:"oficial",conteudo:"Contratos e acordos com os sistemas dos quais o portal depende.",filhos:[{id:"doc-integracao-gov",titulo:"Integra\xE7\xE3o gov.br",classe:"Contrato",origem:"portal-servidor-api/docs/govbr.md",versao:"2",ambiente:"oficial",conteudo:"Autentica\xE7\xE3o federada via OIDC. Escopos: `openid`, `email`, `govbr_confiabilidades`.\n\nO n\xEDvel de confiabilidade m\xEDnimo para emiss\xE3o de certid\xE3o \xE9 **prata**. Abaixo disso o portal permite consulta, mas bloqueia a emiss\xE3o e explica como elevar o n\xEDvel.",filhos:[{id:"doc-govbr-escopos",titulo:"Escopos e confiabilidade",classe:"Contrato",origem:"portal-servidor-api/docs/govbr/escopos.md",versao:"1",ambiente:"oficial",conteudo:`Bronze libera a consulta ao pr\xF3prio cadastro. Prata libera contracheque e certid\xF5es. Ouro \xE9 exigido em documentos com efeito externo.

A eleva\xE7\xE3o de n\xEDvel acontece no gov.br, fora do portal \u2014 o que o produto pode fazer \xE9 explicar o caminho.`},{id:"doc-govbr-erros",titulo:"Tratamento de erros",classe:"Contrato",origem:"portal-servidor-api/docs/govbr/erros.md",versao:"1",ambiente:"oficial",conteudo:`Falha na federa\xE7\xE3o n\xE3o pode virar tela branca.

O portal distingue tr\xEAs casos, cada um com mensagem pr\xF3pria e caminho de sa\xEDda: indisponibilidade do provedor, sess\xE3o expirada e n\xEDvel de confiabilidade insuficiente.`}]},{id:"doc-integracao-folha",titulo:"Integra\xE7\xE3o com a folha",classe:"Contrato",origem:"portal-servidor-api/docs/folha.md",versao:"2",ambiente:"oficial",conteudo:`## Origem dos dados

Cadastro, v\xEDnculos e compet\xEAncias de pagamento v\xEAm da folha por replica\xE7\xE3o noturna.

### Acordos
1. O portal \xE9 somente leitura sobre esses dados.
2. Diverg\xEAncia entre portal e folha se resolve sempre a favor da folha.
3. Janela de indisponibilidade prevista: 23h \xE0s 1h.`},{id:"doc-notificacoes",titulo:"Notifica\xE7\xF5es ao servidor",classe:"Contrato",origem:"portal-servidor-api/docs/notificacoes.md",versao:"1",ambiente:"oficial",conteudo:`Envio por e-mail e push. O canal de SMS foi descontinuado por custo.

Eventos que notificam: contracheque dispon\xEDvel, protocolo respondido, certid\xE3o pronta e altera\xE7\xE3o de dados de contato.`}]},{id:"doc-arquitetura",titulo:"Arquitetura e opera\xE7\xE3o",classe:"Dom\xEDnio",origem:"portal-servidor-api",versao:"2",ambiente:"oficial",conteudo:"Como o produto \xE9 constru\xEDdo, publicado e acompanhado.",filhos:[{id:"doc-modelo-dados",titulo:"Modelo de dados",classe:"Arquitetura",origem:"portal-servidor-api/docs/modelo-dados.md",versao:"2",ambiente:"oficial",conteudo:`## Entidades principais

- **Servidor** \u2014 pessoa, identificada por CPF
- **V\xEDnculo** \u2014 rela\xE7\xE3o com um \xF3rg\xE3o, identificada por matr\xEDcula
- **Compet\xEAncia** \u2014 m\xEAs de refer\xEAncia de pagamento
- **Solicita\xE7\xE3o** \u2014 pedido que vira protocolo

Um servidor tem N v\xEDnculos; um v\xEDnculo tem N compet\xEAncias. Solicita\xE7\xE3o sempre aponta para um v\xEDnculo.`},{id:"doc-contratos-api",titulo:"Contratos de API",classe:"Arquitetura",origem:"portal-servidor-api/docs/api.md",versao:"3",ambiente:"oficial",conteudo:"REST sobre o gateway WSO2, com versionamento no caminho.\n\n- `GET /v1/servidores/{cpf}/vinculos`\n- `GET /v1/vinculos/{matricula}/competencias`\n- `POST /v1/solicitacoes`\n\nErro segue o padr\xE3o de problema HTTP, com `type`, `title` e `detail` em portugu\xEAs."},{id:"doc-ambientes",titulo:"Ambientes e implanta\xE7\xE3o",classe:"Opera\xE7\xE3o",origem:"portal-servidor-infra/docs/ambientes.md",versao:"2",ambiente:"oficial",conteudo:`Tr\xEAs ambientes: desenvolvimento, homologa\xE7\xE3o e produ\xE7\xE3o.

A implanta\xE7\xE3o em produ\xE7\xE3o exige aprova\xE7\xE3o de duas pessoas e janela fora do hor\xE1rio de pico. O retorno \xE0 vers\xE3o anterior \xE9 feito por nova implanta\xE7\xE3o, nunca por altera\xE7\xE3o direta.`},{id:"doc-observabilidade",titulo:"Observabilidade e alertas",classe:"Opera\xE7\xE3o",origem:"portal-servidor-infra/docs/observabilidade.md",versao:"1",ambiente:"oficial",conteudo:`M\xE9tricas no padr\xE3o OpenTelemetry, com rastreamento ponta a ponta pelo identificador de correla\xE7\xE3o.

Alerta dispara quando a emiss\xE3o de certid\xE3o passa de 8 segundos no P95 ou quando a replica\xE7\xE3o da folha atrasa mais de duas horas.`}]},{id:"doc-conformidade",titulo:"Conformidade",classe:"Dom\xEDnio",origem:"portal-servidor-wiki",versao:"2",ambiente:"oficial",conteudo:"Obriga\xE7\xF5es legais e de acessibilidade que o produto precisa cumprir.",filhos:[{id:"doc-lgpd",titulo:"LGPD e dados pessoais",classe:"Conformidade",origem:"portal-servidor-wiki/lgpd.md",versao:"2",ambiente:"oficial",conteudo:`## Dados tratados

Dados funcionais e de contato. O portal n\xE3o trata dado sens\xEDvel.

### Regras
1. Acesso ao pr\xF3prio dado \xE9 livre ao titular, autenticado.
2. Consulta por terceiro exige procura\xE7\xE3o registrada em protocolo.
3. Reten\xE7\xE3o de log de acesso: cinco anos.`},{id:"doc-auditoria",titulo:"Trilha de auditoria",classe:"Conformidade",origem:"portal-servidor-wiki/auditoria.md",versao:"1",ambiente:"oficial",conteudo:`Toda emiss\xE3o de documento e toda altera\xE7\xE3o de contato geram registro com autor, data, origem e resultado.

O registro \xE9 imut\xE1vel e n\xE3o pode ser apagado pelo pr\xF3prio produto.`},{id:"doc-acessibilidade",titulo:"Acessibilidade",classe:"Conformidade",origem:"portal-servidor-wiki/acessibilidade.md",versao:"1",ambiente:"oficial",conteudo:`Compromisso com o eMAG e com a WCAG 2.1 n\xEDvel AA.

Pontos verificados a cada entrega: contraste m\xEDnimo, navega\xE7\xE3o por teclado, r\xF3tulo em todo campo e alternativa textual para conte\xFAdo n\xE3o textual.`}]},{id:"doc-rascunhos",titulo:"Rascunhos do agente",classe:"Dom\xEDnio",origem:"Gerado pelo agente",versao:"1",ambiente:"sandbox",conteudo:"Conte\xFAdo proposto automaticamente, aguardando revis\xE3o humana.",filhos:[{id:"doc-sandbox-barramento",titulo:"Barramento de pagamentos (rascunho)",classe:"Requisito",origem:"Gerado pelo agente a partir da especifica\xE7\xE3o",versao:"1",ambiente:"sandbox",conteudo:"Rascunho gerado pelo agente com base na especifica\xE7\xE3o em elabora\xE7\xE3o. Precisa de revis\xE3o humana antes de virar documenta\xE7\xE3o oficial."},{id:"doc-sandbox-portabilidade",titulo:"Portabilidade de consignado (rascunho)",classe:"Requisito",origem:"Gerado pelo agente a partir do reposit\xF3rio",versao:"1",ambiente:"sandbox",conteudo:"Extra\xEDdo do c\xF3digo do servi\xE7o de consigna\xE7\xF5es. Cont\xE9m regras que ainda n\xE3o foram confirmadas com a \xE1rea de neg\xF3cio \u2014 em especial o limite de margem consign\xE1vel."}]}],"prj-002":[{id:"doc-exp-dominio",titulo:"Dom\xEDnio \u2014 Pagamentos",classe:"Dom\xEDnio",origem:"expresso-pagamentos-wiki",versao:"2",ambiente:"oficial",conteudo:"Concilia\xE7\xE3o e repasse entre \xF3rg\xE3os e institui\xE7\xF5es financeiras.",filhos:[{id:"doc-exp-conciliacao",titulo:"Concilia\xE7\xE3o autom\xE1tica",classe:"Requisito",origem:"expresso-pagamentos-wiki/conciliacao.md",versao:"2",ambiente:"oficial",conteudo:`## Casamento de lan\xE7amentos

O arquivo de retorno do banco \xE9 conciliado com os lan\xE7amentos previstos.

### Regras
1. Diverg\xEAncia de centavos at\xE9 R$ 0,05 concilia automaticamente e registra o ajuste.
2. Diverg\xEAncia maior abre pend\xEAncia para o \xF3rg\xE3o.
3. Lan\xE7amento sem correspond\xEAncia ap\xF3s 5 dias \xFAteis vira ocorr\xEAncia.`},{id:"doc-exp-arquivo",titulo:"Layout do arquivo de retorno",classe:"Contrato",origem:"expresso-pagamentos-api/docs/layout.md",versao:"3",ambiente:"oficial",conteudo:"Formato posicional, padr\xE3o CNAB 240, com dois campos de uso da empresa reservados ao identificador do \xF3rg\xE3o e ao do empenho."}]}],"prj-005":[{id:"doc-ass-dominio",titulo:"Dom\xEDnio \u2014 Assinatura",classe:"Dom\xEDnio",origem:"assinatura-gov-wiki",versao:"1",ambiente:"oficial",conteudo:"Assinatura eletr\xF4nica de documentos oficiais com identidade gov.br.",filhos:[{id:"doc-ass-niveis",titulo:"N\xEDveis de confiabilidade",classe:"Requisito",origem:"assinatura-gov-wiki/niveis.md",versao:"1",ambiente:"oficial",conteudo:`Bronze n\xE3o assina. Prata assina documentos internos. Ouro assina documentos com efeito externo.

O produto precisa dizer, antes de o usu\xE1rio tentar, qual n\xEDvel o documento exige.`},{id:"doc-ass-verificacao",titulo:"Verifica\xE7\xE3o p\xFAblica",classe:"Requisito",origem:"assinatura-gov-wiki/verificacao.md",versao:"1",ambiente:"oficial",conteudo:"Todo documento assinado recebe c\xF3digo de verifica\xE7\xE3o e endere\xE7o p\xFAblico de confer\xEAncia, sem exigir autentica\xE7\xE3o de quem confere."}]}],"prj-007":[{id:"doc-app-dominio",titulo:"Dom\xEDnio \u2014 Cidad\xE3o",classe:"Dom\xEDnio",origem:"app-cidadao-wiki",versao:"2",ambiente:"oficial",conteudo:"Servi\xE7os ao cidad\xE3o no aplicativo m\xF3vel do estado.",filhos:[{id:"doc-app-carteira",titulo:"Carteira de documentos",classe:"Requisito",origem:"app-cidadao-wiki/carteira.md",versao:"2",ambiente:"oficial",conteudo:`Documentos dispon\xEDveis em modo offline, com validade vis\xEDvel e atualiza\xE7\xE3o autom\xE1tica quando h\xE1 rede.

O aplicativo n\xE3o guarda o documento em texto claro no dispositivo.`},{id:"doc-app-notificacoes",titulo:"Notifica\xE7\xF5es e permiss\xF5es",classe:"Requisito",origem:"app-cidadao-wiki/notificacoes.md",versao:"1",ambiente:"oficial",conteudo:"A permiss\xE3o de notifica\xE7\xE3o \xE9 pedida no momento em que ela passa a ser \xFAtil, n\xE3o na abertura do aplicativo."}]}]},f=[{id:"doc-vazio",titulo:"Sem documenta\xE7\xE3o ingerida",classe:"Aviso",origem:"\u2014",versao:"\u2014",ambiente:"oficial",conteudo:"Este produto ainda n\xE3o teve a documenta\xE7\xE3o dos reposit\xF3rios ingerida. Vincule um reposit\xF3rio do tipo Wiki e execute a ingest\xE3o para popular a base de conhecimento."}];var h="eai-dev-projetos",P="eai-dev-projetos-detalhe",R="eai-dev-projetos-alterados";function b(){return new Date().toLocaleDateString("pt-BR")}function t(o,e=220){return new Promise(a=>setTimeout(()=>a(o),e))}function m(){if(typeof window>"u")return{projetos:[],detalhes:[]};try{let o=JSON.parse(window.localStorage.getItem(h)??"[]"),e=JSON.parse(window.localStorage.getItem(P)??"[]");return{projetos:Array.isArray(o)?o.map(a=>l(r({},a),{ativo:a.ativo??"Ativo"})):[],detalhes:Array.isArray(e)?e:[]}}catch{return{projetos:[],detalhes:[]}}}function w(o){typeof window>"u"||(window.localStorage.setItem(h,JSON.stringify(o.projetos)),window.localStorage.setItem(P,JSON.stringify(o.detalhes)))}function S(){if(typeof window>"u")return{};try{let o=window.localStorage.getItem(R),e=o?JSON.parse(o):{};return e&&typeof e=="object"?e:{}}catch{return{}}}function j(){let o=m(),e=S();return[...o.projetos,...p].map(a=>r(r({},a),e[a.id]))}function C(){return t(j())}function q(o){return t(j().find(e=>e.id===o))}function k(o,e){if(typeof window<"u"){let a=S();window.localStorage.setItem(R,JSON.stringify(l(r({},a),{[o]:r(r({},a[o]),e)})))}return t(void 0,60)}function O(o,e){let a=m(),i=a.detalhes.find(n=>n.projetoId===o)??u.find(n=>n.projetoId===o)??v(o),s=l(r({},i),{repositorios:e});return w(l(r({},a),{detalhes:[...a.detalhes.filter(n=>n.projetoId!==o),s]})),t(void 0,60)}function I(o){let a=m().detalhes.find(i=>i.projetoId===o)??u.find(i=>i.projetoId===o);return t(a??v(o))}function T(o){return t(g[o]??f)}function N(o){let e=m(),a=String(e.projetos.length+p.length+1).padStart(3,"0"),i={id:`prj-${Math.random().toString(36).slice(2,8)}`,nome:o.nome,codigo:`EAI-2026-${a}`,orgao:o.orgao||"N\xE3o informado",status:"Planejado",ativo:"Ativo",responsavel:o.responsavel,progresso:0,inicio:b(),prazo:"A definir",criticidade:"M\xE9dia",descricao:o.descricao},s=o.repositorios.find(d=>d.tipo==="Wiki"),n={projetoId:i.id,urlRaiz:o.urlRaiz,repositorios:o.repositorios,wikiRepositorioId:s?.id,onboardingCenario:o.cenario,onboardingEstado:o.cenario==="wiki"&&s?"workspace-ready":o.cenario==="greenfield"?"discovery":"no-wiki",documentacaoStatus:s?"SYNCED":"DRAFT",banco:o.banco,ingestao:{documentos:o.repositorios.filter(d=>d.tipo==="Wiki").length*6,trechos:o.repositorios.filter(d=>d.tipo==="Wiki").length*180,atualizadoEm:b(),situacao:o.repositorios.some(d=>d.tipo==="Wiki")?"Em andamento":"Pendente"}};return w({projetos:[i,...e.projetos],detalhes:[n,...e.detalhes]}),t(i)}function V(o,e="wiki"){if(e==="greenfield")return t([]);let a=o.replace(/\/$/,""),i=a.split("/").filter(Boolean).pop()??"produto",s=[...e==="wiki"?[{id:`r-${i}-wiki`,nome:`${i}-wiki`,url:`${a}/wiki`,tipo:"Wiki",validado:!0,descobertoEm:new Date().toISOString(),origem:"vinculado",branch:"Develop"}]:[],{id:`r-${i}-api`,nome:`${i}-api`,url:`${a}/api`,tipo:"API",validado:!0,descobertoEm:new Date().toISOString(),origem:"vinculado",branch:"Develop"},{id:`r-${i}-web`,nome:`${i}-web`,url:`${a}/web`,tipo:"Front-end",validado:!0,descobertoEm:new Date().toISOString(),origem:"vinculado",branch:"Develop"},{id:`r-${i}-infra`,nome:`${i}-infra`,url:`${a}/infra`,tipo:"Outro",validado:!1,descobertoEm:new Date().toISOString(),origem:"vinculado",branch:"Develop"}];return t(s,600)}export{g as a,C as b,q as c,k as d,O as e,I as f,T as g,N as h,V as i};
