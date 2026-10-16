import { Component, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

/** Cabeçalho de página: trilha de navegação, título e, à direita, as ações da tela. */
@Component({
  selector: 'app-page-header',
  imports: [Breadcrumb],
  template: `
    <header class="cabecalho">
      @if (trilha().length) {
        <p-breadcrumb class="trilha" [model]="trilha()" [home]="inicio" />
      }
      <h1>{{ titulo() }}</h1>
      <div class="acoes"><ng-content /></div>
    </header>
  `,
  styles: [
    `
      /* Trilha e título à esquerda; as ações ocupam as duas linhas, centralizadas na vertical à direita. */
      .cabecalho {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas:
          'trilha acoes'
          'titulo acoes';
        column-gap: 1rem;
        row-gap: 1rem;
        margin-bottom: 1rem;
        /* Trilha sem fundo nem recuo, como no desenho. */
        --p-breadcrumb-background: transparent;
        --p-breadcrumb-padding: 0;
      }
      .trilha {
        grid-area: trilha;
      }
      h1 {
        grid-area: titulo;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
      .acoes {
        grid-area: acoes;
        align-self: center;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly trilha = input<MenuItem[]>([]);
  protected readonly inicio: MenuItem = { icon: 'pi pi-home', routerLink: '/', ariaLabel: 'Início' };
}
