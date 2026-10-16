import { Component, computed } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { GrafoDependencias } from '../../shared/grafo-dependencias.component';
import { grafo } from '@/mocks/data';

@Component({
  selector: 'app-grafo',
  imports: [PageHeader, GrafoDependencias, Skeleton, Tag],
  template: `
    <app-page-header titulo="Relação entre componentes mapeados no catálogo técnico" [trilha]="[{ label: 'Arquitetura' }, { label: 'Grafo de dependências' }]" />

    @if (dados(); as g) {
      <div class="resumo">
        <p-tag [value]="g.nos.length + ' componentes'" severity="secondary" [rounded]="true" />
        <p-tag [value]="bancos() + ' bancos de dados'" severity="secondary" [rounded]="true" />
        <p-tag [value]="servicos() + ' serviços'" severity="secondary" [rounded]="true" />
        <p-tag [value]="frontends() + ' frontends'" severity="secondary" [rounded]="true" />
        <p-tag [value]="g.arestas.length + ' relações'" severity="secondary" [rounded]="true" />
      </div>
      <p class="ajuda">Arraste os nós para reorganizar a malha, use o scroll para dar zoom e clique em um componente para ver seus metadados.</p>
      <app-grafo-dependencias [dados]="g" />
    } @else {
      <p-skeleton width="100%" height="620px" borderRadius="16px" />
    }
  `,
  styles: [
    `
      .resumo {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .ajuda {
        margin: 0.75rem 0 1.25rem;
        font-size: 0.875rem;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class GrafoPage {
  protected readonly dados = carregar(() => atraso(grafo));

  protected readonly bancos = computed(() => this.dados()?.nos.filter((n) => n.tipo === 'Banco').length ?? 0);
  protected readonly servicos = computed(() => this.dados()?.nos.filter((n) => n.tipo === 'Serviço').length ?? 0);
  protected readonly frontends = computed(() => this.dados()?.nos.filter((n) => n.tipo === 'Aplicação' || n.tipo === 'Biblioteca').length ?? 0);
}
