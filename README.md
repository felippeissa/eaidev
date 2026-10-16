# eaidev

Versão em **Angular 19 + PrimeNG 19** da plataforma EAI Dev. Usa só componentes do PrimeNG, o tema Aura sem edição, PrimeIcons e a fonte Inter.

## Telas

- **Login** e **Painel**
- **Produtos**: listagem, novo e editar produto, página do produto (visão geral, documentação, repositórios e especificações), especificações (quadro, lista, nova e detalhe com as 7 etapas do ciclo) e documentações (árvore de páginas e editor em blocos)
- **APIs WSO2**: catálogo e contrato da API (documentação e arquivo)
- **Esteiras**, **Observabilidade** e **Conectores** (servidores MCP)
- **Ferramentas de agentes**: Extensões e Habilidades
- **Arquitetura**: Grafo de dependências e Mapa de fluxos
- **Usuários**
- Também por endereço: Execuções, Incidentes, Custos, Autoatendimento, Softwares e Suporte

Os dados são de exemplo e ficam no navegador (`localStorage`); não há servidor. Qualquer usuário entra com senha de 4 ou mais caracteres.

## Como rodar

```bash
npm install
npm start
```

Abre em http://localhost:4200/v2/ (o endereço base é `/v2/`).

## Build

```bash
npm run build
```
