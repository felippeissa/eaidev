import { Component, computed } from '@angular/core';
import { Card } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatCard } from '../../shared/stat-card.component';
import { custos, serieCustos } from '@/mocks/data';

const brl = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

@Component({
  selector: 'app-custo',
  imports: [PageHeader, StatCard, Card, ChartModule, IconField, InputIcon, InputText, TableModule, Tag],
  template: `
    <app-page-header titulo="Custos" [trilha]="[{ label: 'Custos' }]" />

    <div class="indicadores">
      <app-stat-card label="Total do mês" [value]="total()" icon="pi pi-dollar" />
      <app-stat-card label="Maior recurso" [value]="maior()?.valor ?? '—'" [hint]="maior()?.recurso" icon="pi pi-server" />
      <app-stat-card label="Variação média" [value]="media()" hint="vs. mês anterior" icon="pi pi-chart-line" />
    </div>

    <p-card header="Evolução do custo mensal" subheader="Últimos sete meses de faturamento consolidado" styleClass="bloco">
      <p-chart type="line" [data]="grafico" [options]="opcoes" height="280px" />
    </p-card>

    <p-card styleClass="bloco">
      <p-table #tabela [value]="lista() ?? []" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="lista() === null" [globalFilterFields]="['recurso', 'projeto', 'categoria']" [tableStyle]="{ 'min-width': '50rem' }">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText type="text" placeholder="Buscar por recurso ou produto" (input)="tabela.filterGlobal($any($event.target).value, 'contains')" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="recurso">Recurso <p-sortIcon field="recurso" /></th>
            <th pSortableColumn="categoria">Categoria <p-sortIcon field="categoria" /></th>
            <th pSortableColumn="projeto">Produto <p-sortIcon field="projeto" /></th>
            <th pSortableColumn="valorMes">Custo do mês <p-sortIcon field="valorMes" /></th>
            <th pSortableColumn="variacao">Variação <p-sortIcon field="variacao" /></th>
          </tr>
        </ng-template>
        <ng-template #body let-c>
          <tr>
            <td>{{ c.recurso }}</td>
            <td><p-tag [value]="c.categoria" severity="secondary" /></td>
            <td>{{ c.projeto }}</td>
            <td><strong>{{ moeda(c.valorMes) }}</strong></td>
            <td [class.perigo]="c.variacao >= 0" [class.bom]="c.variacao < 0">
              <i class="pi" [class.pi-arrow-up-right]="c.variacao >= 0" [class.pi-arrow-down-right]="c.variacao < 0"></i> {{ c.variacao.toFixed(1) }}%
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="5" class="vazio">Nenhum custo encontrado.</td></tr></ng-template>
      </p-table>
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
      .perigo {
        color: var(--p-red-600);
      }
      .bom {
        color: var(--p-green-600);
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
export class CustoPage {
  protected readonly lista = carregar(() => atraso(custos));
  protected moeda = brl;

  protected readonly total = computed(() => brl((this.lista() ?? []).reduce((acc, c) => acc + c.valorMes, 0)));
  protected readonly maior = computed(() => {
    const m = [...(this.lista() ?? [])].sort((a, b) => b.valorMes - a.valorMes)[0];
    return m ? { valor: brl(m.valorMes), recurso: m.recurso } : undefined;
  });
  protected readonly media = computed(() => {
    const l = this.lista() ?? [];
    return l.length === 0 ? '—' : `${(l.reduce((a, c) => a + c.variacao, 0) / l.length).toFixed(1)}%`;
  });

  protected readonly grafico = {
    labels: serieCustos.map((s) => s.mes),
    datasets: [{ label: 'Custo', data: serieCustos.map((s) => s.valor), fill: true, tension: 0.35, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.18)' }],
  };
  protected readonly opcoes = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v: number | string) => `${Math.round(Number(v) / 1000)}k` } } },
  };
}
