import { Component, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { FiltroProduto, TODOS_OS_PRODUTOS } from '../../shared/filtro-produto.component';
import { StatusTag } from '../../shared/status-tag.component';
import { skills } from '@/mocks/agentic';
import type { Skill } from '@/types';

@Component({
  selector: 'app-skills',
  imports: [PageHeader, StatusTag, FiltroProduto, Avatar, Button, Card],
  template: `
    <app-page-header titulo="Habilidades" [trilha]="[{ label: 'Ferramentas de agentes' }, { label: 'Habilidades' }]">
      <p-button label="Nova habilidade" (onClick)="emBreve('A criação de habilidades ainda está em construção.')" />
    </app-page-header>

    <p-card>
      <div class="filtro"><app-filtro-produto [valor]="produto()" (valorChange)="produto.set($event)" /></div>
    </p-card>

    <div class="grade">
      @for (s of dados() ?? []; track s.id) {
        <p-card>
          <ng-template #header>
            <div class="topo"><p-avatar icon="pi pi-sparkles" shape="square" size="large" /><app-status-tag [status]="s.status" /></div>
          </ng-template>
          <ng-template #title>{{ s.nome }}</ng-template>
          <ng-template #subtitle>{{ s.descricao }}</ng-template>
          <p class="mudo gatilho">Gatilho: <span class="texto">{{ s.gatilho }}</span></p>
          @for (arquivo of s.arquivos; track arquivo) {
            <p class="arquivo"><i class="pi pi-file"></i> {{ arquivo }}</p>
          }
          <small class="mudo">{{ s.usos }} usos nos últimos 30 dias</small>
          <ng-template #footer>
            <div class="acoes">
              <p-button label="Editar" [outlined]="true" (onClick)="emBreve('A edição de &quot;' + s.nome + '&quot; ainda está em construção.')" />
              <p-button [label]="s.status === 'Ativa' ? 'Desativar' : 'Publicar'" [text]="true" severity="secondary" (onClick)="acao(s)" />
            </div>
          </ng-template>
        </p-card>
      }
    </div>
  `,
  styles: [
    `
      .filtro {
        max-width: 24rem;
      }
      .grade {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .topo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem 1rem 0;
      }
      .gatilho {
        margin: 0 0 0.5rem;
        font-size: 0.8125rem;
      }
      .texto {
        color: var(--p-text-color);
      }
      .arquivo {
        margin: 0.25rem 0;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
      .acoes {
        display: flex;
        gap: 0.5rem;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      @media (max-width: 900px) {
        .grade {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SkillsPage {
  private readonly mensagens = inject(MessageService);

  /** Aparece, mas ainda não filtra: o vínculo entre habilidades e Produtos não está definido. */
  protected readonly produto = signal(TODOS_OS_PRODUTOS);
  protected readonly dados = carregar(() => atraso(skills));

  protected emBreve(detalhe: string): void {
    this.mensagens.add({ severity: 'info', summary: 'Em breve', detail: detalhe });
  }

  protected acao(s: Skill): void {
    this.mensagens.add({ severity: 'info', summary: 'Ação simulada no protótipo', detail: s.status === 'Ativa' ? `"${s.nome}" seria desativada.` : `"${s.nome}" seria publicada.` });
  }
}
