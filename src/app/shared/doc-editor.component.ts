import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Popover } from 'primeng/popover';
import { Tag } from 'primeng/tag';

import { BlocoEditor } from './bloco-editor.component';
import type { DocBloco, DocVersao, DocumentoWorkspace } from '@/types/workspace';

const ICONES = ['📄', '📘', '🧩', '⚙️', '🗂️', '🧠', '🔌', '📊', '✅', '🚀'];

function relativo(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

type LinhaDiff = { estado: 'igual' | 'adicionado' | 'removido'; antes: string; depois: string };

/**
 * Alinha duas versões pelo texto dos blocos, como um diff de código, pela maior subsequência
 * comum: um parágrafo que só mudou de lugar não vira remoção seguida de inclusão.
 */
function diferenca(anterior: DocBloco[], atual: DocBloco[]): LinhaDiff[] {
  const a = anterior.map((b) => b.texto);
  const b = atual.map((x) => x.texto);
  const tabela: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      tabela[i]![j] = a[i] === b[j] ? tabela[i + 1]![j + 1]! + 1 : Math.max(tabela[i + 1]![j]!, tabela[i]![j + 1]!);
    }
  }
  const linhas: LinhaDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      linhas.push({ estado: 'igual', antes: a[i]!, depois: b[j]! });
      i += 1;
      j += 1;
    } else if (tabela[i + 1]![j]! >= tabela[i]![j + 1]!) {
      linhas.push({ estado: 'removido', antes: a[i]!, depois: '' });
      i += 1;
    } else {
      linhas.push({ estado: 'adicionado', antes: '', depois: b[j]! });
      j += 1;
    }
  }
  while (i < a.length) linhas.push({ estado: 'removido', antes: a[i++]!, depois: '' });
  while (j < b.length) linhas.push({ estado: 'adicionado', antes: '', depois: b[j++]! });
  return linhas;
}

/** Página aberta para leitura e edição, com salvamento automático. */
@Component({
  selector: 'app-doc-editor',
  imports: [FormsModule, BlocoEditor, Button, Dialog, Popover, Tag],
  template: `
    <div class="cartao">
      <div class="barra">
        <p-tag [value]="documento().ambiente === 'oficial' ? 'Oficial' : 'Rascunho'" [severity]="documento().ambiente === 'oficial' ? 'success' : 'secondary'" />
        <span class="estado">
          @if (salvando()) { <i class="pi pi-spin pi-spinner"></i> Salvando… } @else { <i class="pi pi-check ok"></i> Salvo {{ relativo(salvoEm()) }} }
        </span>
        <div class="direita">
          <p-button [label]="'Versões (' + documento().versoes.length + ')'" icon="pi pi-history" [text]="true" size="small" (onClick)="versoes.toggle($event)" />
          <p-button label="Publicar na Wiki" icon="pi pi-cloud-upload" size="small" [disabled]="documento().ambiente === 'oficial' || salvando()" (onClick)="publicar.emit()" />
        </div>
      </div>

      <div class="corpo">
        <div class="pagina">
          <div class="titulo-linha">
            <button type="button" class="icone" aria-label="Alterar ícone da página" (click)="icones.toggle($event)">{{ icone() }}</button>
            <input class="titulo" placeholder="Página sem título" aria-label="Título da página" [ngModel]="titulo()" (ngModelChange)="titulo.set($event)" />
          </div>
          <app-bloco-editor [conteudo]="documento().blocos" (mudou)="blocos.set($event)" />
        </div>
      </div>
    </div>

    <p-popover #icones>
      <div class="emojis">
        @for (e of emojis; track e) { <button type="button" (click)="icone.set(e); icones.hide()">{{ e }}</button> }
      </div>
    </p-popover>

    <p-popover #versoes>
      <div class="versoes">
        @if (documento().versoes.length === 0) {
          <p class="mudo">Nenhuma versão anterior. Uma nova entra a cada publicação na wiki.</p>
        } @else {
          @for (v of documento().versoes; track v.versao + v.atualizadoEm) {
            <button type="button" class="versao" [title]="'Publicada em ' + relativo(v.atualizadoEm)" (click)="abrirVersao(v); versoes.hide()">
              <strong>v{{ v.versao }}</strong><span class="mudo">{{ v.autor }}</span>
            </button>
          }
        }
      </div>
    </p-popover>

    <p-dialog [header]="documento().titulo + ' — v' + (versaoAberta()?.versao ?? '')" [visible]="!!versaoAberta()" (visibleChange)="!$event && versaoAberta.set(null)" [modal]="true" [style]="{ width: '56rem', maxWidth: '95vw' }">
      @if (versaoAberta(); as v) {
        @if (anteriorDe(v); as ant) {
          <p class="mudo">Comparada com a v{{ ant.versao }}, de {{ relativo(ant.atualizadoEm) }}. Só leitura: abrir uma versão não altera a página atual.</p>
          <div class="diff">
            <div class="diff-cab"><span>v{{ ant.versao }}</span><span>v{{ v.versao }}</span></div>
            @for (l of diferenca(ant.blocos, v.blocos); track $index) {
              <div class="diff-linha">
                <span [class.removido]="l.estado === 'removido'">{{ l.antes }}</span>
                <span [class.adicionado]="l.estado === 'adicionado'">{{ l.depois }}</span>
              </div>
            }
          </div>
        } @else {
          <p class="mudo">Primeira versão da página: não há nada antes para comparar.</p>
          @for (b of v.blocos; track $index) { <p class="mudo">{{ b.texto }}</p> }
        }
      }
    </p-dialog>
  `,
  styles: [
    `
      .cartao {
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
      }
      .barra {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--p-content-border-color);
      }
      .estado {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
      }
      .ok {
        color: var(--p-green-500);
      }
      .direita {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
      }
      .corpo {
        padding: 1.5rem 0.5rem;
      }
      .pagina {
        max-width: 50rem;
        margin: 0 auto;
      }
      .titulo-linha {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0 2.5rem;
        margin-bottom: 0.75rem;
      }
      .icone {
        padding: 0 0.25rem;
        border: 0;
        border-radius: 8px;
        background: transparent;
        font-size: 1.875rem;
        cursor: pointer;
      }
      .icone:hover {
        background: var(--p-content-hover-background);
      }
      .titulo {
        width: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 1.875rem;
        font-weight: 700;
      }
      .titulo::placeholder {
        color: var(--p-text-muted-color);
        opacity: 0.6;
      }
      .emojis {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.25rem;
      }
      .emojis button {
        padding: 0.375rem;
        border: 0;
        border-radius: 6px;
        background: transparent;
        font-size: 1.25rem;
        cursor: pointer;
      }
      .emojis button:hover {
        background: var(--p-content-hover-background);
      }
      .versoes {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        width: 16rem;
      }
      .versao {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.375rem 0.5rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }
      .versao:hover {
        border-color: var(--p-primary-color);
        background: var(--p-content-hover-background);
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .diff {
        border: 1px solid var(--p-content-border-color);
        border-radius: 8px;
        overflow: hidden;
      }
      .diff-cab,
      .diff-linha {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid var(--p-content-border-color);
      }
      .diff-cab {
        background: var(--p-content-hover-background);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--p-text-muted-color);
      }
      .diff-linha:last-child {
        border-bottom: 0;
      }
      .diff-cab span,
      .diff-linha span {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        white-space: pre-wrap;
      }
      .diff-cab span:first-child,
      .diff-linha span:first-child {
        border-right: 1px solid var(--p-content-border-color);
      }
      .removido {
        background: color-mix(in srgb, var(--p-red-500) 14%, transparent);
        color: var(--p-red-600);
      }
      .removido::before {
        content: '− ';
        font-family: monospace;
      }
      .adicionado {
        background: color-mix(in srgb, var(--p-green-500) 14%, transparent);
        color: var(--p-green-700);
      }
      .adicionado::before {
        content: '+ ';
        font-family: monospace;
      }
    `,
  ],
})
export class DocEditor {
  readonly documento = input.required<DocumentoWorkspace>();
  /** Muda título, ícone ou blocos: o explorador decide se grava na página ou abre um rascunho. */
  readonly salvar = output<{ titulo: string; icone: string; blocos: DocBloco[] }>();
  readonly publicar = output<void>();

  protected readonly emojis = ICONES;
  protected readonly titulo = signal('');
  protected readonly icone = signal('📄');
  protected readonly blocos = signal<DocBloco[]>([]);
  protected readonly salvando = signal(false);
  protected readonly salvoEm = signal(new Date().toISOString());
  protected readonly versaoAberta = signal<DocVersao | null>(null);

  protected relativo = relativo;
  protected diferenca = diferenca;

  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Impede que abrir a página já conte como edição. */
  private pronto = false;

  constructor() {
    // Trocar de página (ou a página mudar por fora) recomeça o editor do que está gravado nela.
    effect(() => {
      const doc = this.documento();
      this.pronto = false;
      clearTimeout(this.timer);
      this.salvando.set(false);
      this.titulo.set(doc.titulo);
      this.icone.set(doc.icone);
      this.blocos.set(doc.blocos);
      this.salvoEm.set(doc.atualizadoEm);
      setTimeout(() => (this.pronto = true));
    });
    // Salvamento automático, 600 ms depois da última edição.
    effect(() => {
      const t = this.titulo();
      const i = this.icone();
      const b = this.blocos();
      if (!this.pronto) return;
      this.salvando.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.salvar.emit({ titulo: t, icone: i, blocos: b });
        this.salvoEm.set(new Date().toISOString());
        this.salvando.set(false);
      }, 600);
    });
  }

  /** A versão imediatamente anterior: a lista vem da mais nova para a mais antiga. */
  protected anteriorDe(v: DocVersao): DocVersao | undefined {
    const versoes = this.documento().versoes;
    return versoes[versoes.findIndex((x) => x.versao === v.versao) + 1];
  }

  protected abrirVersao(v: DocVersao): void {
    this.versaoAberta.set(v);
  }
}
