import { Routes } from '@angular/router';

import { autenticadoGuard, visitanteGuard } from './core/auth.guard';
import { Shell } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [visitanteGuard],
    title: 'Entrar · EAI Dev — Plataforma de Engenharia',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: Shell,
    canActivate: [autenticadoGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Painel de indicadores · EAI Dev',
        loadComponent: () => import('./pages/painel/painel.page').then((m) => m.PainelPage),
      },
      {
        path: 'projetos',
        pathMatch: 'full',
        title: 'Produtos · EAI Dev',
        loadComponent: () =>
          import('./pages/produtos/listagem/produtos-listagem.page').then((m) => m.ProdutosListagemPage),
      },
      {
        path: 'projetos/novo',
        title: 'Novo produto · EAI Dev',
        loadComponent: () => import('./pages/produtos/formulario/produto-novo.page').then((m) => m.ProdutoNovoPage),
      },
      {
        path: 'projetos/editar/:id',
        title: 'Editar produto · EAI Dev',
        loadComponent: () => import('./pages/produtos/formulario/produto-editar.page').then((m) => m.ProdutoEditarPage),
      },
      {
        path: 'projetos/especificacoes',
        title: 'Especificações · EAI Dev',
        loadComponent: () => import('./pages/especificacoes/especificacoes-lista.page').then((m) => m.EspecificacoesListaPage),
      },
      {
        path: 'projetos/especificacoes/nova',
        title: 'Nova especificação · EAI Dev',
        loadComponent: () => import('./pages/especificacoes/especificacao-nova.page').then((m) => m.EspecificacaoNovaPage),
      },
      {
        path: 'projetos/especificacoes/:id',
        title: 'Especificação · EAI Dev',
        loadComponent: () => import('./pages/especificacoes/especificacao-detalhe.page').then((m) => m.EspecificacaoDetalhePage),
      },
      {
        path: 'projetos/docs',
        title: 'Documentações · EAI Dev',
        loadComponent: () => import('./pages/documentacoes/documentacoes.page').then((m) => m.DocumentacoesPage),
      },
      {
        path: 'catalogo/apis',
        title: 'Catálogo de APIs · EAI Dev',
        loadComponent: () => import('./pages/catalogo/apis.page').then((m) => m.ApisPage),
      },
      {
        path: 'catalogo/apis/:apiId/:versao',
        title: 'Contrato da API · EAI Dev',
        loadComponent: () => import('./pages/catalogo/api-contrato.page').then((m) => m.ApiContratoPage),
      },
      {
        path: 'esteiras',
        title: 'Esteiras de entrega · EAI Dev',
        loadComponent: () => import('./pages/esteiras/esteiras.page').then((m) => m.EsteirasPage),
      },
      {
        path: 'execucoes',
        title: 'Execuções · EAI Dev',
        loadComponent: () => import('./pages/execucoes/execucoes.page').then((m) => m.ExecucoesPage),
      },
      {
        path: 'incidentes',
        title: 'Incidentes e saúde · EAI Dev',
        loadComponent: () => import('./pages/incidentes/incidentes.page').then((m) => m.IncidentesPage),
      },
      {
        path: 'custo',
        title: 'Custos · EAI Dev',
        loadComponent: () => import('./pages/custo/custo.page').then((m) => m.CustoPage),
      },
      {
        path: 'self-service',
        title: 'Autoatendimento · EAI Dev',
        loadComponent: () => import('./pages/self-service/self-service.page').then((m) => m.SelfServicePage),
      },
      {
        path: 'catalogo/softwares',
        title: 'Catálogo de softwares · EAI Dev',
        loadComponent: () => import('./pages/catalogo/softwares.page').then((m) => m.SoftwaresPage),
      },
      {
        path: 'chat',
        title: 'Suporte da plataforma · EAI Dev',
        loadComponent: () => import('./pages/chat/chat.page').then((m) => m.ChatPage),
      },
      {
        path: 'agentic/plugins',
        title: 'Extensões · EAI Dev',
        loadComponent: () => import('./pages/agentic/plugins.page').then((m) => m.PluginsPage),
      },
      {
        path: 'agentic/skills',
        title: 'Habilidades · EAI Dev',
        loadComponent: () => import('./pages/agentic/skills.page').then((m) => m.SkillsPage),
      },
      {
        path: 'grafo',
        title: 'Grafo de dependências · EAI Dev',
        loadComponent: () => import('./pages/arquitetura/grafo.page').then((m) => m.GrafoPage),
      },
      {
        path: 'mapa',
        title: 'Mapa de fluxos · EAI Dev',
        loadComponent: () => import('./pages/arquitetura/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'observabilidade',
        title: 'Observabilidade · EAI Dev',
        loadComponent: () => import('./pages/observabilidade/observabilidade.page').then((m) => m.ObservabilidadePage),
      },
      {
        path: 'agentic/conectores',
        title: 'Conectores · EAI Dev',
        loadComponent: () => import('./pages/conectores/conectores.page').then((m) => m.ConectoresPage),
      },
      { path: 'agentic/mcp', redirectTo: 'agentic/conectores?tipo=MCP' },
      {
        path: 'usuarios',
        title: 'Usuários · EAI Dev',
        loadComponent: () => import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'projetos/:id',
        title: 'Produto · EAI Dev',
        loadComponent: () => import('./pages/produtos/workspace/produto-workspace.page').then((m) => m.ProdutoWorkspacePage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
