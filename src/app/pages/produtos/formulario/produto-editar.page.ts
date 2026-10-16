import { Component, effect, input, signal } from '@angular/core';

import { PageHeader } from '../../../layout/page-header.component';
import { FormularioProduto } from './formulario-produto.component';
import { obterDetalhe, obterProjeto } from '@/lib/projeto-store';
import type { Projeto } from '@/types';
import type { ProjetoDetalhe } from '@/types/workspace';

@Component({
  selector: 'app-produto-editar',
  imports: [PageHeader, FormularioProduto],
  template: `
    @if (projeto(); as produto) {
      <app-page-header [titulo]="'Editar ' + produto.nome" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: 'Editar produto' }]" />
      @if (detalhe(); as dados) {
        <app-formulario-produto [projeto]="produto" [detalhe]="dados" />
      }
    }
  `,
})
export class ProdutoEditarPage {
  /** Vem da rota (`/projetos/editar/:id`). */
  readonly id = input.required<string>();

  protected readonly projeto = signal<Projeto | undefined>(undefined);
  protected readonly detalhe = signal<ProjetoDetalhe | undefined>(undefined);

  constructor() {
    effect(() => {
      const id = this.id();
      void Promise.all([obterProjeto(id), obterDetalhe(id)]).then(([projeto, detalhe]) => {
        this.projeto.set(projeto);
        this.detalhe.set(detalhe);
      });
    });
  }
}
