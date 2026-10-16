import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';

import type { Repositorio, RepositorioTipo } from '@/types/workspace';

/** Host do GitLab interno: o caminho real é codigo.dev.tools.go.gov.br/smart/… */
const BASE_GITLAB = 'https://codigo.dev.tools.go.gov.br';

/**
 * Tipos de repositório, com o sufixo que cada um acrescenta ao nome. O sufixo é
 * a convenção do grupo: por ele se sabe o que o repositório é só de olhar a
 * listagem do GitLab. Wiki fica de fora — nasce pelos botões dedicados, porque
 * só pode haver uma por produto.
 */
const TIPOS: { valor: RepositorioTipo; sufixo: string }[] = [
  { valor: 'API', sufixo: 'api' },
  { valor: 'Backend', sufixo: 'backend' },
  { valor: 'Front-end', sufixo: 'frontend' },
  { valor: 'Consumer', sufixo: 'consumer' },
  { valor: 'Producer', sufixo: 'producer' },
  { valor: 'BFF', sufixo: 'bff' },
  { valor: 'Docs', sufixo: 'docs' },
  { valor: 'MCP', sufixo: 'mcp' },
];

const ROTULO: Record<RepositorioTipo, string> = {
  Wiki: 'Wiki',
  API: 'API',
  Backend: 'Back-end',
  'Front-end': 'Front-end',
  Consumer: 'Consumer',
  Producer: 'Producer',
  BFF: 'BFF',
  Docs: 'Docs',
  MCP: 'MCP',
  Outro: 'Outro',
};

const BRANCHES = ['Develop', 'master'];
const SEM_TEMPLATE = 'Vazio (sem template)';
const TEMPLATES = [SEM_TEMPLATE, 'smart-clientes-api', 'smart-sakai-primeng', 'smart-arquivos'];

interface Rascunho {
  id: string;
  area: string;
  servico: string;
  tipo: RepositorioTipo;
  template: string;
  url: string;
  branch: string;
}

const VAZIO: Rascunho = { id: '', area: '', servico: '', tipo: 'API', template: SEM_TEMPLATE, url: '', branch: 'Develop' };

const slugificar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Repositórios do produto: descobertos no GitLab ou informados à mão, na mesma
 * lista. A wiki é um caso à parte (uma só, nome fixo `{produto}-wiki`, sem
 * editar, desvincular nem arquivar). Editar um repositório só muda o tipo.
 */
@Component({
  selector: 'app-repositorios-do-produto',
  imports: [FormsModule, Button, ConfirmDialog, Dialog, InputText, Select, Tabs, TabList, Tab, TabPanels, TabPanel, Tag],
  providers: [ConfirmationService],
  template: `
    <section class="repositorios">
      <div class="topo">
        <div>
          <strong>Repositórios</strong>
          <p class="apoio">{{ descricao() }}</p>
        </div>
        <div class="botoes">
          <p-button label="Descobrir no GitLab" icon="pi pi-search" [outlined]="true" severity="secondary" [loading]="buscando()" [disabled]="buscando() || !podeDescobrir()" (onClick)="descobrir.emit()" />
          <p-button label="Novo repositório" icon="pi pi-plus" [outlined]="true" severity="secondary" (onClick)="abrirNovo()" />
          @if (!temWiki() && permiteGerarWiki()) {
            <p-button label="Gerar Wiki" icon="pi pi-sparkles" [outlined]="true" severity="secondary" (onClick)="gerarWiki()" />
            <p-button label="Vincular Wiki Existente" icon="pi pi-link" [outlined]="true" severity="secondary" (onClick)="vincularWikiAberto.set(true)" />
          }
        </div>
      </div>

      @if (repositorios().length === 0) {
        <p class="apoio">Nenhum repositório ainda. Descubra no GitLab, adicione um à mão, ou siga sem nenhum e vincule depois dentro do produto.</p>
      } @else {
        <ul class="lista">
          @for (repo of ordenados(); track repo.id) {
            <li class="item" [class.arquivado]="repo.status === 'Arquivado'">
              <div class="identificacao">
                <span class="nome">{{ repo.nome }}</span>
                <span class="url">{{ repo.url }}</span>
              </div>
              <div class="selos">
                <p-tag [value]="rotulo(repo.tipo)" [severity]="repo.tipo === 'Wiki' ? 'help' : 'info'" [rounded]="true" />
                @if (repo.validado) {
                  <p-tag value="Validado" severity="success" [rounded]="true" />
                }
                <p-tag [value]="repo.branch ?? 'Develop'" icon="pi pi-sitemap" severity="secondary" [rounded]="true" />
                <p-tag [value]="repo.origem === 'criado' ? 'Criado' : 'Vinculado'" severity="secondary" [rounded]="true" />
                @if (repo.status === 'Arquivado') {
                  <p-tag value="Arquivado" severity="secondary" [rounded]="true" />
                }
                @if (repo.tipo === 'Wiki') {
                  <span class="cadeado" [title]="repo.nome + ' é a wiki do produto e não pode ser alterada'"><i class="pi pi-lock"></i></span>
                } @else {
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" [ariaLabel]="'Editar ' + repo.nome" (onClick)="abrirEdicao(repo)" />
                  <p-button icon="pi pi-times-circle" [text]="true" severity="danger" [ariaLabel]="'Desvincular ' + repo.nome" (onClick)="confirmarDesvincular(repo)" />
                  @if (repo.status === 'Arquivado') {
                    <p-button icon="pi pi-replay" [text]="true" severity="secondary" [ariaLabel]="'Ativar ' + repo.nome" (onClick)="ativar(repo)" />
                  } @else {
                    <p-button icon="pi pi-inbox" [text]="true" severity="secondary" [ariaLabel]="'Arquivar ' + repo.nome" (onClick)="confirmarArquivar(repo)" />
                  }
                }
              </div>
            </li>
          }
        </ul>
      }
    </section>

    <p-dialog [(visible)]="aberto" [modal]="true" [header]="editando() ? 'Editar repositório' : 'Novo repositório'" [style]="{ width: '34rem' }" [draggable]="false">
      <p class="apoio">
        {{ editando() ? 'Só o tipo pode ser alterado. Os demais campos descrevem o que já está no GitLab, e reescrevê-los aqui não muda nada lá.' : 'Crie um repositório seguindo a convenção do grupo, ou vincule um que já existe pela URL.' }}
      </p>

      <p-tabs [(value)]="aba">
        <p-tablist>
          <p-tab value="criar">{{ editando() ? 'Editar repositório' : 'Criar repositório' }}</p-tab>
          <p-tab value="vincular">Vincular por URL</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="criar">
            <div class="formulario">
              <div class="campo">
                <label for="repo-area">Área de negócio (grupo GitLab) *</label>
                <input pInputText id="repo-area" placeholder="Ex: smart" [disabled]="editando()" [(ngModel)]="rascunho.area" [fluid]="true" />
              </div>
              <div class="campo">
                <label for="repo-prefixo">Prefixo do sistema</label>
                <input pInputText id="repo-prefixo" [readonly]="true" [value]="prefixo() || '—'" [fluid]="true" />
              </div>
              <div class="campo">
                <label for="repo-servico">Nome do serviço *</label>
                <input pInputText id="repo-servico" placeholder="Ex: empenhos" [disabled]="editando()" [(ngModel)]="rascunho.servico" [fluid]="true" />
              </div>
              <div class="duas-colunas">
                <div class="campo">
                  <label for="repo-tipo">Tipo</label>
                  <p-select inputId="repo-tipo" [options]="opcoesTipoCriar()" optionLabel="rotulo" optionValue="valor" [(ngModel)]="rascunho.tipo" [fluid]="true" appendTo="body" />
                </div>
                <div class="campo">
                  <label for="repo-template">Template</label>
                  <p-select inputId="repo-template" [options]="templates" [disabled]="editando()" [(ngModel)]="rascunho.template" [fluid]="true" appendTo="body" />
                </div>
              </div>
              @if (!editando()) {
                <div class="campo">
                  <label for="repo-branch">Branch principal</label>
                  <p-select inputId="repo-branch" [options]="branches" [(ngModel)]="rascunho.branch" [fluid]="true" appendTo="body" />
                </div>
              }
              <div class="campo">
                <label>{{ editando() ? 'URL do repositório' : 'Path final' }}</label>
                <code class="caminho">{{ editando() ? rascunho.url : pathFinal() || '—' }}</code>
              </div>
            </div>
          </p-tabpanel>

          <p-tabpanel value="vincular">
            <div class="formulario">
              <div class="campo">
                <label for="repo-url">URL do repositório *</label>
                <input pInputText id="repo-url" type="url" placeholder="Cole o endereço, como https://codigo.dev.tools.go.gov.br/smart/framework-dev" [disabled]="editando()" [(ngModel)]="rascunho.url" [fluid]="true" />
                <small class="apoio">O repositório é vinculado como está — nada é criado nem renomeado no GitLab.</small>
              </div>
              @if (!editando()) {
                <div class="campo">
                  <label for="repo-tipo-vincular">Tipo</label>
                  <p-select inputId="repo-tipo-vincular" [options]="opcoesTipoVincular" optionLabel="rotulo" optionValue="valor" [(ngModel)]="rascunho.tipo" [fluid]="true" appendTo="body" />
                </div>
                <div class="campo">
                  <label for="repo-branch-vincular">Branch principal</label>
                  <p-select inputId="repo-branch-vincular" [options]="branches" [(ngModel)]="rascunho.branch" [fluid]="true" appendTo="body" />
                </div>
              }
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>

      <ng-template #footer>
        <p-button label="Cancelar" [outlined]="true" severity="secondary" (onClick)="aberto = false" />
        <p-button [label]="editando() ? 'Salvar alterações' : aba === 'criar' ? 'Adicionar repositório' : 'Vincular repositório'" [disabled]="!valido()" (onClick)="salvar()" />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="vincularWikiVisivel" [modal]="true" header="Vincular Wiki Existente" [style]="{ width: '34rem' }" [draggable]="false">
      <p class="apoio">Cole o endereço da wiki que já existe no GitLab. Ela entra na lista como <code>{{ nomeWiki() }}</code>, o nome que toda wiki tem aqui.</p>
      <div class="campo">
        <label for="wiki-url">URL da wiki *</label>
        <input pInputText id="wiki-url" type="url" placeholder="Cole o endereço, como https://codigo.dev.tools.go.gov.br/smart/framework-dev/wikis" [(ngModel)]="urlWiki" [fluid]="true" />
      </div>
      <ng-template #footer>
        <p-button label="Cancelar" [outlined]="true" severity="secondary" (onClick)="vincularWikiAberto.set(false)" />
        <p-button label="Vincular wiki" icon="pi pi-book" [disabled]="!urlWiki.trim().startsWith('http')" (onClick)="vincularWiki()" />
      </ng-template>
    </p-dialog>

    <p-confirmdialog />
  `,
  styles: [
    `
      .repositorios {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .topo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .topo p {
        margin: 0.125rem 0 0;
      }
      .botoes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .apoio {
        color: var(--p-text-muted-color);
        font-size: 0.875rem;
      }
      .lista {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .item.arquivado {
        opacity: 0.6;
      }
      .identificacao {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .nome {
        font-weight: 500;
      }
      .url {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
        word-break: break-all;
      }
      .selos {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .cadeado {
        display: inline-flex;
        justify-content: center;
        width: 7rem;
        color: var(--p-text-muted-color);
      }
      .formulario {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 1rem;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .duas-colunas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .caminho {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        word-break: break-all;
        font-size: 0.8125rem;
      }
    `,
  ],
})
export class RepositoriosDoProduto {
  private readonly confirmacao = inject(ConfirmationService);

  readonly repositorios = input.required<Repositorio[]>();
  readonly descricao = input.required<string>();
  readonly buscando = input(false);
  readonly podeDescobrir = input(false);
  /** Falso no cenário "O sistema já tem wiki": ela chega por "Descobrir no GitLab", não é gerada aqui. */
  readonly permiteGerarWiki = input(true);
  /** Slug do produto, que prefixa o nome de cada serviço. */
  readonly prefixo = input('');
  readonly areaPadrao = input('smart');

  readonly mudou = output<Repositorio[]>();
  readonly descobrir = output<void>();

  protected readonly branches = BRANCHES;
  protected readonly templates = TEMPLATES;
  protected readonly opcoesTipoVincular = [...TIPOS.map((t) => ({ valor: t.valor, rotulo: ROTULO[t.valor] })), { valor: 'Outro' as RepositorioTipo, rotulo: ROTULO.Outro }];

  protected aberto = false;
  protected aba: 'criar' | 'vincular' = 'criar';
  protected rascunho: Rascunho = { ...VAZIO };

  protected readonly vincularWikiAberto = signal(false);
  protected get vincularWikiVisivel(): boolean {
    return this.vincularWikiAberto();
  }
  protected set vincularWikiVisivel(valor: boolean) {
    this.vincularWikiAberto.set(valor);
  }
  protected urlWiki = '';

  protected readonly temWiki = computed(() => this.repositorios().some((repo) => repo.tipo === 'Wiki'));
  protected readonly nomeWiki = computed(() => `${this.prefixo() || 'produto'}-wiki`);

  /** Arquivado desce para o fim da lista; o `sort` é estável, então a ordem dentro de cada grupo se mantém. */
  protected readonly ordenados = computed(() =>
    [...this.repositorios()].sort((a, b) => (a.status === 'Arquivado' ? 1 : 0) - (b.status === 'Arquivado' ? 1 : 0)),
  );

  protected editando = () => this.rascunho.id.length > 0;
  protected rotulo = (tipo: RepositorioTipo) => ROTULO[tipo];

  /** Um repositório editado pode ter um tipo que não está mais na lista; ele continua como opção para o seletor não abrir em branco. */
  protected opcoesTipoCriar = () => {
    const base = [...TIPOS.map((t) => ({ valor: t.valor, rotulo: `${ROTULO[t.valor]} (-${t.sufixo})` })), { valor: 'Outro' as RepositorioTipo, rotulo: ROTULO.Outro }];
    const atual = this.rascunho.tipo;
    return base.some((o) => o.valor === atual) ? base : [...base, { valor: atual, rotulo: ROTULO[atual] }];
  };

  private sufixo = () => TIPOS.find((t) => t.valor === this.rascunho.tipo)?.sufixo ?? '';
  private nomeRepo = () => [this.prefixo(), slugificar(this.rascunho.servico), this.sufixo()].filter(Boolean).join('-');
  protected pathFinal = () => {
    const area = slugificar(this.rascunho.area);
    return area && slugificar(this.rascunho.servico) ? `${area}/${this.nomeRepo()}` : '';
  };
  private urlColada = () => this.rascunho.url.trim().replace(/\/$/, '');
  private nomeDaUrl = () => this.urlColada().split('/').pop() ?? '';

  protected valido = () =>
    this.aba === 'criar'
      ? slugificar(this.rascunho.area).length > 0 && slugificar(this.rascunho.servico).length > 0
      : this.urlColada().startsWith('http') && this.nomeDaUrl().length > 0;

  abrirNovo(): void {
    this.rascunho = { ...VAZIO, area: this.areaPadrao() };
    this.aba = 'criar';
    this.aberto = true;
  }

  abrirEdicao(repo: Repositorio): void {
    // Desmonta o caminho de volta nos campos; o que não segue a convenção vira o nome do serviço.
    const partes = repo.url.replace(/^https?:\/\//, '').split('/').slice(1);
    const ultimo = partes.pop() ?? '';
    const prefixo = this.prefixo();
    const segueConvencao = prefixo.length > 0 && ultimo.startsWith(`${prefixo}-`);
    const sufixoDoTipo = TIPOS.find((t) => t.valor === repo.tipo)?.sufixo;
    const semPrefixo = segueConvencao ? ultimo.slice(prefixo.length + 1) : ultimo;
    const semSufixo = sufixoDoTipo && semPrefixo.endsWith(`-${sufixoDoTipo}`) ? semPrefixo.slice(0, -(sufixoDoTipo.length + 1)) : semPrefixo;
    this.rascunho = { id: repo.id, area: partes.join('/'), servico: semSufixo, tipo: repo.tipo, template: SEM_TEMPLATE, url: repo.url, branch: repo.branch ?? 'Develop' };
    this.aba = segueConvencao ? 'criar' : 'vincular';
    this.aberto = true;
  }

  salvar(): void {
    if (this.editando()) {
      // Só o tipo muda: recompor nome e URL a partir dos campos travados renomearia o repositório sem ninguém mexer neles.
      this.mudou.emit(this.repositorios().map((repo) => (repo.id === this.rascunho.id ? { ...repo, tipo: this.rascunho.tipo } : repo)));
      this.aberto = false;
      return;
    }
    const dados =
      this.aba === 'criar'
        ? { nome: this.nomeRepo(), url: `${BASE_GITLAB}/${this.pathFinal()}`, tipo: this.rascunho.tipo }
        : { nome: this.nomeDaUrl(), url: this.urlColada(), tipo: this.rascunho.tipo };
    const novo: Repositorio = {
      id: `repo-manual-${Date.now()}`,
      ...dados,
      // Validado é o que o GitLab confirmou existir; o que foi digitado ainda não foi conferido.
      validado: false,
      origem: this.aba === 'criar' ? 'criado' : 'vinculado',
      branch: this.rascunho.branch,
    };
    this.mudou.emit([...this.repositorios(), novo]);
    this.aberto = false;
  }

  ativar(repo: Repositorio): void {
    this.mudou.emit(this.repositorios().map((item) => (item.id === repo.id ? { ...item, status: 'Ativo' as const } : item)));
  }

  gerarWiki(): void {
    const nome = this.nomeWiki();
    this.mudou.emit([
      ...this.repositorios(),
      { id: `repo-wiki-${Date.now()}`, nome, url: `${BASE_GITLAB}/${this.areaPadrao()}/${nome}`, tipo: 'Wiki', validado: false, origem: 'criado', branch: 'Develop' },
    ]);
  }

  vincularWiki(): void {
    const url = this.urlWiki.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) return;
    this.mudou.emit([
      ...this.repositorios(),
      { id: `repo-wiki-${Date.now()}`, nome: this.nomeWiki(), url, tipo: 'Wiki', validado: false, origem: 'vinculado', branch: 'Develop' },
    ]);
    this.urlWiki = '';
    this.vincularWikiAberto.set(false);
  }

  confirmarDesvincular(repo: Repositorio): void {
    this.confirmacao.confirm({
      header: `Desvincular ${repo.nome}?`,
      message: 'O repositório sai da lista deste produto. Nada é apagado no GitLab, e você pode vinculá-lo de novo quando quiser.',
      acceptLabel: 'Desvincular repositório',
      rejectLabel: 'Manter vinculado',
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.mudou.emit(this.repositorios().filter((item) => item.id !== repo.id)),
    });
  }

  confirmarArquivar(repo: Repositorio): void {
    this.confirmacao.confirm({
      header: `Arquivar ${repo.nome}?`,
      message: 'O repositório vai para o fim da lista, esmaecido, e continua vinculado ao produto — só sai de circulação. Você pode reativá-lo depois pela mesma linha.',
      acceptLabel: 'Arquivar repositório',
      rejectLabel: 'Manter ativo',
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.mudou.emit(this.repositorios().map((item) => (item.id === repo.id ? { ...item, status: 'Arquivado' as const } : item))),
    });
  }
}
