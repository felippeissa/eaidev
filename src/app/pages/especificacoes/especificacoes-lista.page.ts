import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';

import { carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatusTag } from '../../shared/status-tag.component';
import { ORDEM_FASES, listarSpecs } from '@/lib/spec-store';
import type { Spec } from '@/types/spdd';

/** Percentual de fases aprovadas. */
export const progressoSpec = (spec: Spec) => Math.round((spec.fases.filter((f) => f.estado === 'aprovada').length / spec.fases.length) * 100);

@Component({
  selector: 'app-especificacoes-lista',
  imports: [RouterLink, PageHeader, StatusTag, Button, Card, ProgressBar, Tag],
  template: `
    <app-page-header titulo="Especificações" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: 'Especificações' }]">
      <p-button [label]="visao() === 'quadro' ? 'Ver lista' : 'Ver quadro'" [icon]="visao() === 'quadro' ? 'pi pi-list' : 'pi pi-table'" [outlined]="true" (onClick)="alternar()" />
      <p-button label="Nova especificação" routerLink="/projetos/especificacoes/nova" />
    </app-page-header>

    @if (specs() === null) {
      <p-card><p class="mudo">Carregando…</p></p-card>
    } @else if (visao() === 'quadro') {
      <div class="quadro">
        @for (coluna of colunas(); track coluna.id) {
          <section class="coluna">
            <header>
              <span class="rotulo">{{ coluna.nome }}</span>
              <p-tag [value]="'' + coluna.specs.length" severity="secondary" />
            </header>
            @for (spec of coluna.specs; track spec.id) {
              <a class="cartao" [routerLink]="['/projetos/especificacoes', spec.id]" [queryParams]="{ origem: 'lista' }">
                <strong>{{ spec.titulo }}</strong>
                <small class="mudo">{{ spec.projeto }}</small>
                <span class="selos"><app-status-tag [status]="spec.status" /><p-tag [value]="'v' + spec.versao" severity="secondary" [rounded]="true" /></span>
                <p-progressbar [value]="progresso(spec)" [showValue]="false" [style]="{ height: '6px' }" />
              </a>
            } @empty {
              <p class="vazio">Nenhuma especificação nesta fase.</p>
            }
          </section>
        }
      </div>
    } @else {
      @if (specs()!.length === 0) {
        <p-card><p class="vazio">Nenhuma especificação ainda. Crie a primeira para acompanhar o andamento por aqui.</p></p-card>
      }
      <div class="grade">
        @for (spec of specs(); track spec.id) {
          <p-card>
            <ng-template #title>
              <span class="titulo">{{ spec.titulo }} <app-status-tag [status]="spec.status" /></span>
            </ng-template>
            <ng-template #subtitle>{{ spec.projeto }} · v{{ spec.versao }} · {{ spec.autor }}</ng-template>
            <p class="resumo">{{ spec.promptInicial }}</p>
            <p-progressbar [value]="progresso(spec)" [showValue]="false" [style]="{ height: '6px' }" />
            <div class="rodape">
              <small class="mudo">{{ spec.artefatos.length }} artefatos · {{ spec.tasks.length }} tarefas</small>
              <small class="mudo">{{ spec.atualizadoEm }}</small>
            </div>
            <p-button label="Abrir no produto" icon="pi pi-arrow-up-right" [outlined]="true" [fluid]="true" [routerLink]="['/projetos/especificacoes', spec.id]" [queryParams]="{ origem: 'lista' }" />
          </p-card>
        }
      </div>
    }
  `,
  styles: [
    `
      .quadro {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .coluna {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 14rem;
        padding: 0.625rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
      }
      .coluna header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.25rem;
      }
      .rotulo {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--p-text-muted-color);
      }
      .cartao {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
        color: inherit;
        text-decoration: none;
      }
      .cartao:hover {
        border-color: var(--p-primary-color);
      }
      .selos {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
      .grade {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
        gap: 0.75rem;
      }
      .titulo {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .resumo {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: var(--p-text-muted-color);
      }
      .rodape {
        display: flex;
        justify-content: space-between;
        margin: 0.75rem 0;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .vazio {
        padding: 1.5rem 0.25rem;
        text-align: center;
        color: var(--p-text-muted-color);
        font-size: 0.8125rem;
      }
      @media (max-width: 1100px) {
        .quadro {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
})
export class EspecificacoesListaPage {
  protected readonly specs = carregar(() => listarSpecs());
  protected readonly visao = signal<'quadro' | 'lista'>('quadro');
  protected progresso = progressoSpec;

  /** Cada especificação fica na coluna da primeira fase ainda não aprovada. */
  protected readonly colunas = computed(() => {
    const specs = this.specs() ?? [];
    return ORDEM_FASES.map((faseId) => ({
      id: faseId,
      nome: specs.flatMap((s) => s.fases).find((f) => f.id === faseId)?.nome ?? faseId,
      specs: specs.filter((spec) => (spec.fases.find((f) => f.estado !== 'aprovada')?.id ?? 'validacao') === faseId),
    }));
  });

  protected alternar(): void {
    this.visao.update((v) => (v === 'quadro' ? 'lista' : 'quadro'));
  }
}
