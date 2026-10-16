import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { selfServiceAcoes } from '@/mocks/data';
import type { SelfServiceAcao } from '@/types';

@Component({
  selector: 'app-self-service',
  imports: [FormsModule, PageHeader, Button, Card, Dialog, InputText, Select, Tag, Textarea],
  template: `
    <app-page-header titulo="Autoatendimento" [trilha]="[{ label: 'Autoatendimento' }]" />

    <div class="grade">
      @for (a of acoes() ?? []; track a.id) {
        <p-card>
          <ng-template #title><span class="titulo"><span><i class="pi pi-send"></i> {{ a.nome }}</span><p-tag [value]="a.categoria" severity="secondary" /></span></ng-template>
          <ng-template #subtitle>{{ a.descricao }}</ng-template>
          <div class="meta">
            <span><i class="pi pi-stopwatch"></i> {{ a.tempoMedio }}</span>
            <span><i class="pi pi-shield"></i> {{ a.aprovacao ? 'Requer aprovação' : 'Aprovação automática' }}</span>
          </div>
          <ng-template #footer><p-button label="Solicitar" [fluid]="true" (onClick)="abrir(a)" /></ng-template>
        </p-card>
      }
    </div>

    <p-dialog [header]="aberta()?.nome ?? ''" [visible]="!!aberta()" (visibleChange)="!$event && aberta.set(null)" [modal]="true" [style]="{ width: '30rem' }">
      @if (aberta(); as a) {
        <p class="mudo">{{ a.descricao }}</p>
        <div class="form">
          <div class="campo">
            <label for="identificador">Identificador</label>
            <input pInputText id="identificador" placeholder="ex.: pagamentos-core" [(ngModel)]="identificador" [fluid]="true" />
          </div>
          <div class="campo">
            <label for="ambiente">Ambiente</label>
            <p-select inputId="ambiente" [options]="ambientes" [(ngModel)]="ambiente" [fluid]="true" appendTo="body" />
          </div>
          <div class="campo">
            <label for="justificativa">Justificativa</label>
            <textarea pTextarea id="justificativa" rows="3" placeholder="Descreva a necessidade" [(ngModel)]="justificativa" [fluid]="true"></textarea>
          </div>
        </div>
      }
      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="aberta.set(null)" />
        <p-button label="Enviar solicitação" [disabled]="!identificador.trim()" (onClick)="enviar()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .grade {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
        gap: 1rem;
      }
      .titulo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
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
      .mudo {
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class SelfServicePage {
  private readonly mensagens = inject(MessageService);

  protected readonly acoes = carregar(() => atraso(selfServiceAcoes));
  protected readonly aberta = signal<SelfServiceAcao | null>(null);
  protected readonly ambientes = ['Desenvolvimento', 'Homologação', 'Produção'];
  protected identificador = '';
  protected ambiente = 'Homologação';
  protected justificativa = '';

  protected abrir(a: SelfServiceAcao): void {
    this.identificador = '';
    this.ambiente = 'Homologação';
    this.justificativa = '';
    this.aberta.set(a);
  }

  protected enviar(): void {
    const a = this.aberta();
    if (!a) return;
    this.mensagens.add({ severity: 'success', summary: 'Solicitação registrada', detail: `"${a.nome}" entrou na fila de atendimento.` });
    this.aberta.set(null);
  }
}
