import { Component } from '@angular/core';

import { PageHeader } from '../../../layout/page-header.component';
import { FormularioProduto } from './formulario-produto.component';

@Component({
  selector: 'app-produto-novo',
  imports: [PageHeader, FormularioProduto],
  template: `
    <app-page-header titulo="Novo produto" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: 'Novo produto' }]" />
    <app-formulario-produto />
  `,
})
export class ProdutoNovoPage {}
