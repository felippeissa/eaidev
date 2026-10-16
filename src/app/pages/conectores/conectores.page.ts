import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { listarProjetos } from '@/lib/projeto-store';
import { todosConectores } from '@/mocks/agentic';
import type { Conector, McpFerramenta, Projeto } from '@/types';

type FiltroTipo = 'Todos' | 'Serviço' | 'MCP';
type Teste = 'ocioso' | 'testando' | 'sucesso' | 'falha';
type Mcp = NonNullable<Conector['mcp']>;
type Severidade = 'success' | 'secondary' | 'warn' | 'danger';

const STATUS: Record<string, { severidade: Severidade; icone: string }> = {
  Conectado: { severidade: 'success', icone: 'pi pi-check-circle' },
  Desconectado: { severidade: 'secondary', icone: 'pi pi-link' },
  'Aguardando autorização': { severidade: 'warn', icone: 'pi pi-clock' },
  Falha: { severidade: 'danger', icone: 'pi pi-exclamation-triangle' },
};

const NOVAS_FERRAMENTAS: McpFerramenta[] = [
  { nome: 'list_projects', acesso: 'Leitura', autorizada: true },
  { nome: 'get_file', acesso: 'Leitura', autorizada: true },
  { nome: 'get_merge_request', acesso: 'Leitura', autorizada: true },
  { nome: 'create_merge_request', acesso: 'Escrita', autorizada: false },
  { nome: 'delete_repository', acesso: 'Escrita', autorizada: false },
];

@Component({
  selector: 'app-conectores',
  imports: [FormsModule, PageHeader, Avatar, Button, Card, Checkbox, Dialog, Drawer, InputText, Message, Select, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Textarea, ToggleSwitch],
  template: `
    <app-page-header titulo="Conectores" [trilha]="[{ label: 'Integrações' }, { label: 'Conectores' }]">
      <p-button label="Adicionar conector" (onClick)="abrirCadastro()" />
    </app-page-header>

    <p-tabs [value]="filtro()" (valueChange)="mudarFiltro($any($event))" class="filtros-tipo">
      <p-tablist>
        <p-tab value="Todos">Todos ({{ contagem('Todos') }})</p-tab>
        <p-tab value="Serviço">Serviços ({{ contagem('Serviço') }})</p-tab>
        <p-tab value="MCP">Servidores MCP ({{ contagem('MCP') }})</p-tab>
      </p-tablist>
    </p-tabs>

    <div class="grade">
      @for (c of lista(); track c.id) {
        <p-card>
          <ng-template #header>
            <div class="topo"><p-avatar [icon]="c.mcp ? 'pi pi-server' : 'pi pi-link'" shape="square" size="large" /><p-tag [value]="c.status" [severity]="status(c.status).severidade" [icon]="status(c.status).icone" /></div>
          </ng-template>
          <ng-template #title><span class="titulo">{{ c.nome }} <p-tag [value]="c.mcp ? 'MCP' : 'Serviço'" severity="secondary" /></span></ng-template>
          <ng-template #subtitle>{{ c.descricao }}</ng-template>
          <div class="chips">
            @for (i of itens(c).slice(0, 4); track i) { <code class="chip">{{ i }}</code> }
            @if (itens(c).length > 4) { <p-tag [value]="'+' + (itens(c).length - 4)" severity="secondary" /> }
          </div>
          @if (c.mcp; as m) {
            <div class="resumos">
              <div class="caixa"><small class="mudo">Descobertas</small><strong>{{ m.ferramentas.length }}</strong></div>
              <div class="caixa"><small class="mudo">Autorizadas</small><strong>{{ autorizadas(m) }}</strong></div>
            </div>
            <dl>
              <div><dt>Endpoint</dt><dd><code>{{ m.url }}</code></dd></div>
              <div><dt>Transporte</dt><dd>{{ m.transporte }} @if (m.transporte === 'SSE') { <p-tag value="Legado" severity="secondary" /> }</dd></div>
              <div><dt>Autenticação</dt><dd>{{ m.autenticacao }}</dd></div>
              <div><dt>Último handshake</dt><dd>{{ m.ultimoHandshake }}</dd></div>
              <div><dt>Produtos autorizados</dt><dd>{{ produtosAutorizados(m) }}</dd></div>
            </dl>
          } @else {
            <dl>
              <div><dt>Categoria</dt><dd>{{ c.categoria }}</dd></div>
              <div><dt>Conta</dt><dd>{{ c.conta ?? '—' }}</dd></div>
              <div><dt>Atualizado</dt><dd>{{ c.atualizadoEm }}</dd></div>
            </dl>
          }
          <ng-template #footer>
            <div class="acoes">
              <p-button [label]="c.mcp || c.status === 'Conectado' ? 'Gerenciar' : 'Conectar'" [outlined]="c.status === 'Conectado'" (onClick)="gerenciar(c)" />
              @if (c.mcp) { <p-button label="Testar" [text]="true" severity="secondary" (onClick)="testarCartao(c)" /> }
            </div>
          </ng-template>
        </p-card>
      }
    </div>

    <!-- ===== Gerenciar servidor MCP ===== -->
    <p-drawer [visible]="!!gerenciado()?.mcp" (visibleChange)="!$event && gerenciadoId.set(null)" position="right" [style]="{ width: '56rem', maxWidth: '100vw' }" [header]="gerenciado()?.nome ?? ''">
      @if (gerenciado(); as c) {
        @if (c.mcp; as m) {
          <div class="selos"><p-tag [value]="c.status" [severity]="status(c.status).severidade" /></div>
          <p class="mudo">Servidor MCP externo governado por ferramenta e projeto. Nenhuma ação realiza conexão real.</p>
          <p-tabs value="geral">
            <p-tablist>
              <p-tab value="geral">Geral</p-tab>
              <p-tab value="ferramentas">Ferramentas</p-tab>
              <p-tab value="produtos">Produtos</p-tab>
              <p-tab value="seguranca">Segurança</p-tab>
              <p-tab value="saude">Saúde</p-tab>
            </p-tablist>
            <p-tabpanels>
              <p-tabpanel value="geral">
                <div class="infos">
                  <div class="caixa"><small class="rotulo">Nome</small>{{ c.nome }}</div>
                  <div class="caixa"><small class="rotulo">Situação</small>{{ c.status }}</div>
                  <div class="caixa"><small class="rotulo">Endpoint</small><code>{{ m.url }}</code></div>
                  <div class="caixa"><small class="rotulo">Transporte</small>{{ m.transporte }}{{ m.transporte === 'SSE' ? ' · Legado' : '' }}</div>
                  <div class="caixa"><small class="rotulo">Autenticação</small>{{ m.autenticacao }}</div>
                  <div class="caixa"><small class="rotulo">Protocolo MCP</small>{{ m.saude.versaoProtocolo }}</div>
                  <div class="caixa"><small class="rotulo">Último handshake</small>{{ m.ultimoHandshake }}</div>
                  <div class="caixa"><small class="rotulo">Última verificação</small>{{ m.saude.ultimaVerificacao }}</div>
                </div>
                <div class="caixa mudo descricao">{{ c.descricao }}</div>
                <div class="linha-teste">
                  <p-button [label]="teste() === 'testando' ? 'Testando conexão...' : 'Testar conexão'" [icon]="teste() === 'testando' ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'" [disabled]="teste() === 'testando'" (onClick)="testarMcp(c)" />
                  @if (teste() === 'sucesso') { <span class="ok">Conexão simulada com sucesso.</span> }
                  @if (teste() === 'falha') { <span class="perigo">Falha simulada na conexão.</span> }
                </div>
              </p-tabpanel>

              <p-tabpanel value="ferramentas">
                <div class="resumos">
                  <div class="caixa"><small class="mudo">Ferramentas descobertas</small><strong>{{ m.ferramentas.length }}</strong></div>
                  <div class="caixa"><small class="mudo">Ferramentas autorizadas</small><strong>{{ autorizadas(m) }}</strong></div>
                </div>
                <p class="mudo">Uma ferramenta descoberta não fica automaticamente disponível na plataforma.</p>
                @for (f of m.ferramentas; track f.nome) {
                  <div class="ferramenta">
                    <p-toggleswitch [ngModel]="f.autorizada" (ngModelChange)="autorizarFerramenta(c, f.nome, $event)" [ariaLabel]="(f.autorizada ? 'Desautorizar ' : 'Autorizar ') + f.nome" />
                    <div class="corpo"><code>{{ f.nome }}</code><small class="mudo">{{ f.autorizada ? 'Disponível para governança' : 'Somente descoberta' }}</small></div>
                    <p-tag [value]="f.acesso" [severity]="f.acesso === 'Escrita' ? 'warn' : 'info'" />
                  </div>
                }
              </p-tabpanel>

              <p-tabpanel value="produtos">
                <p class="mudo">O servidor é global, mas cada produto autoriza seu uso e as ferramentas permitidas.</p>
                <div class="duas">
                  <div>
                    @for (p of projetos() ?? []; track p.id) {
                      <div class="ferramenta">
                        <p-checkbox [binary]="true" [ngModel]="vinculo(m, p.id)?.autorizado ?? false" (ngModelChange)="autorizarProduto(c, p.id, $event)" [ariaLabel]="'Autorizar ' + p.nome" />
                        <button type="button" class="corpo botao-texto" (click)="produtoAtivoId.set(p.id)">
                          <span>{{ p.nome }}</span>
                          <small class="mudo">{{ vinculo(m, p.id)?.autorizado ? vinculo(m, p.id)!.ferramentasAutorizadas.length + ' ferramenta(s) permitida(s)' : 'Não autorizado' }}</small>
                        </button>
                        @if (produtoAtivoId() === p.id) { <p-tag value="Selecionado" severity="info" /> }
                      </div>
                    }
                  </div>
                  <div class="caixa">
                    @if (produtoAtivo(); as pa) {
                      <strong>Ferramentas em {{ pa.nome }}</strong>
                      @if (!vinculo(m, pa.id)?.autorizado) {
                        <p class="mudo sem-margem">Autorize o produto antes de selecionar ferramentas.</p>
                      } @else {
                        @for (f of ferramentasAutorizadasLista(m); track f.nome) {
                          <div class="ferramenta">
                            <p-checkbox [binary]="true" [ngModel]="vinculo(m, pa.id)!.ferramentasAutorizadas.includes(f.nome)" (ngModelChange)="autorizarFerramentaNoProduto(c, pa.id, f.nome, $event)" />
                            <code class="corpo">{{ f.nome }}</code>
                            <p-tag [value]="f.acesso" [severity]="f.acesso === 'Escrita' ? 'warn' : 'info'" />
                          </div>
                        }
                      }
                    } @else {
                      <strong>Selecione um produto</strong>
                      <p class="mudo sem-margem">Escolha um produto para refinar suas permissões.</p>
                    }
                  </div>
                </div>
              </p-tabpanel>

              <p-tabpanel value="seguranca">
                <div class="infos">
                  <div class="caixa"><small class="rotulo">Autenticação</small>{{ m.autenticacao }}</div>
                  <div class="caixa"><small class="rotulo">Credencial</small>{{ m.credencial }}</div>
                </div>
                <p-message severity="info" icon="pi pi-lock" text="Credenciais sensíveis pertencem à infraestrutura institucional e nunca são exibidas neste protótipo." />
                <p-button label="Gerenciar credencial" icon="pi pi-key" [outlined]="true" [disabled]="true" styleClass="espaco-topo" />
              </p-tabpanel>

              <p-tabpanel value="saude">
                <div class="infos">
                  <div class="caixa"><small class="rotulo">Situação</small>{{ c.status }}</div>
                  <div class="caixa"><small class="rotulo">Último handshake</small>{{ m.ultimoHandshake }}</div>
                  <div class="caixa"><small class="rotulo">Última verificação</small>{{ m.saude.ultimaVerificacao }}</div>
                  <div class="caixa"><small class="rotulo">Latência</small>{{ m.saude.latenciaMs > 0 ? m.saude.latenciaMs + ' ms' : 'Indisponível' }}</div>
                  <div class="caixa"><small class="rotulo">Protocolo MCP</small>{{ m.saude.versaoProtocolo }}</div>
                </div>
                @if (m.saude.ultimoErro) { <p-message severity="error" icon="pi pi-exclamation-triangle" [text]="'Último erro: ' + m.saude.ultimoErro" /> }
              </p-tabpanel>
            </p-tabpanels>
          </p-tabs>
        }
      }
    </p-drawer>

    <!-- ===== Adicionar conector ===== -->
    <p-dialog header="Adicionar conector" [(visible)]="cadastroAberto" [modal]="true" [style]="{ width: '42rem', maxWidth: '95vw' }" (onHide)="limpar()">
      <p class="mudo">{{ cad.tipo === 'MCP' ? 'Etapa ' + (etapa() + 1) + ' de 3 · cadastro e autorização simulados' : 'Cadastro simulado de uma integração tradicional' }}</p>

      @if (etapa() === 0) {
        <div class="form">
          <div class="duas-campos">
            <div class="campo">
              <label for="c-tipo">Tipo</label>
              <p-select inputId="c-tipo" [options]="tiposCadastro" optionLabel="rotulo" optionValue="valor" [(ngModel)]="cad.tipo" [fluid]="true" appendTo="body" />
            </div>
            <div class="campo">
              <label for="c-nome">Nome</label>
              <input pInputText id="c-nome" placeholder="Ex.: GitLab MCP" [(ngModel)]="cad.nome" [fluid]="true" />
            </div>
          </div>
          <div class="campo">
            <label for="c-desc">Descrição</label>
            <textarea pTextarea id="c-desc" rows="3" placeholder="Descreva a capacidade disponibilizada pela integração." [(ngModel)]="cad.descricao" [fluid]="true"></textarea>
          </div>
          @if (cad.tipo === 'MCP') {
            <div class="campo">
              <label for="c-end">Endpoint</label>
              <input pInputText id="c-end" placeholder="https://servidor.exemplo.gov.br/mcp" [(ngModel)]="cad.endpoint" [fluid]="true" />
            </div>
            <div class="duas-campos">
              <div class="campo">
                <label for="c-transp">Transporte</label>
                <p-select inputId="c-transp" [options]="transportes" optionLabel="rotulo" optionValue="valor" [(ngModel)]="cad.transporte" [fluid]="true" appendTo="body" />
              </div>
              <div class="campo">
                <label for="c-auth">Autenticação</label>
                <p-select inputId="c-auth" [options]="autenticacoes" [(ngModel)]="cad.autenticacao" [fluid]="true" appendTo="body" />
              </div>
            </div>
          }
        </div>
      }

      @if (etapa() === 1 && cad.tipo === 'MCP') {
        <div class="form">
          <div class="linha-teste">
            <p-button [label]="cadTeste() === 'testando' ? 'Testando conexão...' : 'Testar e descobrir ferramentas'" [icon]="cadTeste() === 'testando' ? 'pi pi-spin pi-spinner' : 'pi pi-wrench'" [disabled]="cadTeste() === 'testando'" (onClick)="testarCadastro()" />
            @if (cadTeste() === 'sucesso') { <span class="ok">Conexão simulada com sucesso.</span> }
          </div>
          @if (cadTeste() === 'sucesso') {
            <div class="resumos">
              <div class="caixa"><small class="mudo">Descobertas</small><strong>{{ cad.ferramentas.length }}</strong></div>
              <div class="caixa"><small class="mudo">Autorizadas</small><strong>{{ cadAutorizadas() }}</strong></div>
            </div>
            <p class="mudo sem-margem">Uma ferramenta descoberta não fica automaticamente disponível na plataforma.</p>
            <div class="rolagem">
              @for (f of cad.ferramentas; track f.nome) {
                <div class="ferramenta">
                  <p-toggleswitch [ngModel]="f.autorizada" (ngModelChange)="alternarFerramentaCadastro(f.nome, $event)" />
                  <code class="corpo">{{ f.nome }}</code>
                  <p-tag [value]="f.acesso" [severity]="f.acesso === 'Escrita' ? 'warn' : 'info'" />
                </div>
              }
            </div>
          }
        </div>
      }

      @if (etapa() === 2 && cad.tipo === 'MCP') {
        <div class="form">
          <p-message severity="info" icon="pi pi-shield" text="Servidor cadastrado não significa disponibilidade global. Selecione os produtos autorizados." />
          <div class="rolagem">
            @for (p of projetos() ?? []; track p.id) {
              <div class="ferramenta">
                <p-checkbox [binary]="true" [inputId]="'cp-' + p.id" [ngModel]="cad.produtos.includes(p.id)" (ngModelChange)="alternarProdutoCadastro(p.id, $event)" />
                <label [for]="'cp-' + p.id" class="corpo botao-texto"><span>{{ p.nome }}</span><small class="mudo">{{ p.codigo }}</small></label>
              </div>
            }
          </div>
        </div>
      }

      <ng-template #footer>
        <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="cadastroAberto = false" />
        @if (cad.tipo === 'Serviço') {
          <p-button label="Adicionar serviço" [disabled]="!dadosValidos()" (onClick)="concluir()" />
        } @else {
          @if (etapa() > 0) { <p-button label="Voltar" severity="secondary" [outlined]="true" (onClick)="etapa.set(etapa() - 1)" /> }
          @if (etapa() < 2) {
            <p-button label="Continuar" [disabled]="!dadosValidos() || (etapa() === 1 && cadTeste() !== 'sucesso')" (onClick)="etapa.set(etapa() + 1)" />
          } @else {
            <p-button label="Concluir cadastro" (onClick)="concluir()" />
          }
        }
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .filtros-tipo {
        display: block;
        margin-bottom: 1rem;
        --p-tabs-tablist-background: transparent;
      }
      .grade {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }
      .topo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem 1rem 0;
      }
      .titulo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        margin-bottom: 0.75rem;
      }
      .chip {
        max-width: 100%;
        padding: 0.125rem 0.5rem;
        border-radius: 6px;
        background: var(--p-content-hover-background);
        font-size: 0.7rem;
        color: var(--p-text-muted-color);
        word-break: break-all;
      }
      .resumos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .caixa {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .caixa strong {
        font-size: 1.25rem;
      }
      .caixa code {
        word-break: break-all;
        font-size: 0.75rem;
      }
      dl {
        margin: 0;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.25rem 0;
      }
      dd {
        margin: 0;
        min-width: 0;
        text-align: right;
        color: var(--p-text-color);
      }
      dd code {
        word-break: break-all;
        font-size: 0.7rem;
      }
      .acoes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .selos {
        margin-bottom: 0.75rem;
      }
      .infos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .rotulo {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--p-text-muted-color);
      }
      .descricao {
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }
      .linha-teste {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .ferramenta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        margin-bottom: 0.5rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .corpo {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        word-break: break-all;
      }
      .botao-texto {
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        word-break: normal;
      }
      .duas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }
      .duas-campos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .rolagem {
        max-height: 17rem;
        overflow-y: auto;
        padding-right: 0.25rem;
      }
      :host ::ng-deep .espaco-topo {
        margin-top: 1rem;
      }
      .ok {
        color: var(--p-green-600);
        font-size: 0.875rem;
      }
      .perigo {
        color: var(--p-red-600);
        font-size: 0.875rem;
      }
      .sem-margem {
        margin: 0;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      @media (max-width: 1300px) {
        .grade {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 800px) {
        .grade,
        .duas,
        .duas-campos,
        .infos {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ConectoresPage {
  private readonly router = inject(Router);
  private readonly mensagens = inject(MessageService);

  /** Vem da rota (`?tipo=`), como no app em React. */
  readonly tipo = input<string | undefined>(undefined);

  protected readonly conectores = signal<Conector[]>([]);
  protected readonly projetos = carregar<Projeto[]>(() => listarProjetos());
  protected readonly filtro = signal<FiltroTipo>('Todos');
  protected readonly gerenciadoId = signal<string | null>(null);
  protected readonly produtoAtivoId = signal<string | null>(null);
  protected readonly teste = signal<Teste>('ocioso');
  protected cadastroAberto = false;

  protected readonly lista = computed(() => this.conectores().filter((c) => this.filtro() === 'Todos' || c.tipo === this.filtro()));
  protected readonly gerenciado = computed(() => this.conectores().find((c) => c.id === this.gerenciadoId()));
  protected readonly produtoAtivo = computed(() => (this.projetos() ?? []).find((p) => p.id === this.produtoAtivoId()));

  protected readonly tiposCadastro = [
    { valor: 'MCP', rotulo: 'Servidor MCP' },
    { valor: 'Serviço', rotulo: 'Serviço' },
  ];
  protected readonly transportes = [
    { valor: 'Streamable HTTP', rotulo: 'Streamable HTTP' },
    { valor: 'stdio', rotulo: 'stdio' },
    { valor: 'SSE', rotulo: 'SSE legado' },
  ];
  protected readonly autenticacoes = ['OAuth 2.1', 'API Key', 'Nenhuma'];

  /* ----- cadastro ----- */
  protected readonly etapa = signal(0);
  protected readonly cadTeste = signal<Teste>('ocioso');
  protected cad = this.cadastroVazio();

  constructor() {
    void atraso(todosConectores).then((lista) => this.conectores.set(lista));
    effect(() => {
      const v = this.tipo();
      this.filtro.set(v === 'MCP' || v === 'Serviço' ? v : 'Todos');
    });
  }

  private cadastroVazio() {
    return {
      tipo: 'MCP' as 'MCP' | 'Serviço',
      nome: '',
      descricao: '',
      endpoint: '',
      transporte: 'Streamable HTTP' as Mcp['transporte'],
      autenticacao: 'OAuth 2.1' as Mcp['autenticacao'],
      ferramentas: NOVAS_FERRAMENTAS.map((f) => ({ ...f })),
      produtos: [] as string[],
    };
  }

  protected status = (s: string) => STATUS[s] ?? STATUS['Desconectado']!;
  protected itens = (c: Conector) => c.mcp?.ferramentas.map((f) => f.nome) ?? c.escopos;
  protected autorizadas = (m: Mcp) => m.ferramentas.filter((f) => f.autorizada).length;
  protected produtosAutorizados = (m: Mcp) => m.projetos.filter((p) => p.autorizado).length;
  protected vinculo = (m: Mcp, projetoId: string) => m.projetos.find((v) => v.projetoId === projetoId);
  protected ferramentasAutorizadasLista = (m: Mcp) => m.ferramentas.filter((f) => f.autorizada);
  protected contagem = (f: FiltroTipo) => (f === 'Todos' ? this.conectores().length : this.conectores().filter((c) => c.tipo === f).length);
  protected readonly cadAutorizadas = computed(() => this.cad.ferramentas.filter((f) => f.autorizada).length);
  protected dadosValidos = () => this.cad.nome.trim().length > 2 && (this.cad.tipo === 'Serviço' || this.cad.endpoint.trim().length > 8);

  protected mudarFiltro(valor: FiltroTipo): void {
    this.filtro.set(valor);
    void this.router.navigate([], { queryParams: { tipo: valor === 'Todos' ? null : valor }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected gerenciar(c: Conector): void {
    if (c.mcp) {
      this.teste.set('ocioso');
      this.produtoAtivoId.set(null);
      this.gerenciadoId.set(c.id);
    } else {
      this.mensagens.add({ severity: 'info', summary: 'Gerenciamento simulado', detail: `${c.nome} não é alterado de verdade neste protótipo.` });
    }
  }

  protected testarCartao(c: Conector): void {
    this.mensagens.add({ severity: 'info', summary: `Testando ${c.nome}...` });
    setTimeout(() => this.mensagens.add({ severity: 'success', summary: 'Teste de conexão concluído', detail: `${c.nome} respondeu como esperado.` }), 700);
  }

  private atualizar(proximo: Conector): void {
    this.conectores.update((lista) => lista.map((c) => (c.id === proximo.id ? proximo : c)));
  }

  private atualizarMcp(c: Conector, mcp: Mcp): void {
    this.atualizar({ ...c, mcp, atualizadoEm: 'Agora' });
  }

  protected testarMcp(c: Conector): void {
    const mcp = c.mcp;
    if (!mcp) return;
    this.teste.set('testando');
    setTimeout(() => {
      const falhou = c.status === 'Falha';
      this.teste.set(falhou ? 'falha' : 'sucesso');
      this.atualizarMcp(c, { ...mcp, ultimoHandshake: falhou ? mcp.ultimoHandshake : 'Agora', saude: { ...mcp.saude, ultimaVerificacao: 'Agora', latenciaMs: falhou ? 0 : 72, ultimoErro: falhou ? mcp.saude.ultimoErro : undefined } });
      if (falhou) this.mensagens.add({ severity: 'error', summary: 'Não foi possível testar a conexão', detail: 'Revise a URL e a credencial antes de tentar de novo.' });
      else this.mensagens.add({ severity: 'success', summary: 'Conexão testada com sucesso', detail: 'O conector respondeu como esperado.' });
    }, 900);
  }

  protected autorizarFerramenta(c: Conector, nome: string, autorizada: boolean): void {
    const mcp = c.mcp;
    if (!mcp) return;
    this.atualizarMcp(c, {
      ...mcp,
      ferramentas: mcp.ferramentas.map((f) => (f.nome === nome ? { ...f, autorizada } : f)),
      projetos: mcp.projetos.map((v) => ({ ...v, ferramentasAutorizadas: autorizada ? v.ferramentasAutorizadas : v.ferramentasAutorizadas.filter((f) => f !== nome) })),
    });
  }

  protected autorizarProduto(c: Conector, projetoId: string, autorizado: boolean): void {
    const mcp = c.mcp;
    if (!mcp) return;
    const existe = mcp.projetos.some((v) => v.projetoId === projetoId);
    const projetos = existe
      ? mcp.projetos.map((v) => (v.projetoId === projetoId ? { ...v, autorizado, ferramentasAutorizadas: autorizado ? v.ferramentasAutorizadas : [] } : v))
      : [...mcp.projetos, { projetoId, autorizado, ferramentasAutorizadas: [] }];
    this.atualizarMcp(c, { ...mcp, projetos });
    if (autorizado) this.produtoAtivoId.set(projetoId);
  }

  protected autorizarFerramentaNoProduto(c: Conector, projetoId: string, nome: string, autorizada: boolean): void {
    const mcp = c.mcp;
    if (!mcp) return;
    this.atualizarMcp(c, {
      ...mcp,
      projetos: mcp.projetos.map((v) => (v.projetoId === projetoId ? { ...v, ferramentasAutorizadas: autorizada ? [...new Set([...v.ferramentasAutorizadas, nome])] : v.ferramentasAutorizadas.filter((f) => f !== nome) } : v)),
    });
  }

  /* ----- cadastro de conector ----- */

  protected abrirCadastro(): void {
    this.limpar();
    this.cadastroAberto = true;
  }

  protected limpar(): void {
    this.etapa.set(0);
    this.cadTeste.set('ocioso');
    this.cad = this.cadastroVazio();
  }

  protected testarCadastro(): void {
    this.cadTeste.set('testando');
    setTimeout(() => {
      this.cadTeste.set('sucesso');
      this.mensagens.add({ severity: 'success', summary: 'Conector vinculado', detail: 'As ferramentas expostas pelo servidor foram descobertas.' });
    }, 900);
  }

  protected alternarFerramentaCadastro(nome: string, autorizada: boolean): void {
    this.cad = { ...this.cad, ferramentas: this.cad.ferramentas.map((f) => (f.nome === nome ? { ...f, autorizada } : f)) };
  }

  protected alternarProdutoCadastro(id: string, autorizado: boolean): void {
    this.cad = { ...this.cad, produtos: autorizado ? [...this.cad.produtos, id] : this.cad.produtos.filter((p) => p !== id) };
  }

  protected concluir(): void {
    const agora = 'Agora';
    const id = `conector-${Date.now()}`;
    const c = this.cad;
    const conector: Conector =
      c.tipo === 'MCP'
        ? {
            id,
            nome: c.nome.trim(),
            tipo: 'MCP',
            categoria: 'MCP',
            descricao: c.descricao.trim() || 'Servidor MCP externo cadastrado no protótipo.',
            escopos: [],
            status: 'Conectado',
            conta: c.endpoint.trim(),
            atualizadoEm: agora,
            mcp: {
              url: c.endpoint.trim(),
              transporte: c.transporte,
              autenticacao: c.autenticacao,
              credencial: c.autenticacao === 'Nenhuma' ? 'Não utiliza credencial' : 'Gerenciada pelo cofre institucional',
              ferramentas: c.ferramentas,
              projetos: (this.projetos() ?? []).map((p) => ({
                projetoId: p.id,
                autorizado: c.produtos.includes(p.id),
                ferramentasAutorizadas: c.produtos.includes(p.id) ? c.ferramentas.filter((f) => f.autorizada).map((f) => f.nome) : [],
              })),
              ultimoHandshake: agora,
              saude: { ultimaVerificacao: agora, latenciaMs: 72, versaoProtocolo: '2025-03-26' },
            },
          }
        : {
            id,
            nome: c.nome.trim(),
            tipo: 'Serviço',
            categoria: 'Gestão',
            descricao: c.descricao.trim() || 'Integração tradicional cadastrada no protótipo.',
            escopos: [],
            status: 'Conectado',
            atualizadoEm: agora,
          };
    this.conectores.update((lista) => [conector, ...lista]);
    if (conector.tipo === 'MCP') {
      this.mudarFiltro('MCP');
      this.gerenciar(conector);
    }
    this.mensagens.add({ severity: 'success', summary: `${c.tipo === 'MCP' ? 'Servidor MCP' : 'Serviço'} adicionado`, detail: 'Ele já aparece na lista de conectores do produto.' });
    this.cadastroAberto = false;
  }
}
