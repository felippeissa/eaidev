import { Component, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatusTag } from '../../shared/status-tag.component';
import { execucoes } from '@/mocks/data';
import type { Execucao } from '@/types';

@Component({
  selector: 'app-execucoes',
  imports: [PageHeader, StatusTag, Card, Dialog, IconField, InputIcon, InputText, TableModule, Tag],
  template: `
    <app-page-header titulo="Execuções" [trilha]="[{ label: 'Execuções' }]" />

    <p-card>
      <p-table #tabela [value]="dados() ?? []" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="dados() === null" [globalFilterFields]="['rotina', 'responsavel', 'gatilho']" [tableStyle]="{ 'min-width': '50rem' }">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText type="text" placeholder="Buscar por rotina ou responsável" (input)="tabela.filterGlobal($any($event.target).value, 'contains')" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="rotina">Rotina <p-sortIcon field="rotina" /></th>
            <th pSortableColumn="gatilho">Gatilho <p-sortIcon field="gatilho" /></th>
            <th pSortableColumn="status">Situação <p-sortIcon field="status" /></th>
            <th pSortableColumn="inicio">Início <p-sortIcon field="inicio" /></th>
            <th>Duração</th>
            <th pSortableColumn="responsavel">Responsável <p-sortIcon field="responsavel" /></th>
          </tr>
        </ng-template>
        <ng-template #body let-e>
          <tr class="linha" (click)="selecionada.set(e)">
            <td>{{ e.rotina }}</td>
            <td><p-tag [value]="e.gatilho" severity="secondary" /></td>
            <td><app-status-tag [status]="e.status" /></td>
            <td>{{ e.inicio }}</td>
            <td>{{ e.duracao }}</td>
            <td>{{ e.responsavel }}</td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="6" class="vazio">Nenhuma execução encontrada.</td></tr></ng-template>
      </p-table>
    </p-card>

    <p-dialog [header]="selecionada()?.rotina ?? ''" [visible]="!!selecionada()" (visibleChange)="!$event && selecionada.set(null)" [modal]="true" [style]="{ width: '42rem' }">
      @if (selecionada(); as e) {
        <p class="mudo">{{ e.gatilho }} · {{ e.inicio }} · {{ e.duracao }}</p>
        <pre class="log">{{ e.log.join('\n') }}</pre>
      }
    </p-dialog>
  `,
  styles: [
    `
      .linha {
        cursor: pointer;
      }
      .log {
        max-height: 20rem;
        overflow: auto;
        margin: 0;
        padding: 1rem;
        border-radius: 8px;
        background: var(--p-content-hover-background);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
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
export class ExecucoesPage {
  protected readonly dados = carregar(() => atraso(execucoes));
  protected readonly selecionada = signal<Execucao | null>(null);
}
