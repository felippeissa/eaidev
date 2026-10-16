import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Drawer } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatusTag } from '../../shared/status-tag.component';
import { softwares } from '@/mocks/data';
import type { Software } from '@/types';

@Component({
  selector: 'app-softwares',
  imports: [PageHeader, StatusTag, Button, Card, Drawer, IconField, InputIcon, InputText, TableModule, Tag],
  template: `
    <app-page-header titulo="Catálogo de softwares" [trilha]="[{ label: 'Softwares' }]">
      <p-button label="Cadastrar software" />
    </app-page-header>

    <p-card>
      <p-table #tabela [value]="dados() ?? []" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="dados() === null" [globalFilterFields]="['nome', 'time', 'linguagem', 'tipo']" [tableStyle]="{ 'min-width': '55rem' }">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText type="text" placeholder="Buscar por nome, time ou tecnologia" (input)="tabela.filterGlobal($any($event.target).value, 'contains')" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">Software <p-sortIcon field="nome" /></th>
            <th pSortableColumn="tipo">Tipo <p-sortIcon field="tipo" /></th>
            <th pSortableColumn="linguagem">Tecnologia <p-sortIcon field="linguagem" /></th>
            <th pSortableColumn="ambiente">Ambiente <p-sortIcon field="ambiente" /></th>
            <th pSortableColumn="saude">Saúde <p-sortIcon field="saude" /></th>
            <th pSortableColumn="versao">Versão <p-sortIcon field="versao" /></th>
          </tr>
        </ng-template>
        <ng-template #body let-s>
          <tr class="linha" (click)="selecionado.set(s)">
            <td><strong>{{ s.nome }}</strong><br /><small class="mudo">{{ s.time }}</small></td>
            <td>{{ s.tipo }}</td>
            <td><p-tag [value]="s.linguagem" severity="secondary" /></td>
            <td><app-status-tag [status]="s.ambiente" /></td>
            <td><app-status-tag [status]="s.saude" /></td>
            <td>{{ s.versao }}</td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="6" class="vazio">Nenhum software encontrado.</td></tr></ng-template>
      </p-table>
    </p-card>

    <p-drawer [visible]="!!selecionado()" (visibleChange)="!$event && selecionado.set(null)" position="right" [header]="selecionado()?.nome ?? ''" [style]="{ width: '28rem' }">
      @if (selecionado(); as s) {
        <p class="mudo">{{ s.descricao }}</p>
        <div class="info">
          <div><span class="rotulo">Tipo</span><strong>{{ s.tipo }}</strong></div>
          <div><span class="rotulo">Tecnologia</span><strong>{{ s.linguagem }}</strong></div>
          <div><span class="rotulo">Time</span><strong>{{ s.time }}</strong></div>
          <div><span class="rotulo">Versão</span><strong>{{ s.versao }}</strong></div>
        </div>
        <div class="chips"><app-status-tag [status]="s.ambiente" /><app-status-tag [status]="s.saude" /></div>
        <span class="rotulo">Dependências</span>
        <div class="chips">
          @for (d of s.dependencias; track d) { <p-tag [value]="d" severity="secondary" /> } @empty { <span class="mudo">Sem dependências mapeadas.</span> }
        </div>
      }
    </p-drawer>
  `,
  styles: [
    `
      .linha {
        cursor: pointer;
      }
      .info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      .info div {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .rotulo {
        display: block;
        margin-bottom: 0.25rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--p-text-muted-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .vazio {
        padding: 2rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class SoftwaresPage {
  protected readonly dados = carregar(() => atraso(softwares));
  protected readonly selecionado = signal<Software | null>(null);
}
