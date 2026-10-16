import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';

import { atraso } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatusTag } from '../../shared/status-tag.component';
import { listarProjetos } from '@/lib/projeto-store';
import { apis } from '@/mocks/catalogo';
import type { Api, MetodoHttp, OperacaoApi } from '@/types';
import { ORDEM_AMBIENTES } from './apis.page';

const METODO: Record<MetodoHttp, { severidade: 'info' | 'success' | 'warn' | 'danger' | 'contrast'; roxo?: boolean }> = {
  GET: { severidade: 'info' },
  POST: { severidade: 'success' },
  PUT: { severidade: 'warn' },
  PATCH: { severidade: 'contrast', roxo: true },
  DELETE: { severidade: 'danger' },
};

const severidadeCodigo = (codigo: string): 'success' | 'warn' | 'danger' | 'secondary' => (codigo.startsWith('2') ? 'success' : codigo.startsWith('4') ? 'warn' : codigo.startsWith('5') ? 'danger' : 'secondary');

/** Ordena versões da mais nova para a mais antiga ("v10" vem antes de "v9"). */
const numeroVersao = (versao: string) => Number.parseFloat(versao.replace(/[^\d.]/g, '')) || 0;

@Component({
  selector: 'app-api-contrato',
  imports: [FormsModule, PageHeader, StatusTag, Button, Card, IconField, InputIcon, InputText, Message, Select, Skeleton, Tab, TabList, TabPanel, TabPanels, Tabs, Tag],
  template: `
    @if (carregado() && api(); as a) {
      <app-page-header [titulo]="a.nome" [trilha]="[{ label: 'APIs WSO2', routerLink: '/catalogo/apis', queryParams: retorno() }, { label: a.nome }]">
        <p-button label="Voltar ao catálogo" icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="voltar()" />
      </app-page-header>

      <div class="identificacao">
        @if (versoes().length > 1) {
          <p-select [options]="versoes()" optionLabel="versao" optionValue="versao" [ngModel]="a.versao" (ngModelChange)="trocarVersao($event)" ariaLabel="Versão da API" appendTo="body" />
        } @else {
          <p-tag [value]="a.versao" severity="secondary" />
        }
        <div class="chips">@for (amb of ambientes(a); track amb) { <app-status-tag [status]="amb" /> }</div>
        <code class="mono">{{ a.enderecoBase }}</code>
        <span class="mudo">Produto: <strong>{{ nomeProduto() }}</strong></span>
      </div>

      <p-tabs [value]="aba()" (valueChange)="aba.set($any($event))">
        <p-tablist>
          <p-tab value="documentacao">Documentação</p-tab>
          <p-tab value="arquivo">Arquivo</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="documentacao">
            @if (!a.contrato.padrao) {
              <p-message severity="info" text="Este contrato não está em um formato que permita a visualização formatada. Consulte a aba Arquivo." />
            } @else {
              <p-iconfield class="busca-op">
                <p-inputicon class="pi pi-search" />
                <input pInputText type="text" placeholder="Buscar operação" aria-label="Buscar operação" [ngModel]="buscaOp()" (ngModelChange)="buscaOp.set($event)" [fluid]="true" />
              </p-iconfield>

              @if (a.contrato.resumo || a.contrato.descricao) {
                <p-card header="Descrição" styleClass="bloco">
                  @if (a.contrato.resumo) { <p class="resumo"><strong>{{ a.contrato.resumo }}</strong></p> }
                  @if (a.contrato.descricao) { <p class="mudo sem-margem">{{ a.contrato.descricao }}</p> }
                </p-card>
              }

              <p-card header="Endereços por ambiente" styleClass="bloco">
                @for (s of a.contrato.servidores; track s.ambiente) {
                  <div class="servidor"><app-status-tag [status]="s.ambiente" /><code class="mono">{{ s.url }}</code></div>
                }
              </p-card>

              @if (gruposVisiveis().length === 0) {
                <p-card styleClass="bloco"><p class="vazio">Nenhuma operação encontrada para "{{ buscaOp().trim() }}".</p></p-card>
              }
              @for (g of gruposVisiveis(); track g.chave) {
                <p-card styleClass="bloco">
                  <button type="button" class="grupo-titulo" [attr.aria-expanded]="!recolhidos().has(g.chave)" (click)="alternar(recolhidos, g.chave)">
                    <i class="pi" [class.pi-chevron-down]="!recolhidos().has(g.chave)" [class.pi-chevron-right]="recolhidos().has(g.chave)"></i>
                    <strong>{{ g.nome }} · {{ g.operacoes.length }} {{ g.operacoes.length === 1 ? 'operação' : 'operações' }}</strong>
                  </button>
                  @if (!recolhidos().has(g.chave)) {
                    @for (op of g.operacoes; track op.chave) {
                      <div class="operacao">
                        <button type="button" class="op-linha" [attr.aria-expanded]="abertas().has(op.chave)" (click)="alternar(abertas, op.chave)">
                          <p-tag [value]="op.metodo" [severity]="metodo(op.metodo).severidade" [styleClass]="metodo(op.metodo).roxo ? 'roxo' : ''" />
                          <code class="mono caminho" [class.obsoleta]="op.obsoleta">{{ op.caminho }}</code>
                          @if (op.obsoleta) { <p-tag value="Obsoleta" severity="secondary" /> }
                          <span class="mudo resumo-op">{{ op.resumo }}</span>
                          <i class="pi" [class.pi-chevron-up]="abertas().has(op.chave)" [class.pi-chevron-down]="!abertas().has(op.chave)"></i>
                        </button>
                        @if (abertas().has(op.chave)) {
                          <div class="op-detalhe">
                            @if (op.parametros.length > 0) {
                              <h4>Parâmetros</h4>
                              <table class="tabela">
                                <thead><tr><th>Nome</th><th>Local</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr></thead>
                                <tbody>
                                  @for (p of op.parametros; track p.nome) {
                                    <tr><td><code class="mono">{{ p.nome }}</code></td><td>{{ p.local }}</td><td>{{ p.tipo }}</td><td>{{ p.obrigatorio ? 'Sim' : 'Não' }}</td><td>{{ p.descricao }}</td></tr>
                                  }
                                </tbody>
                              </table>
                            }
                            @if (op.corpo; as corpo) {
                              <h4>Corpo da requisição</h4>
                              <p class="sem-margem">Tipo de conteúdo: <code class="mono">{{ corpo.tipoConteudo }}</code>@if (corpo.modelo) { · Modelo: <a href="javascript:void(0)" (click)="irParaModelo(corpo.modelo)">{{ corpo.modelo }}</a> }</p>
                              @if (corpo.exemplo) { <pre class="codigo">{{ corpo.exemplo }}</pre> }
                            }
                            <h4>Respostas</h4>
                            @for (r of op.respostas; track r.codigo) {
                              <div class="resposta">
                                <button type="button" class="resp-linha" (click)="alternar(respostasAbertas, op.chave + r.codigo)" [disabled]="!r.modelo && !r.exemplo">
                                  <p-tag [value]="r.codigo" [severity]="severidadeCodigo(r.codigo)" />
                                  <span>{{ r.descricao }}</span>
                                  @if (r.modelo || r.exemplo) { <i class="pi" [class.pi-chevron-up]="respostasAbertas().has(op.chave + r.codigo)" [class.pi-chevron-down]="!respostasAbertas().has(op.chave + r.codigo)"></i> }
                                </button>
                                @if (respostasAbertas().has(op.chave + r.codigo)) {
                                  @if (r.modelo) { <p class="sem-margem">Modelo: <a href="javascript:void(0)" (click)="irParaModelo(r.modelo)">{{ r.modelo }}</a></p> }
                                  @if (r.exemplo) { <pre class="codigo">{{ r.exemplo }}</pre> }
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  }
                </p-card>
              }

              @if (a.contrato.modelos.length > 0) {
                <p-card header="Modelos de dados" styleClass="bloco">
                  @for (m of a.contrato.modelos; track m.nome) {
                    <div class="modelo" [id]="'modelo-' + m.nome">
                      <button type="button" class="grupo-titulo" [attr.aria-expanded]="modelosAbertos().has(m.nome)" (click)="alternar(modelosAbertos, m.nome)">
                        <i class="pi" [class.pi-chevron-down]="modelosAbertos().has(m.nome)" [class.pi-chevron-right]="!modelosAbertos().has(m.nome)"></i>
                        <strong>{{ m.nome }}</strong>
                      </button>
                      @if (modelosAbertos().has(m.nome)) {
                        <table class="tabela">
                          <thead><tr><th>Campo</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr></thead>
                          <tbody>
                            @for (c of m.campos; track c.nome) {
                              <tr>
                                <td><code class="mono">{{ c.nome }}</code></td>
                                <td>@if (c.modeloRef) { <a href="javascript:void(0)" (click)="irParaModelo(c.modeloRef)">{{ c.modeloRef }}</a> } @else { {{ c.tipo }} }</td>
                                <td>{{ c.obrigatorio ? 'Sim' : 'Não' }}</td>
                                <td>{{ c.descricao }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      }
                    </div>
                  }
                </p-card>
              }
            }
          </p-tabpanel>

          <p-tabpanel value="arquivo">
            <div class="arquivo-topo">
              <p-tag [value]="a.contrato.formato" severity="secondary" />
              <p-button [label]="copiado() ? 'Copiado' : 'Copiar'" [icon]="copiado() ? 'pi pi-check' : 'pi pi-copy'" [text]="true" severity="secondary" size="small" (onClick)="copiar(a.contrato.conteudo)" />
            </div>
            <div class="arquivo">
              <div class="numeros" aria-hidden="true">@for (n of linhas(a.contrato.conteudo); track $index) { <span>{{ $index + 1 }}</span> }</div>
              <pre class="conteudo">{{ a.contrato.conteudo }}</pre>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    } @else if (!carregado()) {
      <p-skeleton width="16rem" height="2rem" />
      <p-skeleton width="100%" height="4rem" styleClass="espaco" />
      <p-skeleton width="100%" height="20rem" styleClass="espaco" />
    } @else {
      <app-page-header titulo="Contrato da API" [trilha]="[{ label: 'APIs WSO2', routerLink: '/catalogo/apis' }, { label: 'Contrato' }]" />
      <p-card>
        <p class="mudo">Não foi possível carregar o contrato desta versão.</p>
        <p-button label="Voltar ao catálogo" [outlined]="true" (onClick)="voltar()" />
      </p-card>
    }
  `,
  styles: [
    `
      :host ::ng-deep .espaco {
        margin-top: 1rem;
      }
      .identificacao {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem 1rem;
        margin-bottom: 0.5rem;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
      .busca-op {
        display: block;
        margin-bottom: 1rem;
      }
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .servidor {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.25rem 0;
      }
      .grupo-titulo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.25rem 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .operacao {
        margin-top: 0.5rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .op-linha {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.625rem 0.75rem;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .op-linha:hover {
        background: var(--p-content-hover-background);
      }
      .resumo-op {
        flex: 1;
        min-width: 0;
      }
      .op-detalhe {
        padding: 0.25rem 0.75rem 0.75rem;
        border-top: 1px solid var(--p-content-border-color);
      }
      h4 {
        margin: 1rem 0 0.5rem;
        font-size: 0.875rem;
      }
      .tabela {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .tabela th,
      .tabela td {
        padding: 0.375rem 0.5rem;
        text-align: left;
        border-bottom: 1px solid var(--p-content-border-color);
      }
      .tabela th {
        color: var(--p-text-muted-color);
        font-weight: 500;
      }
      .resposta {
        margin-bottom: 0.25rem;
      }
      .resp-linha {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.375rem 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .resp-linha:disabled {
        cursor: default;
      }
      .resp-linha span {
        flex: 1;
      }
      .codigo {
        margin: 0.5rem 0;
        padding: 0.75rem;
        overflow: auto;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
      }
      :host ::ng-deep .roxo {
        background: var(--p-violet-500);
        color: #fff;
      }
      .caminho.obsoleta {
        text-decoration: line-through;
        color: var(--p-text-muted-color);
      }
      .modelo {
        margin-bottom: 0.5rem;
        scroll-margin-top: 5rem;
      }
      .arquivo-topo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .arquivo {
        display: flex;
        max-height: 32rem;
        overflow: auto;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
      }
      .numeros {
        display: flex;
        flex-direction: column;
        padding: 0.75rem 0.75rem 0.75rem 1rem;
        text-align: right;
        color: var(--p-text-muted-color);
        user-select: none;
      }
      .conteudo {
        margin: 0;
        padding: 0.75rem 1rem 0.75rem 0;
        font: inherit;
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .sem-margem {
        margin: 0;
      }
      .resumo {
        margin: 0 0 0.5rem;
      }
      .vazio {
        margin: 0;
        padding: 1rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class ApiContratoPage {
  private readonly router = inject(Router);

  /** Vêm da rota (`/catalogo/apis/:apiId/:versao?aba=&produto=&busca=`). */
  readonly apiId = input.required<string>();
  readonly versao = input.required<string>();
  readonly abaUrl = input<string | undefined>(undefined, { alias: 'aba' });
  readonly produtoUrl = input<string | undefined>(undefined, { alias: 'produto' });
  readonly buscaUrl = input<string | undefined>(undefined, { alias: 'busca' });

  protected readonly carregado = signal(false);
  protected readonly api = signal<Api | undefined>(undefined);
  protected readonly versoes = signal<{ versao: string }[]>([]);
  protected readonly nomeProduto = signal('—');

  protected readonly aba = signal<'documentacao' | 'arquivo'>('documentacao');
  protected readonly buscaOp = signal('');
  protected readonly recolhidos = signal<Set<string>>(new Set());
  protected readonly abertas = signal<Set<string>>(new Set());
  protected readonly respostasAbertas = signal<Set<string>>(new Set());
  protected readonly modelosAbertos = signal<Set<string>>(new Set());
  protected readonly copiado = signal(false);

  protected readonly retorno = computed(() => ({ ...(this.produtoUrl() ? { produto: this.produtoUrl() } : {}), ...(this.buscaUrl() ? { busca: this.buscaUrl() } : {}) }));

  /** Grupos e operações já filtrados pela busca; grupo sem operação encontrada some; sem nome vira "Outras operações", por último. */
  protected readonly gruposVisiveis = computed(() => {
    const contrato = this.api()?.contrato;
    if (!contrato) return [];
    const termo = this.buscaOp().trim().toLowerCase();
    const grupos = contrato.grupos
      .map((g, i) => ({
        chave: `g${i}`,
        nome: g.nome.trim() || 'Outras operações',
        semNome: !g.nome.trim(),
        operacoes: g.operacoes
          .map((o, j) => ({ ...o, chave: `g${i}o${j}` }))
          .filter((o) => !termo || o.caminho.toLowerCase().includes(termo) || o.resumo.toLowerCase().includes(termo)),
      }))
      .filter((g) => g.operacoes.length > 0);
    return [...grupos.filter((g) => !g.semNome), ...grupos.filter((g) => g.semNome)];
  });

  constructor() {
    effect(() => {
      const apiId = this.apiId();
      const versao = this.versao();
      this.carregado.set(false);
      void atraso(true, 300).then(async () => {
        const todas = apis.filter((a) => a.apiId === apiId).sort((a, b) => numeroVersao(b.versao) - numeroVersao(a.versao));
        const atual = todas.find((a) => a.versao === versao);
        this.versoes.set(todas.map((a) => ({ versao: a.versao })));
        this.api.set(atual);
        if (atual) {
          const produtos = await listarProjetos();
          this.nomeProduto.set(produtos.find((p) => p.id === atual.produtoId)?.nome ?? '—');
          // Contrato fora do padrão abre direto no Arquivo; nos demais vale a aba pedida na URL.
          this.aba.set(!atual.contrato.padrao ? 'arquivo' : this.abaUrl() === 'arquivo' ? 'arquivo' : 'documentacao');
        }
        this.buscaOp.set('');
        this.recolhidos.set(new Set());
        this.abertas.set(new Set());
        this.respostasAbertas.set(new Set());
        this.modelosAbertos.set(new Set());
        this.carregado.set(true);
      });
    });
  }

  protected metodo = (m: MetodoHttp) => METODO[m];
  protected severidadeCodigo = severidadeCodigo;
  protected ambientes = (a: Api) => ORDEM_AMBIENTES.filter((x) => a.ambientes.includes(x));
  protected linhas = (texto: string) => texto.split('\n');

  protected alternar(conjunto: ReturnType<typeof signal<Set<string>>>, chave: string): void {
    conjunto.update((atual) => {
      const novo = new Set(atual);
      if (!novo.delete(chave)) novo.add(chave);
      return novo;
    });
  }

  /** Abre o modelo e rola até ele. */
  protected irParaModelo(nome: string): void {
    this.aba.set('documentacao');
    this.modelosAbertos.update((atual) => new Set(atual).add(nome));
    setTimeout(() => document.getElementById(`modelo-${nome}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  protected trocarVersao(versao: string): void {
    void this.router.navigate(['/catalogo/apis', this.apiId(), versao], { queryParams: { aba: this.aba(), ...this.retorno() } });
  }

  protected voltar(): void {
    void this.router.navigate(['/catalogo/apis'], { queryParams: this.retorno() });
  }

  protected copiar(texto: string): void {
    void navigator.clipboard.writeText(texto);
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }
}
