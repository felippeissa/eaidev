import { Component, computed } from '@angular/core';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatCard } from '../../shared/stat-card.component';
import { StatusTag } from '../../shared/status-tag.component';
import { incidentes, saude } from '@/mocks/data';

const SEVERIDADE: Record<string, 'danger' | 'warn' | 'info' | 'secondary'> = { Crítico: 'danger', Alto: 'warn', Médio: 'info', Baixo: 'secondary' };

@Component({
  selector: 'app-incidentes',
  imports: [PageHeader, StatCard, StatusTag, Card, IconField, InputIcon, InputText, ProgressBar, TableModule, Tag],
  template: `
    <app-page-header titulo="Incidentes e saúde" [trilha]="[{ label: 'Incidentes' }]" />

    <div class="indicadores">
      <app-stat-card label="Incidentes abertos" [value]="'' + abertos()" icon="pi pi-exclamation-triangle" />
      <app-stat-card label="Críticos" [value]="'' + criticos()" hint="exigem ação imediata" icon="pi pi-bolt" />
      <app-stat-card label="Serviços saudáveis" [value]="saudaveis()" icon="pi pi-shield" />
    </div>

    <p-card styleClass="bloco">
      <p-table #tabela [value]="lista() ?? []" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="lista() === null" [globalFilterFields]="['titulo', 'servico', 'responsavel']" [tableStyle]="{ 'min-width': '55rem' }">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText type="text" placeholder="Buscar por título, serviço ou responsável" (input)="tabela.filterGlobal($any($event.target).value, 'contains')" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="titulo">Incidente <p-sortIcon field="titulo" /></th>
            <th pSortableColumn="severidade">Severidade <p-sortIcon field="severidade" /></th>
            <th pSortableColumn="status">Situação <p-sortIcon field="status" /></th>
            <th pSortableColumn="servico">Serviço <p-sortIcon field="servico" /></th>
            <th pSortableColumn="aberto">Aberto em <p-sortIcon field="aberto" /></th>
            <th pSortableColumn="responsavel">Responsável <p-sortIcon field="responsavel" /></th>
          </tr>
        </ng-template>
        <ng-template #body let-i>
          <tr>
            <td><strong>{{ i.titulo }}</strong><br /><small class="mudo">{{ i.impacto }}</small></td>
            <td><p-tag [value]="i.severidade" [severity]="severidade(i.severidade)" /></td>
            <td><app-status-tag [status]="i.status" /></td>
            <td>{{ i.servico }}</td>
            <td>{{ i.aberto }}</td>
            <td>{{ i.responsavel }}</td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="6" class="vazio">Nenhum incidente encontrado.</td></tr></ng-template>
      </p-table>
    </p-card>

    <p-card header="Saúde dos serviços" subheader="Disponibilidade e latência observadas nas últimas 24h" styleClass="bloco">
      <div class="servicos">
        @for (s of servicos() ?? []; track s.id) {
          <div class="servico">
            <div class="topo"><code>{{ s.nome }}</code><app-status-tag [status]="s.status" /></div>
            <p-progressbar [value]="s.uptime" [showValue]="false" [style]="{ height: '8px' }" />
            <div class="topo"><small class="mudo">uptime {{ s.uptime }}%</small><small class="mudo">{{ s.latencia }} ms · {{ s.ultimoCheck }}</small></div>
          </div>
        }
      </div>
    </p-card>
  `,
  styles: [
    `
      .indicadores {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .servicos {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
        gap: 1rem;
      }
      .servico {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .topo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .vazio {
        padding: 2rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
      @media (max-width: 800px) {
        .indicadores {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class IncidentesPage {
  protected readonly lista = carregar(() => atraso(incidentes));
  protected readonly servicos = carregar(() => atraso(saude));

  protected readonly abertos = computed(() => (this.lista() ?? []).filter((i) => i.status !== 'Concluído').length);
  protected readonly criticos = computed(() => (this.lista() ?? []).filter((i) => i.severidade === 'Crítico').length);
  protected readonly saudaveis = computed(() => {
    const s = this.servicos() ?? [];
    return `${s.filter((x) => x.status === 'Saudável').length}/${s.length}`;
  });

  protected severidade = (valor: string) => SEVERIDADE[valor] ?? 'secondary';
}
