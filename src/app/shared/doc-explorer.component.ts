import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tab, TabList, Tabs } from 'primeng/tabs';

import { DocEditor } from './doc-editor.component';
import { DocTree } from './doc-tree.component';
import {
  abrirRascunho,
  atualizarDocumento,
  criarDocumento,
  excluirDocumento,
  gerarDraftDaBaseTecnica,
  listarArvore,
  publicarDocumento,
} from '@/lib/doc-store';
import type { DocBloco, DocumentoWorkspace } from '@/types/workspace';

type Ambiente = 'oficial' | 'sandbox';

/**
 * Explorador da documentação de um produto: árvore de páginas (Oficial/Rascunho) e editor.
 *
 * Editar uma página oficial não altera a oficial: abre um rascunho dela e continua de onde estava.
 * O publicado só muda quando alguém decide publicar.
 */
@Component({
  selector: 'app-doc-explorer',
  imports: [FormsModule, Button, Card, Tab, TabList, Tabs, DocEditor, DocTree],
  template: `
    @if (!carregado()) {
      <p-card><p class="mudo">Carregando documentação…</p></p-card>
    } @else if (todos().length === 0) {
      <p-card>
        <div class="vazio-grande">
          <i class="pi pi-book"></i>
          <strong>Este produto ainda não tem documentação</strong>
          <p class="mudo">A documentação é a base das especificações. Crie uma página no editor ou gere um rascunho a partir do que já existe no repositório.</p>
          <div class="acoes">
            <p-button label="Criar página" icon="pi pi-file-plus" (onClick)="criar()" />
            <p-button label="Gerar rascunho de documentação" icon="pi pi-sparkles" [outlined]="true" (onClick)="gerarRascunho()" />
          </div>
        </div>
      </p-card>
    } @else {
      <div class="grade">
        <p-card styleClass="arvore">
          <!-- Mesmo menu de abas da página do produto: texto com uma linha embaixo na aba ativa. -->
          <p-tabs [value]="ambiente()" (valueChange)="trocarAmbiente($any($event))" class="abas">
            <p-tablist>
              <p-tab value="oficial">Oficial</p-tab>
              <p-tab value="sandbox">Rascunho</p-tab>
            </p-tablist>
          </p-tabs>
          <div class="tree">
            <app-doc-tree [documentos]="doAmbiente()" [ativoId]="ativo()?.id" (selecionar)="ativoId.set($event)" (criar)="criar($event)" (mover)="mover($event.id, $event.paiId)" (excluir)="excluir($event)" />
          </div>
        </p-card>

        @if (ativo(); as doc) {
          <app-doc-editor [documento]="doc" (salvar)="salvar(doc, $event)" (publicar)="publicar(doc)" />
        } @else {
          <p-card><p class="mudo vazio">Nenhuma página neste filtro.</p></p-card>
        }
      </div>
    }
  `,
  styles: [
    `
      .grade {
        display: grid;
        grid-template-columns: 21.25rem 1fr;
        gap: 1rem;
        align-items: start;
      }
      .abas {
        display: block;
        margin-bottom: 0.75rem;
        --p-tabs-tablist-background: transparent;
      }
      .vazio-grande {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 2.5rem 0;
        text-align: center;
      }
      .vazio-grande i {
        font-size: 2rem;
        color: var(--p-text-muted-color);
      }
      .acoes {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
      }
      .vazio {
        padding: 1.5rem 0;
        text-align: center;
      }
      .mudo {
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
export class DocExplorer {
  private readonly mensagens = inject(MessageService);

  readonly projetoId = input.required<string>();

  protected readonly todos = signal<DocumentoWorkspace[]>([]);
  protected readonly carregado = signal(false);
  protected readonly ambiente = signal<Ambiente>('oficial');
  protected readonly ativoId = signal<string | null>(null);

  protected readonly doAmbiente = computed(() => this.todos().filter((d) => d.ambiente === this.ambiente()));
  protected readonly ativo = computed<DocumentoWorkspace | undefined>(() => this.doAmbiente().find((d) => d.id === this.ativoId()) ?? this.doAmbiente()[0]);

  constructor() {
    effect(() => {
      const id = this.projetoId();
      this.carregado.set(false);
      void this.recarregar(id);
    });
  }

  private async recarregar(id = this.projetoId()): Promise<void> {
    this.todos.set((await listarArvore(id)).documentos);
    this.carregado.set(true);
  }

  protected trocarAmbiente(valor: Ambiente): void {
    this.ambiente.set(valor);
    this.ativoId.set(null);
  }

  /**
   * Página nova nasce sempre em Rascunho: a oficial é o que já foi publicado, e uma página em
   * branco não é. A mãe também precisa existir em Rascunho, senão a página seria gravada
   * apontando para alguém que não está nessa árvore e simplesmente não apareceria.
   */
  protected async criar(paiId?: string): Promise<void> {
    const mae = paiId ? this.todos().find((d) => d.id === paiId) : undefined;
    const maeNoRascunho = mae?.ambiente === 'oficial' ? (await abrirRascunho(this.projetoId(), mae.id))?.id : paiId;
    const doc = await criarDocumento(this.projetoId(), { paiId: maeNoRascunho, ambiente: 'sandbox' });
    await this.recarregar();
    this.ambiente.set('sandbox');
    this.ativoId.set(doc.id);
    this.mensagens.add({ severity: 'success', summary: 'Página criada em Rascunho', detail: 'Ela vira oficial quando você publicar na wiki.' });
  }

  protected async gerarRascunho(): Promise<void> {
    await gerarDraftDaBaseTecnica(this.projetoId());
    await this.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Rascunho gerado', detail: 'Revise o conteúdo antes de publicar como documentação oficial.' });
  }

  protected async mover(documentoId: string, paiId: string | undefined): Promise<void> {
    await atualizarDocumento(this.projetoId(), documentoId, { paiId });
    await this.recarregar();
  }

  protected async excluir(documentoId: string): Promise<void> {
    await excluirDocumento(this.projetoId(), documentoId);
    await this.recarregar();
    this.ativoId.set(null);
    this.mensagens.add({ severity: 'success', summary: 'Página excluída com sucesso', detail: 'Ela sai da árvore, e as filhas sobem um nível.' });
  }

  /** Salvamento automático: numa oficial, desvia para o rascunho dela, e a aba pula junto. */
  protected async salvar(doc: DocumentoWorkspace, patch: { titulo: string; icone: string; blocos: DocBloco[] }): Promise<void> {
    if (doc.ambiente === 'oficial') {
      const rascunho = await abrirRascunho(this.projetoId(), doc.id);
      if (!rascunho) return;
      await atualizarDocumento(this.projetoId(), rascunho.id, patch);
      // Recarrega antes de trocar de aba: na ordem inversa o rascunho ainda não está nos dados e o editor cairia noutra página.
      await this.recarregar();
      this.ambiente.set('sandbox');
      this.ativoId.set(rascunho.id);
      this.mensagens.add({ severity: 'info', summary: 'Rascunho aberto a partir da versão oficial', detail: 'A oficial continua como está até você publicar.' });
      return;
    }
    await atualizarDocumento(this.projetoId(), doc.id, patch);
    // Sem recarregar a lista inteira a cada tecla: o dado local acompanha o que foi gravado.
    this.todos.update((lista) => lista.map((d) => (d.id === doc.id ? { ...d, ...patch, atualizadoEm: new Date().toISOString() } : d)));
  }

  protected async publicar(doc: DocumentoWorkspace): Promise<void> {
    await publicarDocumento(this.projetoId(), doc.id);
    await this.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Página publicada', detail: 'O conteúdo foi para o wiki-repo do produto.' });
  }
}
