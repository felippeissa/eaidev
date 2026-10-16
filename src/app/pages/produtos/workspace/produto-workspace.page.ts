import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { PageHeader } from '../../../layout/page-header.component';
import { RepositoriosDoProduto } from '../../../shared/repositorios-do-produto.component';
import { DocExplorer } from '../../../shared/doc-explorer.component';
import { StatCard } from '../../../shared/stat-card.component';
import { StatusTag } from '../../../shared/status-tag.component';
import { buscarRepositorios, listarDocumentos, obterDetalhe, obterProjeto, salvarRepositorios } from '@/lib/projeto-store';
import { listarSpecs } from '@/lib/spec-store';
import type { Projeto } from '@/types';
import type { Spec, SpecFeature, SpecImplementationStatus } from '@/types/spdd';
import type { DocumentoProjeto, ProjetoDetalhe, Repositorio } from '@/types/workspace';

const IMPLEMENTACAO: Record<SpecImplementationStatus, { rotulo: string; severidade: 'secondary' | 'info' | 'success' | 'warn' | 'danger' }> = {
  'NOT STARTED': { rotulo: 'Não iniciado', severidade: 'secondary' },
  'IN PROGRESS': { rotulo: 'Em andamento', severidade: 'info' },
  ALIGNED: { rotulo: 'Alinhado', severidade: 'success' },
  'PARTIALLY ALIGNED': { rotulo: 'Parcialmente alinhado', severidade: 'warn' },
  'DRIFT DETECTED': { rotulo: 'Divergência detectada', severidade: 'danger' },
  'REQUIRES SPEC UPDATE': { rotulo: 'Requer atualização da especificação', severidade: 'danger' },
  VALIDATED: { rotulo: 'Validado', severidade: 'success' },
};

@Component({
  selector: 'app-produto-workspace',
  imports: [RouterLink, Card, Tabs, TabList, Tab, TabPanels, TabPanel, TableModule, Tag, PageHeader, StatusTag, RepositoriosDoProduto, DocExplorer, Button, StatCard, ProgressBar],
  template: `
    @if (projeto(); as produto) {
      <app-page-header [titulo]="produto.nome" [trilha]="[{ label: 'Produtos', routerLink: '/projetos' }, { label: produto.nome }]" />

      @if (detalhe(); as dados) {
        <p-tabs value="geral">
          <p-tablist>
            <p-tab value="geral">Visão geral</p-tab>
            <p-tab value="docs">Documentação</p-tab>
            <p-tab value="repos">Repositórios</p-tab>
            <p-tab value="specs">Especificações</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="geral">
              <div class="grade">
                <p-card>
                  <ng-template #title>
                    <span class="titulo">{{ produto.nome }} <app-status-tag [status]="produto.ativo" /></span>
                  </ng-template>
                  <ng-template #subtitle>{{ produto.descricao }}</ng-template>
                  <div class="duas">
                    <div>
                      <h4>Repositórios</h4>
                      @for (repo of dados.repositorios; track repo.id) {
                        <p class="repo"><p-tag [value]="repo.tipo" severity="secondary" /> <span class="mono">{{ repo.nome }}</span></p>
                      } @empty {
                        <p class="mudo">Nenhum repositório vinculado.</p>
                      }
                    </div>
                    <div>
                      <h4>Contexto derivado para IA</h4>
                      <app-status-tag [status]="dados.ingestao.situacao" />
                      <p>{{ dados.ingestao.documentos }} documentos</p>
                      <small class="mudo">Reconstruível a partir do wiki-repo e código · atualizado em {{ dados.ingestao.atualizadoEm }}</small>
                    </div>
                  </div>
                </p-card>

                <p-card header="Mudanças ativas" subheader="Especificações que representam mudanças neste sistema.">
                  @for (spec of specsDoProduto(); track spec.id) {
                    <a class="spec" [routerLink]="['/projetos/especificacoes', spec.id]">
                      <span><small class="mono mudo">{{ spec.codigo }}</small><br />{{ spec.titulo }}</span>
                      <small class="mudo">{{ spec.status }}</small>
                    </a>
                  } @empty {
                    <p class="mudo">Nenhuma especificação criada.</p>
                  }
                </p-card>

                <p-card header="Contexto do produto" subheader="Estado das fontes originais e do contexto derivado.">
                  <p><strong>Documentação:</strong> {{ rotuloDocs(dados) }}</p>
                  <p><strong>Repositórios:</strong> {{ dados.repositorios.length }} vinculados</p>
                  <p><strong>Contexto para IA:</strong> reconstruível a partir de Wiki e código.</p>
                </p-card>
              </div>

                <div class="resumo-impl">
                  <app-stat-card label="Funcionalidades acompanhadas" [value]="'' + features().length" icon="pi pi-list-check" />
                  <app-stat-card label="Alinhadas" [value]="'' + alinhadas()" icon="pi pi-check-circle" />
                  <app-stat-card label="Divergências detectadas" [value]="'' + divergencias()" icon="pi pi-exclamation-triangle" />
                </div>

                <p-card header="Acompanhamento da implementação" subheader="Feedback recebido da IDE/coding assistant. O EAI.dev acompanha a implementação, mas não a executa." styleClass="impl">
                  @for (spec of specsDoProduto(); track spec.id) {
                    <div class="impl-spec">
                      <div class="impl-topo">
                        <div><code class="mudo">{{ spec.codigo }}</code><br /><strong>{{ spec.titulo }}</strong></div>
                        <div class="impl-acoes">
                          <p-tag [value]="impl(spec.implementation.status).rotulo" [severity]="impl(spec.implementation.status).severidade" />
                          <p-button label="Abrir especificação" icon="pi pi-arrow-up-right" iconPos="right" [text]="true" size="small" [routerLink]="['/projetos/especificacoes', spec.id]" [queryParams]="{ stage: 'implement' }" />
                        </div>
                      </div>
                      <div class="impl-progresso"><p-progressbar [value]="spec.implementation.progress" [showValue]="false" [style]="{ height: '8px', flex: 1 }" /><small class="mudo">{{ spec.implementation.progress }}%</small></div>
                      <div class="impl-features">
                        @for (f of spec.features; track f.id) {
                          <div class="impl-feature">
                            <div class="impl-topo"><strong>{{ f.codigo }} · {{ f.nome }}</strong><p-tag [value]="impl(f.implementationStatus).rotulo" [severity]="impl(f.implementationStatus).severidade" /></div>
                            <small class="mudo">{{ atendidos(f) }}/{{ f.acceptanceCriteria.length }} critérios atendidos</small>
                          </div>
                        } @empty {
                          <small class="mudo">Esta especificação ainda não tem funcionalidades.</small>
                        }
                      </div>
                      @for (ev of spec.implementation.feedback.slice(0, 2); track ev.id) {
                        <small class="mudo bloco"><i class="pi pi-sitemap"></i> {{ ev.message }} {{ ev.repository ? '· ' + ev.repository : '' }}</small>
                      }
                      @if (spec.implementation.feedback.length > 2) {
                        <small class="mudo bloco">e mais {{ spec.implementation.feedback.length - 2 }} {{ spec.implementation.feedback.length - 2 === 1 ? 'evento' : 'eventos' }} no histórico desta especificação.</small>
                      }
                    </div>
                  } @empty {
                    <p class="mudo vazio">Nenhuma especificação em implementação. Assim que uma especificação for publicada e a IDE enviar o primeiro retorno, o acompanhamento aparece aqui.</p>
                  }
                </p-card>
            </p-tabpanel>

            <p-tabpanel value="repos">
              <p-card header="Repositórios do sistema" subheader="Componentes vinculados ao produto e seus papéis no sistema.">
                <app-repositorios-do-produto
                  [repositorios]="dados.repositorios"
                  descricao="Cada repositório tem um papel no sistema. As mudanças são gravadas na hora."
                  [buscando]="buscando()"
                  [podeDescobrir]="dados.urlRaiz.startsWith('http')"
                  [permiteGerarWiki]="(dados.onboardingCenario ?? 'wiki') !== 'wiki'"
                  [prefixo]="slug(produto.nome)"
                  [areaPadrao]="dados.grupo ?? 'smart'"
                  (mudou)="gravar($event)"
                  (descobrir)="descobrir(dados)"
                />
              </p-card>
            </p-tabpanel>

            <p-tabpanel value="specs">
              <div class="specs-topo">
                <div>
                  <h2>Especificações do produto</h2>
                  <p class="mudo">Mudanças propostas ao sistema, governadas pelo ciclo da mudança.</p>
                </div>
                <p-button label="Nova especificação" icon="pi pi-plus" routerLink="/projetos/especificacoes/nova" [queryParams]="{ produto: produto.id }" />
              </div>

              @if (specsDoProduto().length === 0) {
                <p-card><p class="vazio mudo">Nenhuma especificação criada neste projeto. Use “Nova especificação” a partir de um documento da documentação.</p></p-card>
              } @else {
                <p-card>
                  <ng-template #title>
                    <span class="titulo">Especificações do produto <p-tag [value]="'' + specsDoProduto().length" severity="secondary" [rounded]="true" /></span>
                  </ng-template>
                  <ng-template #subtitle>Fluxo SPDD com pontos de aprovação. Abra a especificação para ver fases, artefatos e prévias.</ng-template>
                  @for (spec of specsDoProduto(); track spec.id) {
                    <div class="spec-linha">
                      <div class="spec-info">
                        <strong>{{ spec.titulo }}</strong>
                        <div class="selos">
                          <p-tag [value]="spec.natureza" severity="secondary" />
                          <p-tag [value]="spec.features.length + ' Funcionalidades'" severity="contrast" [rounded]="true" />
                          <app-status-tag [status]="spec.status" />
                          <p-tag [value]="'v' + spec.versao" severity="info" />
                          @for (f of spec.fases; track f.id) {
                            <span class="ponto" [style.background]="corFase(f.estado)" [title]="f.nome + ': ' + rotuloFase(f.estado)"></span>
                          }
                        </div>
                      </div>
                      <p-button label="Abrir especificação" icon="pi pi-arrow-up-right" iconPos="right" [outlined]="true" size="small" [routerLink]="['/projetos/especificacoes', spec.id]" />
                    </div>
                  }
                </p-card>
              }
            </p-tabpanel>

            <p-tabpanel value="docs">
              <app-doc-explorer [projetoId]="produto.id" />
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      }
    } @else if (carregado()) {
      <p-card><p class="mudo">Projeto não encontrado.</p></p-card>
    }
  `,
  styles: [
    `
      /* Painel e lista de abas sem fundo próprio: o que aparece em cada aba são cartões soltos (ilhas) sobre o fundo da página. */
      p-tabs {
        --p-tabs-tabpanel-background: transparent;
        --p-tabs-tablist-background: transparent;
        --p-tabs-tabpanel-padding: 1.25rem 0 0;
      }
      .grade {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      /* Os cartões da mesma linha esticam até a altura do mais alto. */
      .grade > p-card {
        display: flex;
      }
      .grade > p-card ::ng-deep .p-card {
        flex: 1;
      }
      .grade > :first-child {
        grid-column: 1 / -1;
      }
      .duas {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: 1rem;
      }
      .titulo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      h4 {
        margin: 0 0 0.5rem;
      }
      .repo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.25rem 0;
      }
      .spec {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        color: inherit;
        text-decoration: none;
      }
      .resumo-impl {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 1rem;
      }
      :host ::ng-deep .impl {
        display: block;
        margin-top: 1rem;
      }
      .impl-spec {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .impl-topo,
      .impl-acoes,
      .impl-progresso {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .impl-progresso {
        margin: 0.75rem 0;
      }
      .impl-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }
      /* Com uma funcionalidade só, ela ocupa a linha inteira. */
      .impl-feature:only-child {
        grid-column: 1 / -1;
      }
      .impl-feature {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.625rem;
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
      }
      .bloco {
        display: block;
        margin-top: 0.5rem;
      }
      .vazio {
        text-align: center;
        padding: 1rem 0;
      }
      .specs-topo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .specs-topo h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }
      .specs-topo p {
        margin: 0.125rem 0 0;
        font-size: 0.875rem;
      }
      .spec-linha {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-top: 0.5rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .spec-info {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        min-width: 0;
      }
      .selos {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem;
      }
      .ponto {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
      }
      .acoes-topo {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 0.75rem;
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
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
export class ProdutoWorkspacePage {
  private readonly mensagens = inject(MessageService);

  /** Vem da rota (`/projetos/:id`). */
  readonly id = input.required<string>();

  protected readonly projeto = signal<Projeto | undefined>(undefined);
  protected readonly detalhe = signal<ProjetoDetalhe | undefined>(undefined);
  protected readonly specsDoProduto = signal<Spec[]>([]);
  protected readonly documentos = signal<DocumentoProjeto[]>([]);
  protected readonly carregado = signal(false);

  protected readonly features = computed(() => this.specsDoProduto().flatMap((s) => s.features));
  protected readonly alinhadas = computed(() => this.features().filter((f) => f.implementationStatus === 'ALIGNED').length);
  protected readonly divergencias = computed(() => this.features().filter((f) => f.implementationStatus === 'DRIFT DETECTED').length);
  protected corFase = (estado: string) => (estado === 'aprovada' ? 'var(--p-green-500)' : estado === 'erro' ? 'var(--p-red-500)' : estado === 'pendente' ? 'var(--p-surface-400)' : 'var(--p-yellow-500)');
  protected rotuloFase = (estado: string) => ({ pendente: 'Pendente', gerando: 'Gerando', revisao: 'Em revisão', aprovada: 'Aprovada', erro: 'Erro' } as Record<string, string>)[estado] ?? estado;
  protected impl = (status: SpecImplementationStatus) => IMPLEMENTACAO[status];
  protected atendidos = (f: SpecFeature) => f.acceptanceCriteria.filter((c) => c.status === 'met').length;
  protected readonly buscando = signal(false);

  constructor() {
    effect(() => {
      const id = this.id();
      this.carregado.set(false);
      void this.carregar(id);
    });
  }

  private async carregar(id: string): Promise<void> {
    const [projeto, detalhe, specs, docs] = await Promise.all([obterProjeto(id), obterDetalhe(id), listarSpecs(), listarDocumentos(id)]);
    this.projeto.set(projeto);
    this.detalhe.set(detalhe);
    this.specsDoProduto.set(specs.filter((spec) => spec.projetoId === id || spec.projeto === projeto?.nome));
    this.documentos.set(docs);
    this.carregado.set(true);
  }

  protected rotuloDocs(dados: ProjetoDetalhe): string {
    return dados.documentacaoStatus === 'SYNCED' ? 'Sincronizado' : dados.documentacaoStatus === 'IN REVIEW' ? 'Em revisão' : 'Rascunho';
  }

  protected slug(nome: string): string {
    return nome
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  protected async gravar(proximos: Repositorio[]): Promise<void> {
    await salvarRepositorios(this.id(), proximos);
    this.detalhe.set(await obterDetalhe(this.id()));
  }

  protected async descobrir(dados: ProjetoDetalhe): Promise<void> {
    this.buscando.set(true);
    const encontrados = await buscarRepositorios(dados.urlRaiz, dados.onboardingCenario ?? 'wiki');
    const jaTemWiki = dados.repositorios.some((repo) => repo.tipo === 'Wiki');
    const novos = encontrados.filter((repo) => !dados.repositorios.some((atual) => atual.url === repo.url) && !(repo.tipo === 'Wiki' && jaTemWiki));
    this.buscando.set(false);
    if (novos.length === 0) {
      this.mensagens.add({ severity: 'info', summary: 'Nenhum repositório novo no GitLab' });
      return;
    }
    await this.gravar([...dados.repositorios, ...novos]);
    this.mensagens.add({ severity: 'success', summary: novos.length === 1 ? '1 repositório novo vinculado' : `${novos.length} repositórios vinculados` });
  }
}
