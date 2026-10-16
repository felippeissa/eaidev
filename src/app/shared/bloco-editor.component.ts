import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { novoBloco } from '@/lib/doc-store';
import type { DocBloco, DocBlocoTipo } from '@/types/workspace';

const TIPOS: { valor: DocBlocoTipo; rotulo: string }[] = [
  { valor: 'paragrafo', rotulo: 'Parágrafo' },
  { valor: 'h1', rotulo: 'Título 1' },
  { valor: 'h2', rotulo: 'Título 2' },
  { valor: 'h3', rotulo: 'Título 3' },
  { valor: 'lista', rotulo: 'Lista' },
  { valor: 'numerada', rotulo: 'Lista numerada' },
  { valor: 'checklist', rotulo: 'Lista de tarefas' },
  { valor: 'citacao', rotulo: 'Citação' },
  { valor: 'callout', rotulo: 'Destaque' },
  { valor: 'codigo', rotulo: 'Código' },
  { valor: 'tabela', rotulo: 'Tabela' },
  { valor: 'divisor', rotulo: 'Divisor' },
];

const PLACEHOLDER: Partial<Record<DocBlocoTipo, string>> = {
  paragrafo: 'Escreva aqui. Enter cria um novo bloco.',
  h1: 'Título 1',
  h2: 'Título 2',
  h3: 'Título 3',
  lista: 'Item da lista',
  numerada: 'Item da lista numerada',
  checklist: 'Tarefa',
  citacao: 'Citação',
  callout: 'Destaque',
  codigo: 'Cole ou escreva o código',
  tabela: '| Coluna | Coluna |\n| --- | --- |\n| valor | valor |',
};

/**
 * Editor de documentos em blocos: cada parágrafo, título, lista, citação, código ou tabela é um
 * bloco com o próprio tipo. Faz o papel do BlockNote da versão em React, sem depender dele.
 */
@Component({
  selector: 'app-bloco-editor',
  imports: [FormsModule, Button, Checkbox, InputText, Select, Textarea],
  template: `
    <div class="editor">
      @for (b of blocos(); track b.id; let i = $index) {
        <div class="bloco" [class]="'tipo-' + b.tipo">
          <div class="controles">
            <p-button icon="pi pi-plus" [text]="true" size="small" severity="secondary" ariaLabel="Adicionar bloco abaixo" (onClick)="inserir(i)" />
            <p-select class="tipo" [options]="tipos" optionLabel="rotulo" optionValue="valor" [ngModel]="b.tipo" (ngModelChange)="mudarTipo(i, $event)" size="small" appendTo="body" ariaLabel="Tipo do bloco" />
          </div>

          <div class="conteudo">
            @switch (b.tipo) {
              @case ('divisor') { <hr /> }
              @case ('checklist') {
                <div class="linha">
                  <p-checkbox [binary]="true" [ngModel]="!!b.marcado" (ngModelChange)="marcar(i, $event)" [ariaLabel]="'Marcar tarefa'" />
                  <textarea pTextarea [id]="'bloco-' + b.id" rows="1" [autoResize]="true" [class.riscado]="b.marcado" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea>
                </div>
              }
              @case ('lista') {
                <div class="linha"><span class="marca">•</span><textarea pTextarea [id]="'bloco-' + b.id" rows="1" [autoResize]="true" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea></div>
              }
              @case ('numerada') {
                <div class="linha"><span class="marca">{{ numero(i) }}.</span><textarea pTextarea [id]="'bloco-' + b.id" rows="1" [autoResize]="true" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea></div>
              }
              @case ('codigo') {
                <div class="codigo">
                  <input pInputText class="linguagem" size="small" placeholder="linguagem (ex.: ts, json)" aria-label="Linguagem do código" [ngModel]="b.linguagem ?? ''" (ngModelChange)="linguagem(i, $event)" />
                  <textarea pTextarea [id]="'bloco-' + b.id" rows="3" [autoResize]="true" class="mono" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea>
                </div>
              }
              @case ('tabela') {
                <textarea pTextarea [id]="'bloco-' + b.id" rows="4" [autoResize]="true" class="mono" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea>
              }
              @default {
                <textarea pTextarea [id]="'bloco-' + b.id" rows="1" [autoResize]="true" [placeholder]="placeholder(b.tipo)" [ngModel]="b.texto" (ngModelChange)="editar(i, $event)" (keydown)="teclar($event, i)" [fluid]="true"></textarea>
              }
            }
          </div>

          <div class="controles fim">
            <p-button icon="pi pi-arrow-up" [text]="true" size="small" severity="secondary" [disabled]="i === 0" ariaLabel="Mover bloco para cima" (onClick)="mover(i, -1)" />
            <p-button icon="pi pi-arrow-down" [text]="true" size="small" severity="secondary" [disabled]="i === blocos().length - 1" ariaLabel="Mover bloco para baixo" (onClick)="mover(i, 1)" />
            <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" ariaLabel="Excluir bloco" (onClick)="remover(i)" />
          </div>
        </div>
      }
      <p-button label="Adicionar bloco" icon="pi pi-plus" [text]="true" size="small" severity="secondary" (onClick)="inserir(blocos().length - 1)" />
    </div>
  `,
  styles: [
    `
      .editor {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .bloco {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: start;
        gap: 0.25rem;
        border-radius: 6px;
      }
      /* Os controles aparecem ao passar o mouse ou focar o bloco, para a página ler como texto corrido. */
      .controles {
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.12s;
      }
      .bloco:hover .controles,
      .bloco:focus-within .controles {
        opacity: 1;
      }
      .tipo {
        width: 8.5rem;
      }
      .conteudo textarea,
      .conteudo input.linguagem {
        border-color: transparent;
        box-shadow: none;
        background: transparent;
        resize: none;
      }
      .conteudo textarea:hover,
      .conteudo textarea:focus {
        border-color: var(--p-content-border-color);
      }
      .linha {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .linha .marca {
        padding-top: 0.5rem;
        min-width: 1.25rem;
        text-align: right;
        color: var(--p-text-muted-color);
      }
      .linha p-checkbox {
        padding-top: 0.625rem;
      }
      .riscado {
        text-decoration: line-through;
        color: var(--p-text-muted-color);
      }
      .tipo-h1 textarea {
        font-size: 1.875rem;
        font-weight: 700;
      }
      .tipo-h2 textarea {
        font-size: 1.5rem;
        font-weight: 600;
      }
      .tipo-h3 textarea {
        font-size: 1.25rem;
        font-weight: 600;
      }
      .tipo-citacao textarea {
        border-left: 3px solid var(--p-content-border-color);
        border-radius: 0;
        font-style: italic;
        color: var(--p-text-muted-color);
      }
      .tipo-callout textarea {
        background: var(--p-highlight-background);
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
      }
      .codigo {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        border-radius: 6px;
        background: var(--p-content-hover-background);
      }
      .codigo .linguagem {
        width: 12rem;
      }
      hr {
        margin: 0.75rem 0;
        border: 0;
        border-top: 1px solid var(--p-content-border-color);
      }
      @media (max-width: 800px) {
        .controles {
          opacity: 1;
        }
      }
    `,
  ],
})
export class BlocoEditor {
  /** Conteúdo de partida; o editor guarda a própria cópia e avisa de cada mudança em `mudou`. */
  readonly conteudo = input.required<DocBloco[]>();
  readonly mudou = output<DocBloco[]>();

  protected readonly tipos = TIPOS;
  protected readonly blocos = signal<DocBloco[]>([]);

  constructor() {
    effect(() => {
      const origem = this.conteudo();
      this.blocos.set(origem.length > 0 ? origem.map((b) => ({ ...b })) : [novoBloco()]);
    });
  }

  protected placeholder = (tipo: DocBlocoTipo) => PLACEHOLDER[tipo] ?? '';

  /** Posição do item dentro da sequência contínua de blocos numerados. */
  protected numero(indice: number): number {
    let n = 1;
    for (let i = indice - 1; i >= 0 && this.blocos()[i]?.tipo === 'numerada'; i -= 1) n += 1;
    return n;
  }

  private aplicar(proximos: DocBloco[]): void {
    this.blocos.set(proximos);
    this.mudou.emit(proximos);
  }

  private focar(id: string): void {
    setTimeout(() => document.getElementById(`bloco-${id}`)?.focus(), 30);
  }

  protected editar(i: number, texto: string): void {
    this.aplicar(this.blocos().map((b, k) => (k === i ? { ...b, texto } : b)));
  }

  protected marcar(i: number, marcado: boolean): void {
    this.aplicar(this.blocos().map((b, k) => (k === i ? { ...b, marcado } : b)));
  }

  protected linguagem(i: number, linguagem: string): void {
    this.aplicar(this.blocos().map((b, k) => (k === i ? { ...b, linguagem } : b)));
  }

  protected mudarTipo(i: number, tipo: DocBlocoTipo): void {
    this.aplicar(this.blocos().map((b, k) => (k === i ? { ...b, tipo, ...(tipo === 'divisor' ? { texto: '' } : {}) } : b)));
  }

  protected inserir(depoisDe: number, tipo: DocBlocoTipo = 'paragrafo'): void {
    const bloco = novoBloco(tipo);
    const atual = this.blocos();
    this.aplicar([...atual.slice(0, depoisDe + 1), bloco, ...atual.slice(depoisDe + 1)]);
    this.focar(bloco.id);
  }

  protected remover(i: number): void {
    const atual = this.blocos();
    if (atual.length === 1) {
      this.aplicar([novoBloco()]);
      return;
    }
    this.aplicar(atual.filter((_, k) => k !== i));
  }

  protected mover(i: number, delta: number): void {
    const copia = [...this.blocos()];
    const j = i + delta;
    if (j < 0 || j >= copia.length) return;
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    this.aplicar(copia);
  }

  /** Enter cria o bloco seguinte (continuando a lista, se for o caso); Backspace num bloco vazio o remove. */
  protected teclar(evento: KeyboardEvent, i: number): void {
    const bloco = this.blocos()[i];
    if (!bloco) return;
    const emTexto = bloco.tipo !== 'codigo' && bloco.tipo !== 'tabela';
    if (evento.key === 'Enter' && !evento.shiftKey && emTexto) {
      evento.preventDefault();
      const continua = bloco.tipo === 'lista' || bloco.tipo === 'numerada' || bloco.tipo === 'checklist';
      // Enter num item vazio sai da lista, como nos editores de texto.
      if (continua && bloco.texto === '') this.mudarTipo(i, 'paragrafo');
      else this.inserir(i, continua ? bloco.tipo : 'paragrafo');
    } else if (evento.key === 'Backspace' && bloco.texto === '' && this.blocos().length > 1) {
      evento.preventDefault();
      const anterior = this.blocos()[i - 1] ?? this.blocos()[i + 1];
      this.remover(i);
      if (anterior) this.focar(anterior.id);
    }
  }
}
