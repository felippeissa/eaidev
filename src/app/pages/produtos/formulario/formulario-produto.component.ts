import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { RepositoriosDoProduto } from '../../../shared/repositorios-do-produto.component';
import { lerSessao } from '@/lib/auth';
import { atualizarProjeto, buscarRepositorios, criarProjeto, salvarRepositorios } from '@/lib/projeto-store';
import type { Projeto } from '@/types';
import type { OnboardingCenario, ProjetoDetalhe, Repositorio } from '@/types/workspace';

/** Nome do produto vira path de GitLab, e um path longo demais atrapalha o grupo inteiro. */
const NOME_MAX = 80;

/** Host do GitLab interno e grupo do time: nenhum dos dois é escolhido por produto. */
const BASE_GITLAB = 'https://codigo.dev.tools.go.gov.br';
const GRUPO = 'smart';

const CENARIOS: { valor: OnboardingCenario; rotulo: string }[] = [
  { valor: 'wiki', rotulo: 'O sistema já tem wiki' },
  { valor: 'legado-sem-wiki', rotulo: 'Repositório existente, sem wiki' },
  { valor: 'greenfield', rotulo: 'Produto novo, começa do zero' },
];

const DESCRICAO_REPOS: Record<OnboardingCenario, string> = {
  wiki: 'O repositório de wiki alimenta a documentação oficial do produto.',
  'legado-sem-wiki': 'O código é lido para gerar um rascunho de documentação para revisão.',
  greenfield: 'Nada foi criado ainda: adicione à mão o que já souber, ou vincule depois.',
};

const EXPLICACAO: Record<OnboardingCenario, string> = {
  wiki: 'A documentação oficial é importada da wiki e o produto abre pronto para especificar.',
  'legado-sem-wiki': 'O repositório já existe e a wiki será criada nele. O código gera um rascunho de documentação para você revisar.',
  greenfield: 'O repositório e a wiki são criados no GitLab, e o produto abre pela escrita da documentação.',
};

const slugificar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * O mesmo formulário serve para criar e para editar. Na edição só nome,
 * descrição e repositórios mudam; cenário e URL ficam visíveis e bloqueados,
 * porque já produziram efeito (o repositório foi criado, a wiki importada).
 */
@Component({
  selector: 'app-formulario-produto',
  imports: [FormsModule, Card, Button, ConfirmDialog, InputText, Select, Textarea, RepositoriosDoProduto],
  providers: [ConfirmationService],
  template: `
    <p-card>
      <div class="formulario">
        <div class="campo">
          <label for="nome">Nome do produto <span class="obrigatorio" aria-hidden="true">*</span></label>
          <input pInputText id="nome" placeholder="Digite o nome do sistema" [ngModel]="nome()" (ngModelChange)="nome.set($event)" [class.ng-invalid]="nomeExcede()" [class.ng-dirty]="nomeExcede()" [fluid]="true" />
          <small [class.excedeu]="nomeExcede()">
            {{ nome().length }}/{{ nomeMax }} caracteres{{ nomeExcede() ? ' — reduza para poder salvar.' : '' }}
          </small>
        </div>

        <div class="campo">
          <label for="descricao">Descrição <span class="obrigatorio" aria-hidden="true">*</span></label>
          <textarea pTextarea id="descricao" rows="3" placeholder="O que este produto entrega e para quem." [ngModel]="descricao()" (ngModelChange)="descricao.set($event)" [fluid]="true"></textarea>
        </div>

        <div class="cenario">
          <div class="campo">
            <label for="cenario">Cenário de entrada</label>
            <p-select inputId="cenario" [options]="cenarios" optionLabel="rotulo" optionValue="valor" [disabled]="edicao()" [ngModel]="cenario()" (ngModelChange)="mudarCenario($event)" [fluid]="true" />
            <small class="apoio">{{ explicacao() }}</small>
          </div>

          @if (cenario() !== 'greenfield') {
            <div class="campo">
              <label for="url-raiz">URL do {{ cenario() === 'wiki' ? 'produto' : 'repositório' }} no GitLab <span class="obrigatorio" aria-hidden="true">*</span></label>
              <input pInputText id="url-raiz" type="url" placeholder="Cole o endereço, como https://codigo.dev.tools.go.gov.br/smart/framework-dev" [disabled]="edicao()" [ngModel]="urlRaiz()" (ngModelChange)="urlRaiz.set($event)" [fluid]="true" />
              <small class="apoio">{{ cenario() === 'wiki' ? 'A partir dela o EAI Dev encontra o produto e os repositórios.' : 'O repositório é lido como está; nada nele é alterado além da wiki.' }}</small>
            </div>
          }

          @if (caminhosCriados().length > 0) {
            <div class="campo">
              <label>{{ caminhosCriados().length > 1 ? 'Serão criados' : 'Será criada' }}</label>
              <ul class="criados">
                @for (caminho of caminhosCriados(); track caminho.url) {
                  <li>
                    <small class="apoio">{{ caminho.rotulo }}</small>
                    <code>{{ caminho.url }}</code>
                  </li>
                }
              </ul>
            </div>
          }

          <div class="repositorios">
            <app-repositorios-do-produto
              [repositorios]="encontrados()"
              [descricao]="descricaoRepos()"
              [buscando]="buscando()"
              [podeDescobrir]="cenario() !== 'greenfield' && urlRaiz().trim().startsWith('http')"
              [permiteGerarWiki]="cenario() !== 'wiki'"
              [prefixo]="slug()"
              [areaPadrao]="grupo"
              (mudou)="mudarRepositorios($event)"
              (descobrir)="buscar()"
            />
          </div>

          @if (!edicao()) {
            <div class="confirmar">
              <div>
                <strong>Confirmar repositórios</strong>
                <p class="apoio">
                  {{ repositoriosConfirmados() ? 'Confirmado. Mudar a lista acima pede uma nova confirmação.' : 'Revise a lista antes de criar o produto — depois de criado, o repositório já existe no GitLab.' }}
                </p>
              </div>
              <p-button
                type="button"
                [label]="repositoriosConfirmados() ? 'Repositórios confirmados' : 'Confirmar Repositórios'"
                icon="pi pi-check"
                [outlined]="repositoriosConfirmados()"
                [disabled]="repositoriosConfirmados()"
                (onClick)="repositoriosConfirmados.set(true)"
              />
            </div>
          }
        </div>

        <div class="rodape">
          <p-button type="button" label="Cancelar" icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="confirmarCancelar()" />
          <p-button type="button" [label]="edicao() ? 'Salvar alterações' : 'Criar produto e abrir'" icon="pi pi-check" [loading]="salvando()" [disabled]="salvando() || !obrigatoriosPreenchidos()" (onClick)="finalizar()" />
        </div>
      </div>
    </p-card>

    <p-confirmdialog />
  `,
  styles: [
    `
      .formulario {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .obrigatorio {
        color: var(--p-red-500);
      }
      .apoio {
        color: var(--p-text-muted-color);
        margin: 0;
      }
      .excedeu {
        color: var(--p-red-500);
      }
      .cenario {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--p-primary-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-highlight-background);
      }
      :host-context(.app-dark) .cenario {
        background: transparent;
        border-color: var(--p-primary-800);
      }
      .criados {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .criados li {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
      }
      .criados code {
        font-size: 0.75rem;
        word-break: break-all;
      }
      .repositorios {
        padding-top: 1rem;
        border-top: 1px solid var(--p-primary-color);
      }
      .confirmar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
      }
      .confirmar p {
        margin: 0.125rem 0 0;
      }
      .rodape {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--p-content-border-color);
      }
    `,
  ],
})
export class FormularioProduto {
  private readonly router = inject(Router);
  private readonly mensagens = inject(MessageService);
  private readonly confirmacao = inject(ConfirmationService);

  readonly projeto = input<Projeto>();
  readonly detalhe = input<ProjetoDetalhe>();

  protected readonly nomeMax = NOME_MAX;
  protected readonly grupo = GRUPO;
  protected readonly cenarios = CENARIOS;

  protected readonly edicao = computed(() => Boolean(this.projeto()));
  protected readonly salvando = signal(false);
  protected readonly buscando = signal(false);

  protected readonly nome = signal('');
  protected readonly descricao = signal('');
  protected readonly cenario = signal<OnboardingCenario>('wiki');
  protected readonly urlRaiz = signal('');
  protected readonly encontrados = signal<Repositorio[]>([]);

  /**
   * Criar o produto também cria o que está na lista no GitLab. Por isso a
   * confirmação é obrigatória antes de criar (e não antes de editar, onde cada
   * ação já grava na hora). Qualquer mudança na lista desfaz a confirmação.
   */
  protected readonly repositoriosConfirmados = signal(false);

  constructor() {
    // Preenche com o produto existente quando é edição; o `input()` só chega depois do construtor.
    queueMicrotask(() => {
      const projeto = this.projeto();
      if (!projeto) return;
      this.nome.set(projeto.nome);
      this.descricao.set(projeto.descricao);
      this.cenario.set(this.detalhe()?.onboardingCenario ?? 'wiki');
      this.urlRaiz.set(this.detalhe()?.urlRaiz ?? '');
      this.encontrados.set(this.detalhe()?.repositorios ?? []);
    });
  }

  protected readonly slug = computed(() => slugificar(this.nome()));
  private readonly caminhoSugerido = computed(() => `${BASE_GITLAB}/${GRUPO}/${this.slug() || 'novo-produto'}`);
  protected readonly urlFinal = computed(() => (this.cenario() === 'greenfield' ? this.caminhoSugerido() : this.urlRaiz().trim()));
  protected readonly explicacao = computed(() => EXPLICACAO[this.cenario()]);
  protected readonly descricaoRepos = computed(() => DESCRICAO_REPOS[this.cenario()]);

  /** O que o EAI Dev vai criar no GitLab, mostrado antes de criar. */
  protected readonly caminhosCriados = computed(() => {
    const cenario = this.cenario();
    if (cenario === 'greenfield') {
      return [
        { rotulo: 'Repositório', url: this.caminhoSugerido() },
        { rotulo: 'Wiki', url: `${this.caminhoSugerido()}/-/wikis` },
      ];
    }
    if (cenario === 'legado-sem-wiki' && this.urlRaiz().trim().startsWith('http')) {
      return [{ rotulo: 'Wiki', url: `${this.urlRaiz().trim().replace(/\/$/, '')}/-/wikis` }];
    }
    return [];
  });

  protected readonly nomeExcede = computed(() => this.nome().length > NOME_MAX);

  protected readonly obrigatoriosPreenchidos = computed(
    () =>
      this.nome().trim().length > 2 &&
      !this.nomeExcede() &&
      this.descricao().trim().length > 0 &&
      // Só o produto novo dispensa URL: o repositório ainda vai ser criado.
      (this.cenario() === 'greenfield' || this.urlRaiz().trim().startsWith('http')) &&
      (this.edicao() || this.repositoriosConfirmados()),
  );

  mudarCenario(cenario: OnboardingCenario): void {
    this.cenario.set(cenario);
    this.encontrados.set([]);
    this.repositoriosConfirmados.set(false);
  }

  mudarRepositorios(proximos: Repositorio[]): void {
    this.encontrados.set(proximos);
    this.repositoriosConfirmados.set(false);
  }

  async buscar(): Promise<void> {
    if (!this.urlFinal()) {
      this.mensagens.add({ severity: 'error', summary: 'URL não informada', detail: 'Informe a URL do produto no GitLab para descobrir os repositórios.' });
      return;
    }
    this.buscando.set(true);
    const lista = await buscarRepositorios(this.urlFinal(), this.cenario());
    this.encontrados.set(lista);
    this.repositoriosConfirmados.set(false);
    this.buscando.set(false);
  }

  /** Cancelar sempre pergunta antes de descartar: é mais previsível do que rastrear se algum campo mudou. */
  confirmarCancelar(): void {
    this.confirmacao.confirm({
      header: `Descartar ${this.edicao() ? 'as alterações' : 'o novo produto'}?`,
      message: this.edicao()
        ? 'O que foi alterado aqui se perde, e o produto continua exatamente como estava.'
        : 'O que foi preenchido aqui se perde, e o produto não chega a ser criado.',
      acceptLabel: 'Descartar',
      rejectLabel: 'Continuar editando',
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => void this.router.navigate(['/projetos']),
    });
  }

  async finalizar(): Promise<void> {
    this.salvando.set(true);
    const projeto = this.projeto();

    if (projeto) {
      await atualizarProjeto(projeto.id, { nome: this.nome().trim(), descricao: this.descricao().trim() });
      await salvarRepositorios(projeto.id, this.encontrados());
      this.salvando.set(false);
      this.mensagens.add({ severity: 'success', summary: 'Produto atualizado com sucesso' });
      void this.router.navigate(['/projetos']);
      return;
    }

    const criado = await criarProjeto({
      nome: this.nome().trim(),
      descricao: this.descricao().trim(),
      // O grupo é fixo no time, e quem responde pelo produto é quem o criou.
      orgao: GRUPO,
      responsavel: lerSessao()?.usuario.nome ?? 'Equipe do produto',
      urlRaiz: this.urlFinal(),
      repositorios: this.encontrados(),
      cenario: this.cenario(),
    });
    this.salvando.set(false);
    this.mensagens.add({ severity: 'success', summary: 'Produto criado com sucesso', detail: 'Abrindo o produto para você continuar a configuração.' });
    void this.router.navigate(['/projetos', criado.id]);
  }
}
