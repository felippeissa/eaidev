import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { carregar, carregarRecarregavel } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatusTag } from '../../shared/status-tag.component';
import { listarProjetos } from '@/lib/projeto-store';
import { atualizarUsuario, convidarUsuario, listarUsuarios } from '@/lib/usuario-store';
import type { Usuario } from '@/types';

/** O que cada nível permite. */
const PERFIS = [
  { valor: 'Administrador', descricao: 'Acesso total, incluindo gestão de usuários e integrações.' },
  { valor: 'Gestor', descricao: 'Acompanha produtos e aprova mudanças, sem alterar configurações.' },
  { valor: 'Desenvolvedor', descricao: 'Cria e edita especificações e documentação dos seus produtos.' },
  { valor: 'Leitor', descricao: 'Consulta produtos e documentação, sem editar nada.' },
] as const;

const SITUACOES = ['Ativo', 'Inativo'] as const;

const ordenar = (lista: string[]) => [...new Set(lista)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const iniciais = (nome: string) =>
  nome
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('');

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, PageHeader, StatusTag, Avatar, Button, Card, Dialog, IconField, InputIcon, InputText, MultiSelect, Select, TableModule, Tag, Tooltip],
  template: `
    <app-page-header titulo="Usuários" [trilha]="[{ label: 'Usuários' }]">
      <p-button label="Novo usuário" icon="pi pi-user-plus" (onClick)="abrirConvite()" />
    </app-page-header>

    <p-card>
      <form class="filtros" (ngSubmit)="filtrar()">
        <div class="campo">
          <label for="f-busca">Busca</label>
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input pInputText id="f-busca" name="busca" type="text" placeholder="Buscar por nome, e-mail ou produto" [(ngModel)]="rascunho.busca" [fluid]="true" />
          </p-iconfield>
        </div>
        <div class="campo">
          <label for="f-produto">Produto</label>
          <p-multiselect inputId="f-produto" name="times" [options]="opcoes().times" [(ngModel)]="rascunho.times" placeholder="Todos" [filter]="true" filterPlaceholder="Buscar produto" [showToggleAll]="false" display="chip" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="f-perfil">Perfil</label>
          <p-multiselect inputId="f-perfil" name="perfis" [options]="opcoes().perfis" [(ngModel)]="rascunho.perfis" placeholder="Todos" [showToggleAll]="false" display="chip" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="f-situacao">Status</label>
          <p-multiselect inputId="f-situacao" name="situacoes" [options]="opcoes().situacoes" [(ngModel)]="rascunho.situacoes" placeholder="Todas" [showToggleAll]="false" display="chip" [fluid]="true" />
        </div>
        <div class="botoes">
          <p-button type="button" label="Limpar" [outlined]="true" (onClick)="limparTudo()" />
          <p-button type="submit" label="Filtrar" />
        </div>
      </form>
    </p-card>

    <p-card styleClass="bloco">
      <p-table [value]="filtrados()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [rowHover]="true" [loading]="lista.dado() === null" [tableStyle]="{ 'min-width': '52rem' }">
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">Usuário <p-sortIcon field="nome" /></th>
            <th>Produtos</th>
            <th pSortableColumn="perfil">Perfil <p-sortIcon field="perfil" /></th>
            <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
            <th style="width: 7rem"><span class="so-leitor">Ações</span></th>
          </tr>
        </ng-template>
        <ng-template #body let-u>
          <tr>
            <td>
              <div class="pessoa">
                <p-avatar [label]="iniciais(u.nome)" shape="circle" />
                <div><strong>{{ u.nome }}</strong><br /><small class="mudo">{{ u.email }}</small></div>
              </div>
            </td>
            <td><div class="chips">@for (t of u.times; track t) { <p-tag [value]="t" severity="secondary" /> }</div></td>
            <td><p-tag [value]="u.perfil" [severity]="u.perfil === 'Administrador' ? 'contrast' : 'secondary'" /></td>
            <td><app-status-tag [status]="u.status" /></td>
            <td>
              <div class="acoes">
                <p-button icon="pi pi-pencil" [text]="true" severity="secondary" pTooltip="Editar usuário" tooltipPosition="top" ariaLabel="Editar usuário" (onClick)="abrirEdicao(u)" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="5" class="vazio">{{ filtrosAtivos() > 0 || busca() ? 'Nenhum usuário corresponde aos filtros aplicados.' : 'Nenhum usuário cadastrado. Use “Novo usuário” para convidar o primeiro.' }}</td></tr>
        </ng-template>
      </p-table>
    </p-card>

    <p-dialog header="Novo usuário" [(visible)]="conviteAberto" [modal]="true" [style]="{ width: '30rem' }">
      <p class="mudo">O acesso é liberado após confirmação do e-mail corporativo.</p>
      <form class="form" (ngSubmit)="convite.nome.trim() && convite.email.trim() && convidar()">
        <div class="campo">
          <label for="c-nome">Nome completo <span class="obrig">*</span></label>
          <input pInputText id="c-nome" name="nome" placeholder="Digite o nome e o sobrenome" required [(ngModel)]="convite.nome" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="c-email">E-mail corporativo <span class="obrig">*</span></label>
          <input pInputText id="c-email" name="email" type="email" placeholder="nome@go.gov.br" required [(ngModel)]="convite.email" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="c-times">Produtos</label>
          <p-multiselect inputId="c-times" name="times" [options]="opcoes().times" [(ngModel)]="convite.times" placeholder="Selecione um ou mais produtos" [filter]="true" filterPlaceholder="Buscar produto" [showToggleAll]="false" display="chip" [fluid]="true" appendTo="body" />
        </div>
        <div class="campo">
          <label for="c-perfil">Perfil de acesso <span class="obrig">*</span></label>
          <p-select inputId="c-perfil" name="perfil" [options]="perfisOpcoes" optionLabel="valor" optionValue="valor" [(ngModel)]="convite.perfil" [fluid]="true" appendTo="body" />
          <small class="mudo">{{ descricaoPerfil(convite.perfil) }}</small>
        </div>
      </form>
      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="conviteAberto = false" />
        <p-button label="Enviar convite" (onClick)="convidar()" [disabled]="!convite.nome.trim() || !convite.email.trim()" />
      </ng-template>
    </p-dialog>

    <p-dialog header="Editar usuário" [visible]="!!emEdicao()" (visibleChange)="!$event && emEdicao.set(null)" [modal]="true" [style]="{ width: '34rem' }">
      <p class="mudo">As alterações valem a partir do próximo acesso da pessoa.</p>
      <form class="form" (ngSubmit)="edicao.nome.trim() && edicao.email.trim() && salvarEdicao()">
        <div class="campo">
          <label for="e-nome">Nome completo <span class="obrig">*</span></label>
          <input pInputText id="e-nome" name="nome" required [(ngModel)]="edicao.nome" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="e-email">E-mail corporativo <span class="obrig">*</span></label>
          <input pInputText id="e-email" name="email" type="email" required [(ngModel)]="edicao.email" [fluid]="true" />
        </div>
        <div class="campo">
          <label for="e-times">Produtos</label>
          <p-multiselect inputId="e-times" name="times" [options]="opcoes().times" [(ngModel)]="edicao.times" placeholder="Selecione um ou mais produtos" [filter]="true" filterPlaceholder="Buscar produto" [showToggleAll]="false" display="chip" [fluid]="true" appendTo="body" />
        </div>
        <div class="duas">
          <div class="campo">
            <label for="e-perfil">Perfil de acesso</label>
            <p-select inputId="e-perfil" name="perfil" [options]="perfisOpcoes" optionLabel="valor" optionValue="valor" [(ngModel)]="edicao.perfil" [fluid]="true" appendTo="body" />
          </div>
          <div class="campo">
            <label for="e-status">Status</label>
            <p-select inputId="e-status" name="status" [options]="situacoesOpcoes" [(ngModel)]="edicao.status" [fluid]="true" appendTo="body" />
          </div>
        </div>
      </form>
      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="emEdicao.set(null)" />
        <p-button label="Salvar alterações" (onClick)="salvarEdicao()" [disabled]="!edicao.nome.trim() || !edicao.email.trim()" />
      </ng-template>
    </p-dialog>

  `,
  styles: [
    `
      /* Mesmo desenho dos filtros de Produtos: campos com rótulo em cima, Limpar e Filtrar abaixo. */
      .filtros {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
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
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .pessoa {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      .acoes {
        display: flex;
        justify-content: flex-end;
      }
      .so-leitor {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .duas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .obrig {
        color: var(--p-red-500);
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .vazio {
        padding: 2.5rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class UsuariosPage {
  private readonly mensagens = inject(MessageService);

  protected readonly lista = carregarRecarregavel(() => listarUsuarios());
  /** Produtos cadastrados: é a eles que uma pessoa se vincula. */
  private readonly produtos = carregar(() => listarProjetos());
  protected readonly perfisOpcoes = [...PERFIS];
  protected readonly situacoesOpcoes = [...SITUACOES];

  /** O que está nos campos; só vira filtro quando se clica em "Filtrar". */
  protected rascunho = { busca: '', times: [] as string[], perfis: [] as string[], situacoes: [] as string[] };
  private readonly aplicado = signal({ busca: '', times: [] as string[], perfis: [] as string[], situacoes: [] as string[] });
  protected readonly busca = computed(() => this.aplicado().busca);
  protected readonly times = computed(() => this.aplicado().times);
  protected readonly perfis = computed(() => this.aplicado().perfis);
  protected readonly situacoes = computed(() => this.aplicado().situacoes);

  /** Opções tiradas dos próprios dados: nada de lista fixa para sair do ar. */
  protected readonly opcoes = computed(() => {
    const todos = this.lista.dado() ?? [];
    return {
      times: ordenar([...(this.produtos() ?? []).map((p) => p.nome), ...todos.flatMap((u) => u.times)]),
      perfis: ordenar(todos.map((u) => u.perfil)),
      situacoes: ordenar(todos.map((u) => u.status)),
    };
  });

  /** Vários valores no mesmo campo somam (OU); campos diferentes se acumulam (E). */
  protected readonly filtrados = computed(() => {
    const texto = this.busca().trim().toLowerCase();
    return (this.lista.dado() ?? []).filter(
      (u) =>
        (this.times().length === 0 || u.times.some((t) => this.times().includes(t))) &&
        (this.perfis().length === 0 || this.perfis().includes(u.perfil)) &&
        (this.situacoes().length === 0 || this.situacoes().includes(u.status)) &&
        (!texto || `${u.nome} ${u.email} ${u.times.join(' ')} ${u.perfil}`.toLowerCase().includes(texto)),
    );
  });
  protected readonly filtrosAtivos = computed(() => this.times().length + this.perfis().length + this.situacoes().length);

  protected conviteAberto = false;
  protected convite = { nome: '', email: '', times: [] as string[], perfil: 'Desenvolvedor' as Usuario['perfil'] };

  protected readonly emEdicao = signal<Usuario | null>(null);
  protected edicao = { nome: '', email: '', times: [] as string[], perfil: 'Leitor' as Usuario['perfil'], status: 'Ativo' as Usuario['status'] };

  protected iniciais = iniciais;
  protected descricaoPerfil = (perfil: string) => PERFIS.find((p) => p.valor === perfil)?.descricao;

  protected filtrar(): void {
    const r = this.rascunho;
    this.aplicado.set({ busca: r.busca, times: [...r.times], perfis: [...r.perfis], situacoes: [...r.situacoes] });
  }

  protected limparTudo(): void {
    this.rascunho = { busca: '', times: [], perfis: [], situacoes: [] };
    this.filtrar();
  }

  protected abrirConvite(): void {
    this.convite = { nome: '', email: '', times: [], perfil: 'Desenvolvedor' };
    this.conviteAberto = true;
  }

  protected async convidar(): Promise<void> {
    const nome = this.convite.nome.trim();
    await convidarUsuario({ nome, email: this.convite.email.trim(), perfil: this.convite.perfil, times: this.convite.times });
    await this.lista.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Usuário convidado com sucesso', detail: `${nome} foi adicionado à plataforma.` });
    this.conviteAberto = false;
  }

  protected abrirEdicao(u: Usuario): void {
    this.edicao = { nome: u.nome, email: u.email, times: [...u.times], perfil: u.perfil, status: u.status };
    this.emEdicao.set(u);
  }

  protected async salvarEdicao(): Promise<void> {
    const alvo = this.emEdicao();
    if (!alvo) return;
    await atualizarUsuario(alvo.id, { ...this.edicao, nome: this.edicao.nome.trim(), email: this.edicao.email.trim() });
    await this.lista.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Usuário atualizado com sucesso', detail: 'As alterações valem a partir do próximo acesso da pessoa.' });
    this.emEdicao.set(null);
  }
}
