import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';

import { carregarRecarregavel } from '../../../core/carregar';
import { PageHeader } from '../../../layout/page-header.component';
import { StatusTag } from '../../../shared/status-tag.component';
import { atualizarProjeto, listarProjetos } from '@/lib/projeto-store';
import type { Projeto } from '@/types';

/** Abre mostrando só o que está em uso: inativar é tirar o produto de circulação. */
const PADRAO = ['Ativo'];

const caminhoGitlab = (nome: string) =>
  'codigo.dev.tools.go.gov.br/smart/' +
  nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

@Component({
  selector: 'app-produtos-listagem',
  imports: [FormsModule, RouterLink, PageHeader, StatusTag, Button, Card, ConfirmDialog, InputText, MultiSelect, TableModule, Tooltip],
  providers: [ConfirmationService],
  template: `
    <app-page-header titulo="Produtos" [trilha]="[{ label: 'Produtos' }]">
      <p-button label="Novo produto" routerLink="/projetos/novo" />
    </app-page-header>

    <div class="blocos">
      <p-card>
        <form class="filtros" (ngSubmit)="filtrar()">
          <div class="campo">
            <label for="filtro-nome">Nome</label>
            <input pInputText id="filtro-nome" name="nome" placeholder="Buscar por nome" [(ngModel)]="nome" [fluid]="true" />
          </div>
          <div class="campo">
            <label for="filtro-status">Status</label>
            <p-multiselect
              inputId="filtro-status"
              name="status"
              [options]="opcoesStatus"
              [(ngModel)]="statusEscolhido"
              placeholder="Todos"
              display="chip"
              [showToggleAll]="false"
              [filter]="false"
              [fluid]="true"
            />
          </div>
          <div class="botoes">
            <p-button type="button" label="Limpar" [outlined]="true" (onClick)="limpar()" />
            <p-button type="submit" label="Filtrar" />
          </div>
        </form>
      </p-card>

      <p-card>
        <p-table
          [value]="filtrados()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [showFirstLastIcon]="true"
          [rowHover]="true"
          [loading]="lista.dado() === null"
          [tableStyle]="{ 'min-width': '40rem' }"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="nome">Produto <p-sortIcon field="nome" /></th>
              <th pSortableColumn="ativo" style="width: 9rem">Status <p-sortIcon field="ativo" /></th>
              <th style="width: 9rem">Ações</th>
            </tr>
          </ng-template>

          <ng-template #body let-produto>
            <tr class="linha" (click)="abrir(produto)">
              <td>
                <div class="produto">
                  <span class="nome">{{ produto.nome }}</span>
                  <span class="caminho">{{ caminho(produto.nome) }}</span>
                </div>
              </td>
              <td><app-status-tag [status]="produto.ativo" /></td>
              <td>
                <div class="acoes" (click)="$event.stopPropagation()">
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" pTooltip="Editar produto" tooltipPosition="top" ariaLabel="Editar produto" (onClick)="editar(produto)" />
                  <p-button icon="pi pi-eye" [text]="true" severity="secondary" pTooltip="Abrir produto" tooltipPosition="top" ariaLabel="Abrir produto" (onClick)="abrir(produto)" />
                  @if (produto.ativo === 'Ativo') {
                    <p-button icon="pi pi-ban" [text]="true" severity="danger" pTooltip="Inativar produto" tooltipPosition="top" ariaLabel="Inativar produto" (onClick)="confirmarInativar(produto)" />
                  } @else {
                    <p-button icon="pi pi-power-off" [text]="true" severity="secondary" pTooltip="Ativar produto" tooltipPosition="top" ariaLabel="Ativar produto" (onClick)="definirAtivo(produto, 'Ativo')" />
                  }
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="3" class="vazio">
                {{ filtrosAtivos() > 0 ? 'Nenhum produto corresponde aos filtros aplicados.' : 'Nenhum produto cadastrado.' }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-confirmdialog />
  `,
  styles: [
    `
      .blocos {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .filtros {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        align-items: end;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .botoes {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .linha {
        cursor: pointer;
      }
      .produto {
        display: flex;
        flex-direction: column;
      }
      .nome {
        font-weight: 500;
      }
      .caminho {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
      .acoes {
        display: flex;
      }
      .vazio {
        padding: 2.5rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class ProdutosListagemPage {
  private readonly router = inject(Router);
  private readonly confirmacao = inject(ConfirmationService);
  private readonly mensagens = inject(MessageService);

  protected readonly lista = carregarRecarregavel(() => listarProjetos());

  protected readonly opcoesStatus = ['Ativo', 'Inativo'];

  /** O que está nos campos; só vira filtro quando se clica em "Filtrar". */
  protected nome = '';
  protected statusEscolhido: string[] = [...PADRAO];

  private readonly aplicado = signal({ nome: '', status: [...PADRAO] });

  protected readonly filtrados = computed(() => {
    const { nome, status } = this.aplicado();
    const texto = nome.trim().toLowerCase();
    return (this.lista.dado() ?? []).filter(
      (projeto) => (status.length === 0 || status.includes(projeto.ativo)) && (!texto || projeto.nome.toLowerCase().includes(texto)),
    );
  });

  /** Só o que difere do estado inicial conta como filtro aplicado. */
  protected readonly filtrosAtivos = computed(() => {
    const { nome, status } = this.aplicado();
    const igualAoPadrao = status.length === PADRAO.length && status.every((item) => PADRAO.includes(item));
    return (nome.trim().length > 0 ? 1 : 0) + (igualAoPadrao ? 0 : 1);
  });

  protected caminho = caminhoGitlab;

  filtrar(): void {
    this.aplicado.set({ nome: this.nome, status: [...this.statusEscolhido] });
  }

  limpar(): void {
    this.nome = '';
    this.statusEscolhido = [...PADRAO];
    this.filtrar();
  }

  abrir(produto: Projeto): void {
    void this.router.navigate(['/projetos', produto.id]);
  }

  editar(produto: Projeto): void {
    void this.router.navigate(['/projetos/editar', produto.id]);
  }

  confirmarInativar(produto: Projeto): void {
    this.confirmacao.confirm({
      header: `Inativar ${produto.nome}?`,
      message:
        'O produto sai de circulação e passa a aparecer como inativo na listagem. A documentação, as especificações e o histórico continuam onde estão, e você pode reativá-lo depois pela mesma linha.',
      acceptLabel: 'Inativar produto',
      rejectLabel: 'Manter ativo',
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => void this.definirAtivo(produto, 'Inativo'),
    });
  }

  async definirAtivo(produto: Projeto, proximo: Projeto['ativo']): Promise<void> {
    await atualizarProjeto(produto.id, { ativo: proximo });
    await this.lista.recarregar();
    this.mensagens.add({
      severity: 'success',
      summary: proximo === 'Inativo' ? `${produto.nome} foi inativado` : `${produto.nome} voltou a ficar ativo`,
    });
  }
}
