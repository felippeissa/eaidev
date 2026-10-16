import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';

import { carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { DocExplorer } from '../../shared/doc-explorer.component';
import { listarProjetos } from '@/lib/projeto-store';

@Component({
  selector: 'app-documentacoes',
  imports: [FormsModule, PageHeader, Card, Select, DocExplorer],
  template: `
    <app-page-header titulo="Documentações" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: 'Documentações' }]" />

    <p-card>
      <div class="campo">
        <label for="d-produto">Produto</label>
        <p-select inputId="d-produto" [options]="produtos() ?? []" optionLabel="nome" optionValue="id" placeholder="Escolha o produto" [ngModel]="produtoId()" (ngModelChange)="produtoId.set($event)" [fluid]="true" />
      </div>
    </p-card>

    @if (produtoId(); as id) {
      <div class="explorador"><app-doc-explorer [projetoId]="id" /></div>
    }
  `,
  styles: [
    `
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 24rem;
      }
      .explorador {
        margin-top: 1rem;
      }
    `,
  ],
})
export class DocumentacoesPage {
  protected readonly produtos = carregar(() => listarProjetos());
  protected readonly produtoId = signal<string | null>(null);
}
