import type { DocumentoProjeto, Funcionalidade, ProjetoDetalhe } from "@/types/workspace";

const hoje = "14/08/2026";

export const projetoDetalhes: ProjetoDetalhe[] = [
  {
    projetoId: "prj-001",
    urlRaiz: "https://codigo.dev.tools.go.gov.br/smart/portal-servidor",
    grupo: "eaidev",
    subgrupo: "portal",
    wikiRepositorioId: "repo-001",
    onboardingCenario: "wiki",
    onboardingEstado: "workspace-ready",
    documentacaoStatus: "SYNCED",
    repositorios: [
      {
        id: "repo-001",
        nome: "portal-servidor-wiki",
        url: "https://codigo.dev.tools.go.gov.br/smart/portal-servidor/wiki",
        tipo: "Wiki",
        validado: true,
        // Veio da descoberta no GitLab, e por isso não se edita aqui.
        descobertoEm: hoje,
        origem: "vinculado",
        branch: "Develop",
      },
      {
        id: "repo-002",
        nome: "portal-servidor-api",
        url: "https://codigo.dev.tools.go.gov.br/smart/portal-servidor/api",
        tipo: "API",
        validado: true,
        // Veio da descoberta no GitLab, e por isso não se edita aqui.
        descobertoEm: hoje,
        origem: "vinculado",
        branch: "Develop",
      },
      {
        id: "repo-003",
        nome: "portal-servidor-web",
        url: "https://codigo.dev.tools.go.gov.br/smart/portal-servidor/web",
        tipo: "Front-end",
        validado: true,
        // Veio da descoberta no GitLab, e por isso não se edita aqui.
        descobertoEm: hoje,
        origem: "vinculado",
        branch: "Develop",
      },
    ],
    banco: { banco: "portal_servidor", usuario: "svc_portal" },
    ingestao: { documentos: 42, trechos: 1380, atualizadoEm: hoje, situacao: "Concluída" },
  },
  {
    projetoId: "prj-002",
    urlRaiz: "https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos",
    grupo: "eaidev",
    subgrupo: "financas",
    wikiRepositorioId: "repo-004",
    onboardingCenario: "wiki",
    onboardingEstado: "workspace-ready",
    documentacaoStatus: "IN REVIEW",
    repositorios: [
      {
        id: "repo-004",
        nome: "pagamentos-wiki",
        url: "https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos/wiki",
        tipo: "Wiki",
        validado: true,
        // Veio da descoberta no GitLab, e por isso não se edita aqui.
        descobertoEm: hoje,
        origem: "vinculado",
        branch: "Develop",
      },
      {
        id: "repo-005",
        nome: "pagamentos-core",
        url: "https://codigo.dev.tools.go.gov.br/smart/expresso-pagamentos/core",
        tipo: "API",
        validado: true,
        // Veio da descoberta no GitLab, e por isso não se edita aqui.
        descobertoEm: hoje,
        origem: "vinculado",
        branch: "Develop",
      },
    ],
    banco: { banco: "pagamentos", usuario: "svc_pagamentos" },
    ingestao: {
      documentos: 18,
      trechos: 610,
      atualizadoEm: "12/08/2026",
      situacao: "Em andamento",
    },
  },
];

export const detalhePadrao = (projetoId: string): ProjetoDetalhe => ({
  projetoId,
  urlRaiz: "",
  repositorios: [],
  ingestao: { documentos: 0, trechos: 0, atualizadoEm: hoje, situacao: "Pendente" },
});

export const documentosPorProjeto: Record<string, DocumentoProjeto[]> = {
  "prj-001": [
    {
      id: "doc-visao-produto",
      titulo: "Visão do produto",
      classe: "Domínio",
      origem: "portal-servidor-wiki",
      versao: "4",
      ambiente: "oficial",
      conteudo:
        "Reúne o que o produto se propõe a resolver, para quem, e o vocabulário usado pelo time.",
      filhos: [
        {
          id: "doc-visao-geral",
          titulo: "Visão geral e objetivos",
          classe: "Visão",
          origem: "portal-servidor-wiki/visao-geral.md",
          versao: "4",
          ambiente: "oficial",
          conteudo:
            "## Por que o produto existe\n\nO servidor estadual precisava ir presencialmente ao órgão para pedir contracheque, certidão de tempo de serviço e atualização cadastral. O Portal concentra esses serviços em autoatendimento.\n\n### Objetivos\n1. Reduzir atendimento presencial nos serviços de rotina.\n2. Dar ao servidor acesso ao próprio histórico funcional.\n3. Registrar em trilha de auditoria toda emissão de documento.\n\n### Fora de escopo\n- Folha de pagamento, que permanece no sistema de origem.\n- Processo administrativo disciplinar.",
        },
        {
          id: "doc-personas",
          titulo: "Personas e jornadas",
          classe: "Pesquisa",
          origem: "portal-servidor-wiki/personas.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Servidor ativo\nAcessa pelo celular, quase sempre para contracheque. Espera resolver em menos de um minuto.\n\n## Servidor aposentado\nUsa com menos frequência e costuma precisar de certidão para comprovação junto a bancos. Tem mais dificuldade com autenticação.\n\n## Servidor de RH do órgão\nNão é o público principal, mas consulta o portal para conferir dados antes de responder ao servidor.",
        },
        {
          id: "doc-glossario",
          titulo: "Glossário do domínio",
          classe: "Glossário",
          origem: "portal-servidor-wiki/glossario.md",
          versao: "3",
          ambiente: "oficial",
          conteudo:
            "**Vínculo**: relação funcional entre servidor e órgão. Um servidor pode ter mais de um.\n\n**Matrícula**: identificador do vínculo, não da pessoa.\n\n**Protocolo**: identificador único de uma solicitação administrativa.\n\n**Contracheque**: demonstrativo mensal de pagamento referente a um vínculo.\n\n**Certidão de tempo de serviço**: documento que comprova período trabalhado, usado em aposentadoria e averbação.",
        },
      ],
    },
    {
      id: "doc-dominio-servidor",
      titulo: "Domínio — Servidor",
      classe: "Domínio",
      origem: "portal-servidor-wiki",
      versao: "3",
      ambiente: "oficial",
      conteudo: "Cadastro, vínculos e histórico funcional do servidor público estadual.",
      filhos: [
        {
          id: "doc-cadastro-funcional",
          titulo: "Cadastro funcional",
          classe: "Requisito",
          origem: "portal-servidor-wiki/cadastro.md",
          versao: "3",
          ambiente: "oficial",
          conteudo:
            "## Dados do servidor\n\nO cadastro é espelho do sistema de origem e não é editável pelo portal, com exceção dos dados de contato.\n\n### Editável pelo servidor\n- Telefone celular\n- E-mail pessoal\n- Endereço de correspondência\n\n### Somente leitura\n- Nome civil e social\n- CPF, PIS/PASEP\n- Data de admissão e cargo\n\n### Regras\n1. Alteração de contato exige confirmação por código enviado ao canal novo.\n2. Mudança de endereço gera registro com data e origem da alteração.",
        },
        {
          id: "doc-vinculos",
          titulo: "Vínculos e lotação",
          classe: "Requisito",
          origem: "portal-servidor-wiki/vinculos.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Múltiplos vínculos\n\nServidores com acúmulo lícito de cargos têm mais de um vínculo ativo. O portal exige a escolha do vínculo antes de qualquer consulta que dependa dele.\n\n### Regras\n1. Vínculo encerrado permanece consultável por cinco anos.\n2. Contracheque e certidão são sempre por vínculo, nunca consolidados.\n3. A lotação exibida é a vigente na data da consulta.",
        },
        {
          id: "doc-historico-funcional",
          titulo: "Histórico funcional",
          classe: "Requisito",
          origem: "portal-servidor-wiki/historico.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Linha do tempo com admissão, promoções, licenças, cessões e desligamento.\n\nOs eventos vêm do sistema de origem e o portal não os altera. Períodos de licença sem vencimento aparecem destacados, porque afetam a contagem de tempo para aposentadoria.",
        },
      ],
    },
    {
      id: "doc-dominio-autoatendimento",
      titulo: "Domínio — Autoatendimento",
      classe: "Domínio",
      origem: "portal-servidor-wiki",
      versao: "3",
      ambiente: "oficial",
      conteudo: "Os serviços que o servidor resolve sozinho, sem abrir chamado.",
      filhos: [
        {
          id: "doc-requisitos-autoatendimento",
          titulo: "Requisitos do autoatendimento",
          classe: "Requisito",
          origem: "portal-servidor-wiki/requisitos.md",
          versao: "3",
          ambiente: "oficial",
          conteudo:
            "## Autoatendimento\n\nO servidor autenticado consulta contracheque, solicita certidões e acompanha protocolos.\n\n- Consulta de contracheque dos últimos 60 meses\n- Emissão de certidão de tempo de serviço\n- Acompanhamento de protocolos abertos\n\n### Regras\n1. Somente vínculos ativos podem emitir certidão.\n2. Toda emissão é registrada em trilha de auditoria.",
        },
        {
          id: "doc-contracheque",
          titulo: "Contracheque",
          classe: "Requisito",
          origem: "portal-servidor-wiki/contracheque.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Consulta\n\nDisponível a partir do quinto dia útil do mês seguinte à competência.\n\n### Regras\n1. Janela de 60 meses, por vínculo.\n2. O PDF gerado leva assinatura digital do órgão e código de verificação.\n3. Competências anteriores à migração aparecem com aviso de origem legada.",
        },
        {
          id: "doc-certidoes",
          titulo: "Certidões e comprovantes",
          classe: "Requisito",
          origem: "portal-servidor-wiki/certidoes.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Tipos disponíveis\n- Certidão de tempo de serviço\n- Declaração de vínculo\n- Comprovante de rendimentos anual\n\n### Regras\n1. Certidão de tempo de serviço exige vínculo ativo ou encerrado há menos de cinco anos.\n2. O documento vale por 90 dias e traz código de verificação pública.\n3. Pedido com pendência cadastral é recusado com o motivo explícito.",
          filhos: [
            {
              id: "doc-certidao-tempo",
              titulo: "Certidão de tempo de serviço",
              classe: "Requisito",
              origem: "portal-servidor-wiki/certidoes/tempo-servico.md",
              versao: "2",
              ambiente: "oficial",
              conteudo:
                "## Cálculo do tempo\n\nSoma os períodos de vínculo, descontando licença sem vencimento e faltas não abonadas.\n\n### Regras\n1. Períodos anteriores à migração dependem de averbação manual.\n2. Tempo concomitante em dois vínculos conta uma vez só.\n3. A certidão informa a data-base do cálculo.",
            },
            {
              id: "doc-declaracao-vinculo",
              titulo: "Declaração de vínculo",
              classe: "Requisito",
              origem: "portal-servidor-wiki/certidoes/vinculo.md",
              versao: "1",
              ambiente: "oficial",
              conteudo:
                "Documento simples, com nome, matrícula, cargo, lotação e situação do vínculo na data da emissão. Não informa remuneração.",
            },
            {
              id: "doc-comprovante-rendimentos",
              titulo: "Comprovante de rendimentos",
              classe: "Requisito",
              origem: "portal-servidor-wiki/certidoes/rendimentos.md",
              versao: "2",
              ambiente: "oficial",
              conteudo:
                "Emitido por ano-calendário, para declaração de imposto de renda.\n\nFica disponível a partir de fevereiro e considera todos os vínculos do servidor no mesmo documento, separados por fonte pagadora.",
            },
          ],
        },
        {
          id: "doc-protocolos",
          titulo: "Protocolos e acompanhamento",
          classe: "Requisito",
          origem: "portal-servidor-wiki/protocolos.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Toda solicitação que não se resolve na hora vira protocolo, com número, situação e prazo estimado.\n\nSituações possíveis: recebido, em análise, pendente de documento, concluído e indeferido. Indeferimento sempre acompanha justificativa.",
        },
      ],
    },
    {
      id: "doc-integracoes",
      titulo: "Integrações",
      classe: "Domínio",
      origem: "portal-servidor-api",
      versao: "3",
      ambiente: "oficial",
      conteudo: "Contratos e acordos com os sistemas dos quais o portal depende.",
      filhos: [
        {
          id: "doc-integracao-gov",
          titulo: "Integração gov.br",
          classe: "Contrato",
          origem: "portal-servidor-api/docs/govbr.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "Autenticação federada via OIDC. Escopos: `openid`, `email`, `govbr_confiabilidades`.\n\nO nível de confiabilidade mínimo para emissão de certidão é **prata**. Abaixo disso o portal permite consulta, mas bloqueia a emissão e explica como elevar o nível.",
          filhos: [
            {
              id: "doc-govbr-escopos",
              titulo: "Escopos e confiabilidade",
              classe: "Contrato",
              origem: "portal-servidor-api/docs/govbr/escopos.md",
              versao: "1",
              ambiente: "oficial",
              conteudo:
                "Bronze libera a consulta ao próprio cadastro. Prata libera contracheque e certidões. Ouro é exigido em documentos com efeito externo.\n\nA elevação de nível acontece no gov.br, fora do portal — o que o produto pode fazer é explicar o caminho.",
            },
            {
              id: "doc-govbr-erros",
              titulo: "Tratamento de erros",
              classe: "Contrato",
              origem: "portal-servidor-api/docs/govbr/erros.md",
              versao: "1",
              ambiente: "oficial",
              conteudo:
                "Falha na federação não pode virar tela branca.\n\nO portal distingue três casos, cada um com mensagem própria e caminho de saída: indisponibilidade do provedor, sessão expirada e nível de confiabilidade insuficiente.",
            },
          ],
        },
        {
          id: "doc-integracao-folha",
          titulo: "Integração com a folha",
          classe: "Contrato",
          origem: "portal-servidor-api/docs/folha.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Origem dos dados\n\nCadastro, vínculos e competências de pagamento vêm da folha por replicação noturna.\n\n### Acordos\n1. O portal é somente leitura sobre esses dados.\n2. Divergência entre portal e folha se resolve sempre a favor da folha.\n3. Janela de indisponibilidade prevista: 23h às 1h.",
        },
        {
          id: "doc-notificacoes",
          titulo: "Notificações ao servidor",
          classe: "Contrato",
          origem: "portal-servidor-api/docs/notificacoes.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Envio por e-mail e push. O canal de SMS foi descontinuado por custo.\n\nEventos que notificam: contracheque disponível, protocolo respondido, certidão pronta e alteração de dados de contato.",
        },
      ],
    },
    {
      id: "doc-arquitetura",
      titulo: "Arquitetura e operação",
      classe: "Domínio",
      origem: "portal-servidor-api",
      versao: "2",
      ambiente: "oficial",
      conteudo: "Como o produto é construído, publicado e acompanhado.",
      filhos: [
        {
          id: "doc-modelo-dados",
          titulo: "Modelo de dados",
          classe: "Arquitetura",
          origem: "portal-servidor-api/docs/modelo-dados.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Entidades principais\n\n- **Servidor** — pessoa, identificada por CPF\n- **Vínculo** — relação com um órgão, identificada por matrícula\n- **Competência** — mês de referência de pagamento\n- **Solicitação** — pedido que vira protocolo\n\nUm servidor tem N vínculos; um vínculo tem N competências. Solicitação sempre aponta para um vínculo.",
        },
        {
          id: "doc-contratos-api",
          titulo: "Contratos de API",
          classe: "Arquitetura",
          origem: "portal-servidor-api/docs/api.md",
          versao: "3",
          ambiente: "oficial",
          conteudo:
            "REST sobre o gateway WSO2, com versionamento no caminho.\n\n- `GET /v1/servidores/{cpf}/vinculos`\n- `GET /v1/vinculos/{matricula}/competencias`\n- `POST /v1/solicitacoes`\n\nErro segue o padrão de problema HTTP, com `type`, `title` e `detail` em português.",
        },
        {
          id: "doc-ambientes",
          titulo: "Ambientes e implantação",
          classe: "Operação",
          origem: "portal-servidor-infra/docs/ambientes.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "Três ambientes: desenvolvimento, homologação e produção.\n\nA implantação em produção exige aprovação de duas pessoas e janela fora do horário de pico. O retorno à versão anterior é feito por nova implantação, nunca por alteração direta.",
        },
        {
          id: "doc-observabilidade",
          titulo: "Observabilidade e alertas",
          classe: "Operação",
          origem: "portal-servidor-infra/docs/observabilidade.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Métricas no padrão OpenTelemetry, com rastreamento ponta a ponta pelo identificador de correlação.\n\nAlerta dispara quando a emissão de certidão passa de 8 segundos no P95 ou quando a replicação da folha atrasa mais de duas horas.",
        },
      ],
    },
    {
      id: "doc-conformidade",
      titulo: "Conformidade",
      classe: "Domínio",
      origem: "portal-servidor-wiki",
      versao: "2",
      ambiente: "oficial",
      conteudo: "Obrigações legais e de acessibilidade que o produto precisa cumprir.",
      filhos: [
        {
          id: "doc-lgpd",
          titulo: "LGPD e dados pessoais",
          classe: "Conformidade",
          origem: "portal-servidor-wiki/lgpd.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Dados tratados\n\nDados funcionais e de contato. O portal não trata dado sensível.\n\n### Regras\n1. Acesso ao próprio dado é livre ao titular, autenticado.\n2. Consulta por terceiro exige procuração registrada em protocolo.\n3. Retenção de log de acesso: cinco anos.",
        },
        {
          id: "doc-auditoria",
          titulo: "Trilha de auditoria",
          classe: "Conformidade",
          origem: "portal-servidor-wiki/auditoria.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Toda emissão de documento e toda alteração de contato geram registro com autor, data, origem e resultado.\n\nO registro é imutável e não pode ser apagado pelo próprio produto.",
        },
        {
          id: "doc-acessibilidade",
          titulo: "Acessibilidade",
          classe: "Conformidade",
          origem: "portal-servidor-wiki/acessibilidade.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Compromisso com o eMAG e com a WCAG 2.1 nível AA.\n\nPontos verificados a cada entrega: contraste mínimo, navegação por teclado, rótulo em todo campo e alternativa textual para conteúdo não textual.",
        },
      ],
    },
    {
      id: "doc-rascunhos",
      titulo: "Rascunhos do agente",
      classe: "Domínio",
      origem: "Gerado pelo agente",
      versao: "1",
      ambiente: "sandbox",
      conteudo: "Conteúdo proposto automaticamente, aguardando revisão humana.",
      filhos: [
        {
          id: "doc-sandbox-barramento",
          titulo: "Barramento de pagamentos (rascunho)",
          classe: "Requisito",
          origem: "Gerado pelo agente a partir da especificação",
          versao: "1",
          ambiente: "sandbox",
          conteudo:
            "Rascunho gerado pelo agente com base na especificação em elaboração. Precisa de revisão humana antes de virar documentação oficial.",
        },
        {
          id: "doc-sandbox-portabilidade",
          titulo: "Portabilidade de consignado (rascunho)",
          classe: "Requisito",
          origem: "Gerado pelo agente a partir do repositório",
          versao: "1",
          ambiente: "sandbox",
          conteudo:
            "Extraído do código do serviço de consignações. Contém regras que ainda não foram confirmadas com a área de negócio — em especial o limite de margem consignável.",
        },
      ],
    },
  ],
  "prj-002": [
    {
      id: "doc-exp-dominio",
      titulo: "Domínio — Pagamentos",
      classe: "Domínio",
      origem: "expresso-pagamentos-wiki",
      versao: "2",
      ambiente: "oficial",
      conteudo: "Conciliação e repasse entre órgãos e instituições financeiras.",
      filhos: [
        {
          id: "doc-exp-conciliacao",
          titulo: "Conciliação automática",
          classe: "Requisito",
          origem: "expresso-pagamentos-wiki/conciliacao.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "## Casamento de lançamentos\n\nO arquivo de retorno do banco é conciliado com os lançamentos previstos.\n\n### Regras\n1. Divergência de centavos até R$ 0,05 concilia automaticamente e registra o ajuste.\n2. Divergência maior abre pendência para o órgão.\n3. Lançamento sem correspondência após 5 dias úteis vira ocorrência.",
        },
        {
          id: "doc-exp-arquivo",
          titulo: "Layout do arquivo de retorno",
          classe: "Contrato",
          origem: "expresso-pagamentos-api/docs/layout.md",
          versao: "3",
          ambiente: "oficial",
          conteudo:
            "Formato posicional, padrão CNAB 240, com dois campos de uso da empresa reservados ao identificador do órgão e ao do empenho.",
        },
      ],
    },
  ],
  "prj-005": [
    {
      id: "doc-ass-dominio",
      titulo: "Domínio — Assinatura",
      classe: "Domínio",
      origem: "assinatura-gov-wiki",
      versao: "1",
      ambiente: "oficial",
      conteudo: "Assinatura eletrônica de documentos oficiais com identidade gov.br.",
      filhos: [
        {
          id: "doc-ass-niveis",
          titulo: "Níveis de confiabilidade",
          classe: "Requisito",
          origem: "assinatura-gov-wiki/niveis.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Bronze não assina. Prata assina documentos internos. Ouro assina documentos com efeito externo.\n\nO produto precisa dizer, antes de o usuário tentar, qual nível o documento exige.",
        },
        {
          id: "doc-ass-verificacao",
          titulo: "Verificação pública",
          classe: "Requisito",
          origem: "assinatura-gov-wiki/verificacao.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "Todo documento assinado recebe código de verificação e endereço público de conferência, sem exigir autenticação de quem confere.",
        },
      ],
    },
  ],
  "prj-007": [
    {
      id: "doc-app-dominio",
      titulo: "Domínio — Cidadão",
      classe: "Domínio",
      origem: "app-cidadao-wiki",
      versao: "2",
      ambiente: "oficial",
      conteudo: "Serviços ao cidadão no aplicativo móvel do estado.",
      filhos: [
        {
          id: "doc-app-carteira",
          titulo: "Carteira de documentos",
          classe: "Requisito",
          origem: "app-cidadao-wiki/carteira.md",
          versao: "2",
          ambiente: "oficial",
          conteudo:
            "Documentos disponíveis em modo offline, com validade visível e atualização automática quando há rede.\n\nO aplicativo não guarda o documento em texto claro no dispositivo.",
        },
        {
          id: "doc-app-notificacoes",
          titulo: "Notificações e permissões",
          classe: "Requisito",
          origem: "app-cidadao-wiki/notificacoes.md",
          versao: "1",
          ambiente: "oficial",
          conteudo:
            "A permissão de notificação é pedida no momento em que ela passa a ser útil, não na abertura do aplicativo.",
        },
      ],
    },
  ],
};

export const documentosPadrao: DocumentoProjeto[] = [
  {
    id: "doc-vazio",
    titulo: "Sem documentação ingerida",
    classe: "Aviso",
    origem: "—",
    versao: "—",
    ambiente: "oficial",
    conteudo:
      "Este produto ainda não teve a documentação dos repositórios ingerida. Vincule um repositório do tipo Wiki e execute a ingestão para popular a base de conhecimento.",
  },
];

export const funcionalidades: Funcionalidade[] = [
  {
    id: "func-001",
    projetoId: "prj-001",
    specId: "spec-001",
    nome: "Gestão de Valores da UST",
    tipo: "CRUD",
    resumo: "Cadastro e manutenção dos valores de UST por exercício e órgão.",
    estado: "Aprovada",
    versao: "1",
    atualizadoEm: hoje,
    preview: {
      interface: {
        kind: "formulario",
        titulo: "Valores da UST",
        campos: [
          { nome: "exercicio", rotulo: "Exercício", tipo: "número", obrigatorio: true },
          { nome: "orgao", rotulo: "Órgão", tipo: "seleção", obrigatorio: true },
          {
            nome: "valorUnitario",
            rotulo: "Valor unitário (R$)",
            tipo: "moeda",
            obrigatorio: true,
          },
          { nome: "vigenciaInicio", rotulo: "Início da vigência", tipo: "data", obrigatorio: true },
          { nome: "vigenciaFim", rotulo: "Fim da vigência", tipo: "data", obrigatorio: false },
          { nome: "observacao", rotulo: "Observação", tipo: "texto longo", obrigatorio: false },
        ],
        filtros: ["Exercício", "Órgão", "Vigência"],
        colunas: ["Exercício", "Órgão", "Valor unitário", "Vigência", "Ações"],
      },
      dados: [
        {
          entidade: "ValorUst",
          campos: [
            { nome: "id", tipo: "bigint", nulo: false, descricao: "Chave primária" },
            { nome: "exercicio", tipo: "int", nulo: false, descricao: "Ano do exercício" },
            { nome: "orgao_id", tipo: "bigint", nulo: false, descricao: "FK para Orgao" },
            {
              nome: "valor_unitario",
              tipo: "numeric(12,2)",
              nulo: false,
              descricao: "Valor da UST",
            },
            { nome: "vigencia_inicio", tipo: "date", nulo: false, descricao: "Início da vigência" },
            { nome: "vigencia_fim", tipo: "date", nulo: true, descricao: "Fim da vigência" },
          ],
        },
      ],
      contratos: [
        { metodo: "GET", caminho: "/api/ust/valores", descricao: "Lista paginada com filtros." },
        {
          metodo: "POST",
          caminho: "/api/ust/valores",
          descricao: "Cria um valor de UST.",
          payload:
            '{\n  "exercicio": 2026,\n  "orgaoId": 12,\n  "valorUnitario": 61.5,\n  "vigenciaInicio": "2026-01-01"\n}',
        },
        { metodo: "PUT", caminho: "/api/ust/valores/{id}", descricao: "Atualiza um valor." },
        { metodo: "DELETE", caminho: "/api/ust/valores/{id}", descricao: "Remove logicamente." },
      ],
      regras: [
        { codigo: "RN-01", descricao: "Não pode haver vigências sobrepostas para o mesmo órgão." },
        { codigo: "RN-02", descricao: "Valor unitário deve ser maior que zero." },
        { codigo: "RN-03", descricao: "Exclusão é lógica e mantém histórico auditável." },
      ],
      criterios: [
        "Ao salvar com vigência sobreposta, o sistema exibe erro e não persiste.",
        "A listagem permite filtrar por exercício e órgão simultaneamente.",
      ],
      codigo: {
        json: `{
  "funcionalidade": "Gestão de Valores da UST",
  "tipo": "CRUD",
  "entidade": "ValorUst",
  "campos": [
    { "nome": "exercicio", "tipo": "number", "obrigatorio": true },
    { "nome": "orgao", "tipo": "select", "obrigatorio": true, "fonte": "/api/orgaos" },
    { "nome": "valorUnitario", "tipo": "currency", "obrigatorio": true },
    { "nome": "vigenciaInicio", "tipo": "date", "obrigatorio": true },
    { "nome": "vigenciaFim", "tipo": "date", "obrigatorio": false }
  ],
  "listagem": {
    "filtros": ["exercicio", "orgao", "vigencia"],
    "colunas": ["exercicio", "orgao", "valorUnitario", "vigencia"]
  }
}`,
        html: `<div class="card">
  <h5>Valores da UST</h5>
  <form class="p-fluid formgrid grid">
    <div class="field col-12 md:col-3">
      <label for="exercicio">Exercício</label>
      <p-inputNumber id="exercicio" formControlName="exercicio"></p-inputNumber>
    </div>
    <div class="field col-12 md:col-5">
      <label for="orgao">Órgão</label>
      <p-dropdown id="orgao" [options]="orgaos" formControlName="orgao"></p-dropdown>
    </div>
    <div class="field col-12 md:col-4">
      <label for="valorUnitario">Valor unitário</label>
      <p-inputNumber id="valorUnitario" mode="currency" currency="BRL"></p-inputNumber>
    </div>
  </form>
  <p-table [value]="valores" [paginator]="true" [rows]="10"></p-table>
</div>`,
        scss: `.valores-ust {
  .card {
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);
  }

  .p-table {
    margin-top: 1.5rem;
  }
}`,
        backend: [
          {
            camada: "Entidade",
            arquivo: "ValorUst.java",
            linguagem: "java",
            conteudo: `@Entity
@Table(name = "valor_ust")
public class ValorUst {
  @Id @GeneratedValue
  private Long id;
  private Integer exercicio;
  @ManyToOne private Orgao orgao;
  private BigDecimal valorUnitario;
  private LocalDate vigenciaInicio;
  private LocalDate vigenciaFim;
}`,
          },
          {
            camada: "Repositório",
            arquivo: "ValorUstRepository.java",
            linguagem: "java",
            conteudo: `public interface ValorUstRepository extends JpaRepository<ValorUst, Long> {
  List<ValorUst> findByExercicioAndOrgaoId(Integer exercicio, Long orgaoId);
}`,
          },
          {
            camada: "Serviço",
            arquivo: "ValorUstService.java",
            linguagem: "java",
            conteudo: `@Service
public class ValorUstService {
  public ValorUst salvar(ValorUstDTO dto) {
    validarVigencia(dto); // RN-01
    return repository.save(mapper.toEntity(dto));
  }
}`,
          },
          {
            camada: "Controller",
            arquivo: "ValorUstController.java",
            linguagem: "java",
            conteudo: `@RestController
@RequestMapping("/api/ust/valores")
public class ValorUstController {
  @GetMapping public Page<ValorUstDTO> listar(ValorUstFiltro filtro, Pageable pageable) { ... }
  @PostMapping public ValorUstDTO criar(@Valid @RequestBody ValorUstDTO dto) { ... }
}`,
          },
          {
            camada: "DTO",
            arquivo: "ValorUstDTO.java",
            linguagem: "java",
            conteudo: `public record ValorUstDTO(
  Long id,
  @NotNull Integer exercicio,
  @NotNull Long orgaoId,
  @Positive BigDecimal valorUnitario,
  @NotNull LocalDate vigenciaInicio,
  LocalDate vigenciaFim
) {}`,
          },
        ],
      },
    },
  },
  {
    id: "func-002",
    projetoId: "prj-001",
    nome: "Aprovação de certidão de tempo de serviço",
    tipo: "Workflow",
    resumo: "Processo de solicitação, análise e emissão da certidão com trilha de auditoria.",
    estado: "Em revisão",
    versao: "1",
    atualizadoEm: "13/08/2026",
    preview: {
      interface: {
        kind: "workflow",
        titulo: "Fluxo de emissão de certidão",
        etapas: [
          {
            nome: "Solicitação",
            responsavel: "Servidor",
            saidas: ["Enviar para análise"],
          },
          {
            nome: "Análise de vínculo",
            responsavel: "Setor de RH",
            saidas: ["Aprovar", "Solicitar correção", "Negar"],
          },
          {
            nome: "Emissão",
            responsavel: "Sistema",
            saidas: ["Gerar PDF assinado", "Notificar servidor"],
          },
          {
            nome: "Encerramento",
            responsavel: "Sistema",
            saidas: ["Registrar auditoria"],
          },
        ],
      },
      dados: [
        {
          entidade: "SolicitacaoCertidao",
          campos: [
            { nome: "id", tipo: "bigint", nulo: false, descricao: "Chave primária" },
            { nome: "servidor_id", tipo: "bigint", nulo: false, descricao: "Solicitante" },
            { nome: "situacao", tipo: "varchar(24)", nulo: false, descricao: "Etapa atual" },
            {
              nome: "analista_id",
              tipo: "bigint",
              nulo: true,
              descricao: "Responsável pela análise",
            },
            { nome: "documento_url", tipo: "text", nulo: true, descricao: "PDF emitido" },
          ],
        },
      ],
      contratos: [
        {
          metodo: "POST",
          caminho: "/api/certidoes/solicitacoes",
          descricao: "Abre a solicitação.",
        },
        {
          metodo: "POST",
          caminho: "/api/certidoes/solicitacoes/{id}/transicoes",
          descricao: "Executa uma transição de etapa.",
          payload: '{\n  "acao": "APROVAR",\n  "justificativa": "Vínculo ativo confirmado"\n}',
        },
      ],
      regras: [
        { codigo: "RN-01", descricao: "Somente vínculos ativos podem gerar certidão." },
        { codigo: "RN-02", descricao: "Negativa exige justificativa com no mínimo 20 caracteres." },
        { codigo: "RN-03", descricao: "Toda transição grava autor, data e etapa anterior." },
      ],
      criterios: [
        "Uma solicitação negada não pode avançar para emissão.",
        "A trilha de auditoria lista todas as transições em ordem cronológica.",
      ],
      codigo: {
        json: `{
  "funcionalidade": "Aprovação de certidão",
  "tipo": "Workflow",
  "etapas": ["SOLICITADA", "EM_ANALISE", "APROVADA", "EMITIDA", "NEGADA"],
  "transicoes": [
    { "de": "SOLICITADA", "para": "EM_ANALISE", "acao": "ENVIAR" },
    { "de": "EM_ANALISE", "para": "APROVADA", "acao": "APROVAR" },
    { "de": "EM_ANALISE", "para": "NEGADA", "acao": "NEGAR", "requer": "justificativa" },
    { "de": "APROVADA", "para": "EMITIDA", "acao": "EMITIR" }
  ]
}`,
        backend: [
          {
            camada: "Serviço",
            arquivo: "CertidaoWorkflowService.java",
            linguagem: "java",
            conteudo: `@Service
public class CertidaoWorkflowService {
  public Solicitacao transitar(Long id, AcaoWorkflow acao, String justificativa) {
    var solicitacao = repository.findById(id).orElseThrow();
    maquina.validar(solicitacao.getSituacao(), acao); // RN-01/RN-02
    auditoria.registrar(solicitacao, acao, justificativa); // RN-03
    return repository.save(solicitacao.aplicar(acao));
  }
}`,
          },
        ],
      },
    },
  },
  {
    id: "func-003",
    projetoId: "prj-002",
    nome: "Conciliação com o barramento estadual",
    tipo: "Integração",
    resumo: "Consome arquivos de retorno do gateway e concilia lançamentos automaticamente.",
    estado: "Em especificação",
    versao: "1",
    atualizadoEm: "12/08/2026",
    preview: {
      interface: {
        kind: "integracao",
        titulo: "Fluxo de conciliação",
        passos: [
          { nome: "Coleta", sistema: "Gateway estadual", detalhe: "Baixa o retorno CNAB às 6h." },
          {
            nome: "Normalização",
            sistema: "pagamentos-core",
            detalhe: "Converte para o modelo interno.",
          },
          {
            nome: "Conciliação",
            sistema: "pagamentos-core",
            detalhe: "Casa lançamentos por NSU e valor.",
          },
          {
            nome: "Divergências",
            sistema: "Portal",
            detalhe: "Publica fila de exceções para tratamento humano.",
          },
        ],
      },
      dados: [
        {
          entidade: "RetornoConciliacao",
          campos: [
            {
              nome: "nsu",
              tipo: "varchar(32)",
              nulo: false,
              descricao: "Identificador do gateway",
            },
            { nome: "valor", tipo: "numeric(12,2)", nulo: false, descricao: "Valor liquidado" },
            {
              nome: "situacao",
              tipo: "varchar(16)",
              nulo: false,
              descricao: "CONCILIADO ou DIVERGENTE",
            },
          ],
        },
      ],
      contratos: [
        {
          metodo: "POST",
          caminho: "/api/public/conciliacao/webhook",
          descricao: "Recebe aviso de retorno disponível.",
        },
        {
          metodo: "GET",
          caminho: "/api/conciliacao/divergencias",
          descricao: "Lista divergências abertas.",
        },
      ],
      regras: [
        { codigo: "RN-01", descricao: "Retorno já processado é ignorado por idempotência de NSU." },
        {
          codigo: "RN-02",
          descricao: "Divergência de valor acima de R$ 0,01 vira exceção manual.",
        },
      ],
      criterios: [
        "Reprocessar o mesmo arquivo não duplica lançamentos.",
        "Divergências ficam visíveis na fila com o motivo.",
      ],
      codigo: {
        json: `{
  "funcionalidade": "Conciliação com o barramento",
  "tipo": "Integração",
  "gatilho": { "tipo": "cron", "expressao": "0 6 * * *" },
  "origem": { "protocolo": "SFTP", "formato": "CNAB240" },
  "idempotencia": "nsu"
}`,
        backend: [
          {
            camada: "Rotina",
            arquivo: "ConciliacaoJob.java",
            linguagem: "java",
            conteudo: `@Component
public class ConciliacaoJob {
  @Scheduled(cron = "0 6 * * * *")
  public void executar() {
    var arquivos = gateway.baixarRetornos();
    arquivos.forEach(conciliacaoService::processar); // RN-01
  }
}`,
          },
        ],
      },
    },
  },
  {
    id: "func-004",
    projetoId: "prj-001",
    nome: "Painel gerencial de protocolos",
    tipo: "Relatório",
    resumo: "Indicadores de volume, tempo médio e backlog de protocolos por órgão.",
    estado: "Em especificação",
    versao: "1",
    atualizadoEm: "11/08/2026",
    preview: {
      interface: {
        kind: "relatorio",
        titulo: "Protocolos por órgão",
        filtros: ["Período", "Órgão", "Situação"],
        colunas: ["Órgão", "Abertos", "Concluídos", "Tempo médio (dias)"],
        agregacoes: ["Contagem por situação", "Média de dias em aberto", "Backlog acumulado"],
      },
      dados: [
        {
          entidade: "VwProtocoloIndicador",
          campos: [
            { nome: "orgao", tipo: "varchar(120)", nulo: false, descricao: "Órgão do protocolo" },
            { nome: "abertos", tipo: "int", nulo: false, descricao: "Protocolos em aberto" },
            {
              nome: "tempo_medio_dias",
              tipo: "numeric(6,2)",
              nulo: false,
              descricao: "Tempo médio",
            },
          ],
        },
      ],
      contratos: [
        {
          metodo: "GET",
          caminho: "/api/relatorios/protocolos",
          descricao: "Retorna o agregado por órgão.",
        },
      ],
      regras: [
        { codigo: "RN-01", descricao: "Período máximo consultável é de 24 meses." },
        { codigo: "RN-02", descricao: "Protocolos sigilosos não entram no agregado." },
      ],
      criterios: ["Exportação em CSV respeita os filtros aplicados."],
      codigo: {
        json: `{
  "funcionalidade": "Painel gerencial de protocolos",
  "tipo": "Relatório",
  "filtros": ["periodo", "orgao", "situacao"],
  "metricas": ["abertos", "concluidos", "tempoMedioDias"],
  "exportacoes": ["csv", "pdf"]
}`,
        backend: [],
      },
    },
  },
];
