import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';

import type { DocumentoWorkspace } from '@/types/workspace';

/** Sem acento e sem caixa, para "dominio" achar "Domínio". */
const normalizar = (texto: string) => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Árvore de páginas, no modelo da wiki do GitLab.
 *
 * Toda página é um documento que se abre e se edita, e qualquer uma pode ter filhas em qualquer
 * profundidade. Mudar o nível tem dois caminhos que fazem a mesma coisa: arrastar pela alça e
 * soltar sobre outra página, ou os itens de mover do menu da linha (o caminho de quem não usa mouse).
 */
@Component({
  selector: 'app-doc-tree',
  imports: [FormsModule, NgTemplateOutlet, Button, ConfirmDialog, IconField, InputIcon, InputText, Menu],
  providers: [ConfirmationService],
  template: `
    <div class="topo">
      <p-iconfield class="filtro">
        <p-inputicon class="pi pi-search" />
        <input pInputText type="text" size="small" placeholder="Filtrar páginas" aria-label="Filtrar páginas pelo nome" [ngModel]="filtro()" (ngModelChange)="filtro.set($event)" [fluid]="true" />
      </p-iconfield>
      <p-button icon="pi pi-plus" [outlined]="true" severity="secondary" ariaLabel="Nova página em branco" (onClick)="criar.emit(undefined)" />
    </div>

    @if (raiz().length === 0) {
      <p class="vazio">{{ termo() ? 'Nenhuma página com “' + filtro().trim() + '”.' : 'Nenhuma página ainda. Use o botão acima para criar a primeira.' }}</p>
    } @else {
      <ul class="lista">
        @for (doc of raiz(); track doc.id) {
          <ng-container *ngTemplateOutlet="linha; context: { $implicit: doc, nivel: 0 }" />
        }
      </ul>
      @if (arrastando()) {
        <div class="solta-raiz" data-solta-raiz [class.alvo]="alvo() === 'raiz'">Soltar aqui para tirar do aninhamento</div>
      }
    }

    <ng-template #linha let-doc let-nivel="nivel">
      <li>
        <div class="linha" [attr.data-linha]="doc.id" [class.arrastada]="arrastando() === doc.id" [class.alvo]="alvo() === doc.id">
          @for (_ of niveis(nivel); track $index) { <span class="guia" aria-hidden="true"></span> }
          @if (filhosVisiveis(doc).length > 0) {
            <button type="button" class="seta" [attr.aria-label]="aberta(doc) ? 'Recolher ' + doc.titulo : 'Expandir ' + doc.titulo" [attr.aria-expanded]="aberta(doc)" (click)="alternar(doc.id)">
              <i class="pi" [class.pi-chevron-down]="aberta(doc)" [class.pi-chevron-right]="!aberta(doc)"></i>
            </button>
          } @else {
            <span class="seta vazio-seta" aria-hidden="true"></span>
          }
          <button type="button" class="nome" [class.ativo]="ativoId() === doc.id" [attr.aria-current]="ativoId() === doc.id ? 'true' : null" (click)="selecionar.emit(doc.id)">
            <span>{{ doc.titulo || 'Página sem título' }}</span>
          </button>
          <span class="alca" aria-hidden="true" title="Arraste para mudar de nível" (pointerdown)="comecarArrasto($event, doc.id)"><i class="pi pi-bars"></i></span>
          <p-button icon="pi pi-ellipsis-v" [text]="true" severity="secondary" size="small" [ariaLabel]="'Ações de ' + doc.titulo" (onClick)="abrirMenu($event, doc, menu)" />
        </div>
        @if (filhosVisiveis(doc).length > 0 && aberta(doc)) {
          <ul class="lista">
            @for (filho of filhosVisiveis(doc); track filho.id) {
              <ng-container *ngTemplateOutlet="linha; context: { $implicit: filho, nivel: nivel + 1 }" />
            }
          </ul>
        }
      </li>
    </ng-template>

    <p-menu #menu [model]="itensMenu()" [popup]="true" appendTo="body" />
    <p-confirmdialog />
  `,
  styles: [
    `
      .topo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .filtro {
        flex: 1;
        min-width: 0;
      }
      .lista {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .linha {
        display: flex;
        align-items: center;
        gap: 0.125rem;
        border-radius: 6px;
      }
      .linha.arrastada {
        opacity: 0.5;
      }
      .linha.alvo {
        background: var(--p-highlight-background);
        outline: 1px solid var(--p-primary-color);
      }
      .guia {
        flex-shrink: 0;
        width: 1px;
        height: 1.75rem;
        margin-left: 0.5rem;
        background: var(--p-content-border-color);
      }
      .seta {
        flex-shrink: 0;
        width: 1.25rem;
        padding: 0.125rem;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: var(--p-text-muted-color);
        font-size: 0.75rem;
        cursor: pointer;
      }
      .seta:hover:not(.vazio-seta) {
        background: var(--p-content-hover-background);
      }
      .nome {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        padding: 0.375rem 0.375rem;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.875rem;
        text-align: left;
        cursor: pointer;
      }
      .nome span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .nome:hover {
        background: var(--p-content-hover-background);
      }
      .nome.ativo {
        background: var(--p-highlight-background);
        color: var(--p-primary-color);
        font-weight: 500;
      }
      .alca {
        flex-shrink: 0;
        padding: 0.25rem;
        border-radius: 4px;
        color: var(--p-text-muted-color);
        font-size: 0.75rem;
        cursor: grab;
        touch-action: none;
      }
      .alca:hover {
        background: var(--p-content-hover-background);
      }
      .solta-raiz {
        margin-top: 0.5rem;
        padding: 0.375rem 0.5rem;
        border: 1px dashed var(--p-content-border-color);
        border-radius: 6px;
        text-align: center;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
      .solta-raiz.alvo {
        border-color: var(--p-primary-color);
        background: var(--p-highlight-background);
      }
      .vazio {
        padding: 1rem 0.25rem;
        text-align: center;
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class DocTree {
  private readonly confirmacao = inject(ConfirmationService);
  private readonly destroy = inject(DestroyRef);

  readonly documentos = input.required<DocumentoWorkspace[]>();
  readonly ativoId = input<string | undefined>(undefined);

  readonly selecionar = output<string>();
  readonly criar = output<string | undefined>();
  readonly mover = output<{ id: string; paiId: string | undefined }>();
  readonly excluir = output<string>();

  protected readonly filtro = signal('');
  protected readonly fechadas = signal<string[]>([]);
  protected readonly arrastando = signal<string | null>(null);
  protected readonly alvo = signal<string | null>(null);
  protected readonly menuDoc = signal<DocumentoWorkspace | null>(null);

  protected readonly termo = computed(() => normalizar(this.filtro().trim()));

  private readonly filhosDe = (paiId?: string) => this.documentos().filter((d) => (d.paiId ?? undefined) === paiId);

  /** A página fica quando o nome dela casa ou quando alguma descendente casa. */
  private readonly visivel = (doc: DocumentoWorkspace): boolean => this.termo().length === 0 || normalizar(doc.titulo).includes(this.termo()) || this.filhosDe(doc.id).some((f) => this.visivel(f));

  protected readonly raiz = computed(() => this.filhosDe(undefined).filter((d) => this.visivel(d)));
  protected niveis = (n: number) => Array.from({ length: n });
  protected filhosVisiveis = (doc: DocumentoWorkspace) => this.filhosDe(doc.id).filter((d) => this.visivel(d));
  /** Durante o filtro tudo abre: fechada, a página esconderia justamente o que se procurou. */
  protected aberta = (doc: DocumentoWorkspace) => this.termo().length > 0 || !this.fechadas().includes(doc.id);

  protected alternar(id: string): void {
    this.fechadas.update((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  /** Impede soltar uma página dentro da própria descendência. */
  private descendeDe(candidatoId: string, ancestralId: string): boolean {
    const doc = this.documentos().find((d) => d.id === candidatoId);
    if (!doc?.paiId) return false;
    return doc.paiId === ancestralId || this.descendeDe(doc.paiId, ancestralId);
  }

  private podeSoltar(destinoId: string): boolean {
    const a = this.arrastando();
    return a !== null && a !== destinoId && !this.descendeDe(destinoId, a);
  }

  /** Arrasto por eventos de ponteiro: o mesmo gesto no mouse e no toque; o alvo sai de `elementFromPoint`. */
  protected comecarArrasto(evento: PointerEvent, id: string): void {
    evento.preventDefault();
    this.arrastando.set(id);
    const mover = (e: PointerEvent) => {
      const sob = document.elementFromPoint(e.clientX, e.clientY);
      const destino = sob?.closest<HTMLElement>('[data-linha]')?.dataset['linha'];
      if (sob?.closest('[data-solta-raiz]')) this.alvo.set('raiz');
      else this.alvo.set(destino && this.podeSoltar(destino) ? destino : null);
    };
    const encerrar = () => {
      const destino = this.alvo();
      const arrastado = this.arrastando();
      if (arrastado && destino) this.mover.emit({ id: arrastado, paiId: destino === 'raiz' ? undefined : destino });
      this.arrastando.set(null);
      this.alvo.set(null);
      limpar();
    };
    const limpar = () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', encerrar);
      window.removeEventListener('pointercancel', encerrar);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', encerrar);
    window.addEventListener('pointercancel', encerrar);
    this.destroy.onDestroy(limpar);
  }

  private maeDe = (doc: DocumentoWorkspace) => (doc.paiId ? this.documentos().find((d) => d.id === doc.paiId) : undefined);

  /** Um nível abaixo é virar filha da irmã logo acima; sem irmã acima não há de quem ser filha. */
  private irmaAcima(doc: DocumentoWorkspace): DocumentoWorkspace | undefined {
    const irmas = this.filhosDe(doc.paiId ?? undefined);
    return irmas[irmas.indexOf(doc) - 1];
  }

  protected readonly itensMenu = computed<MenuItem[]>(() => {
    const doc = this.menuDoc();
    if (!doc) return [];
    return [
      { label: 'Criar página neste nível', icon: 'pi pi-file-plus', command: () => this.criar.emit(doc.paiId) },
      { label: 'Criar subpágina', icon: 'pi pi-arrow-right', command: () => this.criar.emit(doc.id) },
      { separator: true },
      { label: 'Mover um nível acima', icon: 'pi pi-arrow-left', disabled: !doc.paiId, command: () => this.mover.emit({ id: doc.id, paiId: this.maeDe(doc)?.paiId }) },
      { label: 'Mover um nível abaixo', icon: 'pi pi-arrow-right', disabled: !this.irmaAcima(doc), command: () => this.mover.emit({ id: doc.id, paiId: this.irmaAcima(doc)?.id }) },
      { separator: true },
      { label: 'Excluir página', icon: 'pi pi-trash', styleClass: 'item-perigo', command: () => this.confirmarExclusao(doc) },
    ];
  });

  protected abrirMenu(evento: Event, doc: DocumentoWorkspace, menu: Menu): void {
    this.menuDoc.set(doc);
    menu.toggle(evento);
  }

  private confirmarExclusao(doc: DocumentoWorkspace): void {
    const filhas = this.filhosDe(doc.id).length;
    const perdido = 'O conteúdo desta página é perdido e não pode ser recuperado.';
    const mensagem =
      filhas === 0
        ? perdido
        : filhas === 1
          ? `${perdido} A página filha não é excluída: ela sobe um nível e passa a responder à página mãe desta.`
          : `${perdido} As ${filhas} páginas filhas não são excluídas: elas sobem um nível e passam a responder à página mãe desta.`;
    this.confirmacao.confirm({
      header: `Excluir ${doc.titulo || 'Página sem título'}?`,
      message: mensagem,
      acceptLabel: 'Excluir página',
      rejectLabel: 'Manter página',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.excluir.emit(doc.id),
    });
  }
}
