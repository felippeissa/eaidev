import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { AuthService } from '../../core/auth.service';
import { carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { listarArvore } from '@/lib/doc-store';
import { listarProjetos } from '@/lib/projeto-store';
import { criarSpec } from '@/lib/spec-store';
import type { DocumentoWorkspace } from '@/types/workspace';

const FASES = [
  ['1. Constituição', 'Princípios não negociáveis do produto.'],
  ['2. Especificação', 'Contexto, histórias de usuário e critérios de aceite.'],
  ['3. Plano & Arquitetura', 'Decisões, modelo de dados, contratos e regras.'],
  ['4. Tarefas', 'Tarefas ordenadas, cada uma com prompt pronto.'],
  ['5. Validação', 'Cenários de teste, guia rápido e prompt de contexto.'],
];

@Component({
  selector: 'app-especificacao-nova',
  imports: [FormsModule, RouterLink, PageHeader, Button, Card, Checkbox, InputText, Message, Select, Textarea],
  template: `
    <app-page-header titulo="Nova especificação" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: 'Especificações', routerLink: '/projetos/especificacoes' }, { label: 'Nova especificação' }]" />

    <div class="grade">
      <p-card header="Pedido inicial" subheader="Descreva o problema, quem usa e o resultado esperado. Não descreva solução técnica.">
        <div class="form">
          <div class="campo">
            <label for="titulo">Título</label>
            <input pInputText id="titulo" placeholder="Ex.: Solicitação de acesso a sistemas" [(ngModel)]="titulo" [fluid]="true" />
          </div>

          <div class="duas">
            <div class="campo">
              <label for="produto">Produto</label>
              <p-select inputId="produto" [options]="produtos() ?? []" optionLabel="nome" optionValue="id" placeholder="Selecione o produto" [ngModel]="produtoId()" (ngModelChange)="trocarProduto($event)" [fluid]="true" />
            </div>
            <div class="natureza">
              <strong>Natureza</strong>
              <span>Mudança proposta ao sistema</span>
              <small>Funcionalidades e padrões serão identificados e propostos durante a fase de especificação.</small>
            </div>
          </div>

          <div class="campo">
            <label for="prompt">Descrição da necessidade</label>
            <textarea pTextarea id="prompt" rows="7" placeholder="Preciso de um fluxo em que o servidor solicita acesso a um sistema, o gestor aprova ou nega, e tudo fica auditado." [(ngModel)]="prompt" [fluid]="true"></textarea>
            <small class="mudo">Mínimo de 20 caracteres. Ambiguidades serão marcadas como pendência na fase de especificação.</small>
          </div>

          <fieldset class="refs">
            <legend><i class="pi pi-book"></i> Referências documentais (opcional)</legend>
            <small class="mudo">Selecione documentos do wiki-repo para contextualizar a intenção. Eles não serão alterados nesta etapa.</small>
            @if (documentos().length === 0) {
              <p class="mudo">Este produto ainda não possui documentos disponíveis.</p>
            } @else {
              <div class="item todos">
                <p-checkbox inputId="todos" [binary]="true" [ngModel]="todosMarcados()" [indeterminate]="algunsMarcados()" (ngModelChange)="marcarTodos($event)" />
                <label for="todos"><strong>Selecionar todos ({{ documentos().length }})</strong></label>
              </div>
              <div class="lista">
                @for (doc of documentos(); track doc.id) {
                  <div class="item">
                    <p-checkbox [inputId]="'doc-' + doc.id" [binary]="true" [ngModel]="referencias().includes(doc.id)" (ngModelChange)="alternarDoc(doc.id)" />
                    <label [for]="'doc-' + doc.id"><strong>{{ doc.titulo }}</strong><small class="mudo bloco">{{ doc.classe }} · v{{ doc.versao }}</small></label>
                  </div>
                }
              </div>
            }
          </fieldset>

          <div class="acoes">
            <p-button label="Cancelar" severity="secondary" [text]="true" [disabled]="criando()" routerLink="/projetos/especificacoes" />
            <p-button label="Criar especificação" icon="pi pi-sparkles" [disabled]="!valido() || criando()" [loading]="criando()" (onClick)="criar()" />
          </div>
        </div>
      </p-card>

      <p-card header="Como o SPDD funciona" subheader="Cinco fases, cada uma com artefatos versionados">
        @for (fase of fases; track fase[0]) {
          <div class="fase"><strong>{{ fase[0] }}</strong><small class="mudo bloco">{{ fase[1] }}</small></div>
        }
        <p-message severity="info" size="small" text="Ao publicar, todos os artefatos ficam disponíveis como pacote MCP para os agentes de código consumirem." />
      </p-card>
    </div>
  `,
  styles: [
    `
      .grade {
        display: grid;
        grid-template-columns: 1fr 20rem;
        gap: 1rem;
        align-items: start;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
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
      .natureza {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem;
        border: 1px solid var(--p-primary-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-highlight-background);
      }
      .natureza small {
        color: var(--p-text-muted-color);
      }
      .refs {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 0;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      legend {
        padding: 0 0.25rem;
        font-weight: 500;
      }
      .lista {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 20rem;
        overflow-y: auto;
      }
      .item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .todos {
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--p-content-border-color);
      }
      label {
        cursor: pointer;
      }
      .bloco {
        display: block;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .fase {
        margin-bottom: 0.75rem;
      }
      @media (max-width: 1000px) {
        .grade,
        .duas {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class EspecificacaoNovaPage {
  private readonly router = inject(Router);
  private readonly mensagens = inject(MessageService);
  private readonly auth = inject(AuthService);

  /** Vem da rota (`?produto=`), quando se chega pela aba do produto. */
  readonly produto = input<string | undefined>(undefined);

  protected readonly fases = FASES;
  protected readonly produtos = carregar(() => listarProjetos());
  protected readonly produtoId = signal('');
  protected readonly documentos = signal<DocumentoWorkspace[]>([]);
  protected readonly referencias = signal<string[]>([]);
  protected readonly criando = signal(false);
  protected titulo = '';
  protected prompt = '';

  protected readonly todosMarcados = computed(() => this.documentos().length > 0 && this.referencias().length === this.documentos().length);
  protected readonly algunsMarcados = computed(() => this.referencias().length > 0 && !this.todosMarcados());
  protected valido = () => this.titulo.trim().length > 2 && this.prompt.trim().length > 20 && !!this.produtoId();

  constructor() {
    // Começa no primeiro produto, como no app em React.
    effect(() => {
      const lista = this.produtos();
      const inicial = lista?.find((p) => p.id === this.produto()) ?? lista?.[0];
      if (inicial && !this.produtoId()) this.trocarProduto(inicial.id);
    });
  }

  protected trocarProduto(id: string): void {
    this.produtoId.set(id);
    this.referencias.set([]);
    void listarArvore(id).then((arvore) => this.documentos.set(arvore.documentos.filter((d) => d.ambiente === 'oficial')));
  }

  protected marcarTodos(marcado: boolean): void {
    this.referencias.set(marcado ? this.documentos().map((d) => d.id) : []);
  }

  protected alternarDoc(id: string): void {
    this.referencias.update((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  protected async criar(): Promise<void> {
    const produto = this.produtos()?.find((p) => p.id === this.produtoId());
    this.criando.set(true);
    const spec = await criarSpec({
      titulo: this.titulo.trim(),
      projetoId: produto?.id ?? this.produtoId(),
      projeto: produto?.nome ?? 'Produto sem nome',
      natureza: 'Mudança proposta',
      promptInicial: this.prompt,
      referenciasDocumentais: this.referencias(),
      fluxo: 'gates',
      autor: this.auth.sessao()?.usuario.nome ?? 'Usuário do Portal',
    });
    this.mensagens.add({ severity: 'success', summary: 'Especificação criada com sucesso', detail: 'Gere a constituição para começar o ciclo.' });
    void this.router.navigate(['/projetos/especificacoes', spec.id]);
  }
}
