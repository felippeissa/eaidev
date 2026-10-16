import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { FiltroProduto, TODOS_OS_PRODUTOS } from '../../shared/filtro-produto.component';
import { StatusTag } from '../../shared/status-tag.component';
import { apis } from '@/mocks/catalogo';
import type { AmbienteApi } from '@/types';

export const ORDEM_AMBIENTES: AmbienteApi[] = ['Desenvolvimento', 'Homologação', 'Produção'];

@Component({
  selector: 'app-apis',
  imports: [FormsModule, RouterLink, PageHeader, StatusTag, FiltroProduto, Button, Card, IconField, InputIcon, InputText, TableModule, Tag, Tooltip],
  template: `
    <app-page-header titulo="Catálogo de APIs" [trilha]="[{ label: 'APIs WSO2' }]" />

    <p-card>
      <div class="filtros">
        <app-filtro-produto [valor]="produto()" (valorChange)="mudarProduto($event)" />
        <div class="campo">
          <label for="busca-api">Busca</label>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText id="busca-api" type="text" placeholder="Buscar por nome ou endereço" [ngModel]="busca()" (ngModelChange)="mudarBusca($event)" [fluid]="true" />
          </p-iconfield>
        </div>
        <p-button class="limpar" label="Limpar filtros" icon="pi pi-filter-slash" severity="secondary" [text]="true" [disabled]="padrao()" (onClick)="limpar()" />
      </div>
    </p-card>

    <p-card styleClass="bloco">
      <p-table [value]="filtradas()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="dados() === null" [tableStyle]="{ 'min-width': '48rem' }" [first]="primeiro()" (onPage)="primeiro.set($event.first)">
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">API <p-sortIcon field="nome" /></th>
            <th pSortableColumn="versao" style="width: 8rem">Versão <p-sortIcon field="versao" /></th>
            <th>Ambientes</th>
            <th style="width: 6rem">Contrato</th>
          </tr>
        </ng-template>
        <ng-template #body let-api>
          <tr>
            <td>
              <a class="nome" [routerLink]="['/catalogo/apis', api.apiId, api.versao]" [queryParams]="retorno()">{{ api.nome }}</a><br />
              <small class="mono mudo">{{ api.enderecoBase }}</small>
            </td>
            <td><p-tag [value]="api.versao" severity="secondary" /></td>
            <td><div class="chips">@for (a of ambientes(api.ambientes); track a) { <app-status-tag [status]="a" /> }</div></td>
            <td><p-button icon="pi pi-file" [text]="true" severity="secondary" pTooltip="Ver contrato" tooltipPosition="top" ariaLabel="Ver contrato" [routerLink]="['/catalogo/apis', api.apiId, api.versao]" [queryParams]="retorno()" /></td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="4" class="vazio">{{ padrao() ? 'Nenhuma API cadastrada.' : 'Nenhuma API corresponde aos filtros aplicados.' }}</td></tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
  styles: [
    `
      .filtros {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: 1rem;
        align-items: end;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .nome {
        font-weight: 500;
        color: inherit;
      }
      .nome:hover {
        color: var(--p-primary-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .vazio {
        padding: 2.5rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
      @media (max-width: 800px) {
        .filtros {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ApisPage {
  private readonly router = inject(Router);

  /** Filtro e busca vêm da URL, para a volta do contrato reencontrar a lista como estava. */
  readonly produtoUrl = input<string | undefined>(undefined, { alias: 'produto' });
  readonly buscaUrl = input<string | undefined>(undefined, { alias: 'busca' });

  protected readonly produto = signal(TODOS_OS_PRODUTOS);
  protected readonly busca = signal('');
  protected readonly primeiro = signal(0);
  protected readonly dados = carregar(() => atraso(apis));

  protected readonly padrao = computed(() => this.produto() === TODOS_OS_PRODUTOS && this.busca().trim() === '');
  protected readonly retorno = computed(() => ({ ...(this.produto() !== TODOS_OS_PRODUTOS ? { produto: this.produto() } : {}), ...(this.busca().trim() ? { busca: this.busca().trim() } : {}) }));

  protected readonly filtradas = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    return (this.dados() ?? []).filter(
      (a) => (this.produto() === TODOS_OS_PRODUTOS || a.produtoId === this.produto()) && (!termo || a.nome.toLowerCase().includes(termo) || a.enderecoBase.toLowerCase().includes(termo)),
    );
  });

  constructor() {
    effect(() => {
      this.produto.set(this.produtoUrl() ?? TODOS_OS_PRODUTOS);
      this.busca.set(this.buscaUrl() ?? '');
    });
  }

  protected ambientes = (lista: AmbienteApi[]) => ORDEM_AMBIENTES.filter((a) => lista.includes(a));

  private sincronizar(): void {
    this.primeiro.set(0);
    void this.router.navigate([], { queryParams: { produto: this.produto() === TODOS_OS_PRODUTOS ? null : this.produto(), busca: this.busca().trim() || null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected mudarProduto(valor: string): void {
    this.produto.set(valor);
    this.sincronizar();
  }

  protected mudarBusca(valor: string): void {
    this.busca.set(valor);
    this.sincronizar();
  }

  protected limpar(): void {
    this.produto.set(TODOS_OS_PRODUTOS);
    this.busca.set('');
    this.sincronizar();
  }
}
