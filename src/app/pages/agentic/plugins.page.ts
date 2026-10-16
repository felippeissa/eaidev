import { Component, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { FiltroProduto, TODOS_OS_PRODUTOS } from '../../shared/filtro-produto.component';
import { StatusTag } from '../../shared/status-tag.component';
import { plugins } from '@/mocks/agentic';
import type { Plugin } from '@/types';

@Component({
  selector: 'app-plugins',
  imports: [PageHeader, StatusTag, FiltroProduto, Avatar, Button, Card, Tag],
  template: `
    <app-page-header titulo="Extensões" [trilha]="[{ label: 'Ferramentas de agentes' }, { label: 'Extensões' }]" />

    <p-card>
      <div class="filtro"><app-filtro-produto [valor]="produto()" (valorChange)="produto.set($event)" /></div>
    </p-card>

    <div class="grade">
      @for (p of dados() ?? []; track p.id) {
        <p-card>
          <ng-template #header>
            <div class="topo"><p-avatar icon="pi pi-th-large" shape="square" size="large" /><app-status-tag [status]="p.status" /></div>
          </ng-template>
          <ng-template #title>{{ p.nome }}</ng-template>
          <ng-template #subtitle>{{ p.descricao }}</ng-template>
          <small class="mudo">{{ p.autor }} · versão <code>{{ p.versao }}</code></small>
          <strong class="rotulo">Permissões</strong>
          <div class="chips">@for (permissao of p.permissoes; track permissao) { <p-tag [value]="permissao" severity="secondary" /> }</div>
          <ng-template #footer>
            <div class="acoes">
              <p-button [label]="p.status === 'Instalado' ? 'Desativar' : 'Instalar'" [outlined]="p.status === 'Instalado'" (onClick)="acao(p)" />
              <p-button label="Detalhes" [text]="true" severity="secondary" (onClick)="detalhes()" />
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
      .rotulo {
        display: block;
        margin: 0.75rem 0 0.375rem;
        font-size: 0.8125rem;
      }
      .chips,
      .acoes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
      .acoes {
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
export class PluginsPage {
  private readonly mensagens = inject(MessageService);

  /**
   * O filtro de Produto aparece, mas ainda não filtra: o vínculo entre extensões e Produtos
   * não está definido nos requisitos. Quando estiver, filtrar aqui por `p.produtoId`.
   */
  protected readonly produto = signal(TODOS_OS_PRODUTOS);
  protected readonly dados = carregar(() => atraso(plugins));

  protected acao(p: Plugin): void {
    this.mensagens.add({ severity: 'info', summary: 'Ação simulada no protótipo', detail: p.status === 'Instalado' ? `${p.nome} seria desativada.` : `${p.nome} seria instalada.` });
  }

  protected detalhes(): void {
    this.mensagens.add({ severity: 'info', summary: 'Em breve', detail: 'A tela de detalhes da extensão ainda está em construção.' });
  }
}
