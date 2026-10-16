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
