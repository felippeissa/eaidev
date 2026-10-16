import { Component, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { atraso, carregarRecarregavel } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { FiltroProduto, TODOS_OS_PRODUTOS } from '../../shared/filtro-produto.component';
import { StatusTag } from '../../shared/status-tag.component';
import { esteirasCatalogo } from '@/mocks/catalogo';
import type { EsteiraCatalogo } from '@/types';

const TRILHA = [
  { branch: 'master', descricao: 'branch principal', cor: 'var(--p-green-600)' },
  { branch: 'develop', descricao: 'integração', cor: 'var(--p-sky-600)' },
  { branch: 'feature/*', descricao: 'desenvolvimento de novas funcionalidades', cor: 'var(--p-primary-color)' },
  { branch: 'release/*', descricao: 'preparação e estabilização de versões', cor: 'var(--p-yellow-600)' },
  { branch: 'hotfix/*', descricao: 'correções urgentes', cor: 'var(--p-red-600)' },
];

/** Ícone e cor de cada situação do estágio. */
const ICONE: Record<string, { icone: string; cor: string }> = {
  Sucesso: { icone: 'pi pi-check-circle', cor: 'var(--p-green-600)' },
  Falha: { icone: 'pi pi-times-circle', cor: 'var(--p-red-600)' },
  Executando: { icone: 'pi pi-spin pi-spinner', cor: 'var(--p-sky-600)' },
  Pendente: { icone: 'pi pi-circle', cor: 'var(--p-text-muted-color)' },
  Agendada: { icone: 'pi pi-clock', cor: 'var(--p-text-muted-color)' },
  'Aguardando ação manual': { icone: 'pi pi-pause-circle', cor: 'var(--p-yellow-600)' },
  Cancelada: { icone: 'pi pi-ban', cor: 'var(--p-red-600)' },
  Ignorada: { icone: 'pi pi-step-forward', cor: 'var(--p-text-muted-color)' },
};

@Component({
  selector: 'app-esteiras',
  imports: [PageHeader, StatusTag, FiltroProduto, Button, Card, Tag],
  template: `
    <app-page-header titulo="Esteiras de entrega" [trilha]="[{ label: 'Esteiras' }]">
      <p-button [label]="'Atualizar'" icon="pi pi-refresh" [text]="true" severity="secondary" [loading]="atualizando()" [disabled]="atualizando()" (onClick)="atualizar()" />
      <p-button label="Configurar esteira" [outlined]="true" />
    </app-page-header>

    <p-card header="Modelo GitFlow">
      <ng-template #subtitle>
        Fluxo de ramificações adotado: as funcionalidades integram em <code>develop</code>, as versões estabilizam e promovem para <code>master</code>, e as correções urgentes ajustam a produção e retornam para ambas.
      </ng-template>
      <div class="chips">
        @for (etapa of trilha; track etapa.branch) {
          <span class="trilha"><i class="pi pi-share-alt" [style.color]="etapa.cor"></i><code>{{ etapa.branch }}</code><span class="mudo">{{ etapa.descricao }}</span></span>
        }
      </div>
    </p-card>

    <p-card styleClass="bloco">
      <div class="filtro"><app-filtro-produto [valor]="produto()" (valorChange)="produto.set($event)" /></div>
    </p-card>

    <div class="grade">
      @for (e of filtradas(); track e.id) {
        <p-card>
          <ng-template #title><span class="titulo">{{ e.nome }}<app-status-tag [status]="e.status" /></span></ng-template>
          <ng-template #subtitle>{{ e.repositorio }} · {{ e.duracao }} · {{ e.atualizadoEm }}</ng-template>
          <div class="chips">
            <p-tag [value]="e.branch" severity="info" icon="pi pi-share-alt" />
            @if (e.gitflow; as g) {
              <p-tag [value]="g.tipo" severity="secondary" />
              <code class="mudo">{{ g.commit }}</code><small class="mudo">{{ g.autor }}</small>
            }
          </div>
          @if (e.gitflow; as g) {
            <small class="mudo bloco-texto">{{ g.mensagem }}@if (g.mergeAlvo !== '—') { · destino: <code>{{ g.mergeAlvo }}</code> }</small>
          }
          <ol class="estagios">
            @for (s of e.estagios; track s.nome) {
              <li><span><i [class]="icone(s.status).icone" [style.color]="icone(s.status).cor"></i> {{ s.nome }}</span><small class="mudo">{{ s.status }}</small></li>
            }
          </ol>
          <div class="rodape">
            <div class="chips">
              <p-button label="Executar" icon="pi pi-play-circle" size="small" (onClick)="executar(e)" />
              <p-button label="Reexecutar falhas" icon="pi pi-replay" size="small" [outlined]="true" (onClick)="reexecutar(e)" />
            </div>
            <a class="gitlab" [href]="e.urlPipelines" target="_blank" rel="noopener noreferrer"><i class="pi pi-external-link"></i> Ver no GitLab</a>
          </div>
        </p-card>
      } @empty {
        <p-card><p class="vazio">Nenhuma esteira para o Produto escolhido.</p></p-card>
      }
    </div>
  `,
  styles: [
    `
      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .trilha {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 6px;
        font-size: 0.8125rem;
      }
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .filtro {
        max-width: 24rem;
      }
      .grade {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .titulo {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .estagios {
        list-style: none;
        margin: 1rem 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .estagios li {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 6px;
      }
      .rodape {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .gitlab {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
        text-decoration: none;
      }
      .gitlab:hover {
        color: var(--p-primary-color);
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .bloco-texto {
        display: block;
        margin-top: 0.5rem;
      }
      .vazio {
        margin: 0;
        padding: 1.5rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
      @media (max-width: 1000px) {
        .grade {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class EsteirasPage {
  private readonly mensagens = inject(MessageService);

  protected readonly trilha = TRILHA;
  protected readonly produto = signal(TODOS_OS_PRODUTOS);
  protected readonly atualizando = signal(false);

  /** A tela não se atualiza sozinha: só quando se clica em "Atualizar". */
  protected readonly lista = carregarRecarregavel(() => atraso(esteirasCatalogo, 400));

  protected readonly filtradas = computed(() => (this.lista.dado() ?? []).filter((e) => this.produto() === TODOS_OS_PRODUTOS || e.produtoId === this.produto()));

  protected icone = (status: string) => ICONE[status] ?? ICONE['Pendente']!;

  protected async atualizar(): Promise<void> {
    this.atualizando.set(true);
    await this.lista.recarregar();
    this.atualizando.set(false);
  }

  protected executar(e: EsteiraCatalogo): void {
    this.mensagens.add({ severity: 'success', summary: 'Execução disparada', detail: `${e.nome} entrou na fila de execução.` });
  }

  protected reexecutar(e: EsteiraCatalogo): void {
    this.mensagens.add({ severity: 'info', summary: 'Reexecutando estágios com falha', detail: `Só os estágios que falharam em ${e.nome} serão repetidos.` });
  }
}
