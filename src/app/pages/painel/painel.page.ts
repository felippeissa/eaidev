import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBar } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatCard } from '../../shared/stat-card.component';
import { StatusTag } from '../../shared/status-tag.component';
import { esteiras } from '@/mocks/data';
import { agenteAlertas, agenteExecucoes, agenteFases } from '@/mocks/agentic';
import { listarProjetos } from '@/lib/projeto-store';
import { listarSpecs } from '@/lib/spec-store';

const ROTULO_FASE: Record<string, string> = { Tasks: 'Tarefas' };

const ROTULO_STATUS: Record<string, string> = { Executando: 'Em andamento' };

const SEVERIDADE_ALERTA: Record<string, 'danger' | 'warn' | 'secondary'> = {
  Crítico: 'danger',
  Alto: 'warn',
  Médio: 'secondary',
};

@Component({
  selector: 'app-painel',
  imports: [RouterLink, PageHeader, StatCard, StatusTag, Card, ChartModule, TableModule, ProgressBar, Button, Tag],
  template: `
    <app-page-header titulo="Painel de indicadores" [trilha]="[{ label: 'Painel' }]" />

    <div class="indicadores">
      <app-stat-card
        label="Execuções de agentes"
        [value]="'' + execucoes().length"
        [hint]="sucessoMedio() + '% de sucesso médio nas fases'"
        icon="pi pi-android"
      />
      <app-stat-card
        label="Especificações SPDD"
        [value]="'' + specs().length"
        [hint]="publicadas() + ' publicada(s) · ' + (specs().length - publicadas()) + ' em elaboração'"
        icon="pi pi-file"
      />
      <app-stat-card
        label="Pontos de aprovação pendentes"
        [value]="'' + pontosPendentes()"
        hint="aprovações bloqueando fases"
        icon="pi pi-shield"
      />
      <app-stat-card
        label="Consumo de tokens"
        [value]="(tokens() / 1000).toFixed(1) + 'k'"
        [hint]="'US$ ' + custo().toFixed(2) + ' nas execuções recentes'"
        icon="pi pi-dollar"
      />
    </div>

    <div class="linha grafico-e-alertas">
      <p-card header="Agentes por fase do SPDD" subheader="Especificações processadas, pontos de aprovação pendentes e erros em cada fase do método">
        <p-chart type="bar" [data]="dadosGrafico()" [options]="opcoesGrafico" height="18rem" />
      </p-card>

      <p-card header="Alertas dos agentes" subheader="Falhas, inconsistências e desvios de custo">
        @if (alertas().length === 0) {
          <p class="vazio">Nenhum alerta aberto.</p>
        }
        <div class="alertas">
          @for (alerta of alertas(); track alerta.id) {
            <div class="alerta">
              <div class="alerta-titulo">
                <p-tag [value]="alerta.severidade" [severity]="severidadeAlerta(alerta.severidade)" [rounded]="true" />
                <strong>{{ alerta.tipo === 'Timeout' ? 'Tempo limite' : alerta.tipo }}</strong>
                <small class="apoio">{{ alerta.spec }}</small>
              </div>
              <p class="mensagem">{{ alerta.mensagem }}</p>
              <small class="apoio forte">{{ alerta.agente }} · {{ alerta.quando }}</small>
            </div>
          }
        </div>
      </p-card>
    </div>

    <div class="linha execucoes-e-specs">
      <p-card header="Execuções recentes dos agentes" subheader="Artefatos gerados por fase, com duração e custo">
        <p-table [value]="execucoesRecentes()" [tableStyle]="{ 'min-width': '36rem' }">
          <ng-template #header>
            <tr>
              <th>Agente</th>
              <th>Especificação</th>
              <th>Fase</th>
              <th>Artefato</th>
              <th class="direita">Duração</th>
              <th class="direita">Situação</th>
            </tr>
          </ng-template>
          <ng-template #body let-execucao>
            <tr>
              <td class="forte">{{ execucao.agente }}</td>
              <td class="apoio">{{ execucao.spec }}</td>
              <td class="apoio">{{ rotuloFase(execucao.fase) }}</td>
              <td class="mono">{{ execucao.artefato }}</td>
              <td class="direita apoio">{{ execucao.duracao }}</td>
              <td class="direita"><app-status-tag [status]="execucao.status" [label]="rotuloStatus(execucao.status)" /></td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr><td colspan="6" class="vazio">Nenhuma execução registrada ainda.</td></tr>
          </ng-template>
        </p-table>
        @if (execucoes().length > 5) {
          <div class="rodape">
            <span>Mostrando 5 de {{ execucoes().length }} execuções</span>
            <p-button label="Ver todas" [link]="true" size="small" routerLink="/execucoes" />
          </div>
        }
      </p-card>

      <p-card header="Especificações por fase" subheader="Andamento das fases aprovadas em cada especificação">
        @if (specs().length === 0) {
          <p class="vazio">Nenhuma especificação criada ainda.</p>
        }
        <div class="specs">
          @for (spec of specsRecentes(); track spec.id) {
            <div class="spec">
              <div class="spec-topo">
                <a [routerLink]="['/projetos/especificacoes', spec.id]">{{ spec.titulo }}</a>
                <span class="spec-fim">
                  <p-tag [value]="spec.status" severity="secondary" [rounded]="true" />
                  <small class="apoio">{{ aprovadas(spec) }}/{{ spec.fases.length }} fases</small>
                </span>
              </div>
              <p-progressbar [value]="progresso(spec)" [showValue]="false" [style]="{ height: '0.5rem' }" />
            </div>
          }
        </div>
        @if (specs().length > 6) {
          <div class="rodape">
            <span>Mostrando 6 de {{ specs().length }} especificações</span>
            <p-button label="Ver todas" [link]="true" size="small" routerLink="/projetos/especificacoes" />
          </div>
        }
      </p-card>
    </div>

    <p-card>
      <ng-template #title>
        <div class="titulo-com-acoes">
          <div>
            <div class="p-card-title">Produtos na visão Git</div>
            <div class="p-card-subtitle">Repositórios, ramificações GitFlow e último pipeline de cada produto</div>
          </div>
          <div class="acoes-card">
            <p-button label="Ver esteiras GitFlow" icon="pi pi-sitemap" [outlined]="true" severity="secondary" size="small" routerLink="/esteiras" />
            <p-button [label]="projetos().length + ' produtos no GitLab'" [outlined]="true" severity="secondary" size="small" routerLink="/projetos" />
          </div>
        </div>
      </ng-template>
      <p-table [value]="esteiras">
        <ng-template #header>
          <tr>
            <th>Repositório</th>
            <th>Branch</th>
            <th>Commit</th>
            <th>Autor</th>
            <th class="direita">Duração</th>
            <th class="direita">Situação</th>
          </tr>
        </ng-template>
        <ng-template #body let-esteira>
          <tr>
            <td class="mono forte">{{ esteira.repositorio }}</td>
            <td class="apoio"><i class="pi pi-sitemap icone-pequeno"></i> {{ esteira.branch }}</td>
            <td class="mono apoio">{{ esteira.gitflow ? esteira.gitflow.commit : '—' }}</td>
            <td class="apoio">{{ esteira.gitflow?.autor ?? '—' }}</td>
            <td class="direita apoio">{{ esteira.duracao }}</td>
            <td class="direita"><app-status-tag [status]="esteira.status" [label]="rotuloStatus(esteira.status)" /></td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="vazio">Nenhuma esteira executada ainda.</td></tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      app-page-header {
        margin-bottom: -0.5rem;
      }
      .indicadores {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
      }
      .linha {
        display: grid;
        gap: 1rem;
        align-items: stretch;
      }
      .grafico-e-alertas {
        grid-template-columns: 2fr 1fr;
      }
      .execucoes-e-specs {
        grid-template-columns: 3fr 2fr;
      }
      @media (max-width: 1023px) {
        .grafico-e-alertas,
        .execucoes-e-specs {
          grid-template-columns: 1fr;
        }
      }
      .alertas {
        max-height: 17rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .alerta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .alerta-titulo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .mensagem {
        margin: 0;
        color: var(--p-text-muted-color);
      }
      .apoio {
        color: var(--p-text-muted-color);
      }
      .forte {
        font-weight: 600;
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
      }
      .direita {
        text-align: right;
      }
      .vazio {
        margin: 0;
        padding: 1rem 0;
        text-align: center;
        color: var(--p-text-muted-color);
      }
      .specs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .spec {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .spec-topo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .spec-topo a {
        font-weight: 500;
        color: inherit;
        text-decoration: none;
      }
      .spec-topo a:hover {
        text-decoration: underline;
      }
      .spec-fim {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .rodape {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.75rem;
        color: var(--p-text-muted-color);
      }
      .titulo-com-acoes {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .acoes-card {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .icone-pequeno {
        font-size: 0.75rem;
      }
    `,
  ],
})
export class PainelPage {
  protected readonly projetos = carregarComPadrao(listarProjetos);
  protected readonly specs = carregarComPadrao(listarSpecs);
  protected readonly fases = carregarComPadrao(() => atraso(agenteFases));
  protected readonly execucoes = carregarComPadrao(() => atraso(agenteExecucoes));
  protected readonly alertas = carregarComPadrao(() => atraso(agenteAlertas));
  protected readonly esteiras = esteiras;

  protected readonly pontosPendentes = computed(() => this.fases().reduce((total, fase) => total + fase.gatesPendentes, 0));
  protected readonly sucessoMedio = computed(() =>
    Math.round(this.fases().reduce((total, fase) => total + fase.sucesso, 0) / (this.fases().length || 1)),
  );
  protected readonly tokens = computed(() => this.execucoes().reduce((total, item) => total + item.tokens, 0));
  protected readonly custo = computed(() => this.execucoes().reduce((total, item) => total + item.custo, 0));
  protected readonly publicadas = computed(() => this.specs().filter((spec) => spec.status === 'Publicada').length);
  protected readonly execucoesRecentes = computed(() => this.execucoes().slice(0, 5));
  protected readonly specsRecentes = computed(() => this.specs().slice(0, 6));

  protected readonly dadosGrafico = computed(() => {
    const estilo = getComputedStyle(document.documentElement);
    const cor = (variavel: string) => estilo.getPropertyValue(variavel).trim();
    const fases = this.fases();
    return {
      labels: fases.map((fase) => ROTULO_FASE[fase.fase] ?? fase.fase),
      datasets: [
        { label: 'Especificações', data: fases.map((fase) => fase.specs), backgroundColor: cor('--p-green-500'), borderRadius: 4 },
        { label: 'Pontos de aprovação pendentes', data: fases.map((fase) => fase.gatesPendentes), backgroundColor: cor('--p-yellow-500'), borderRadius: 4 },
        { label: 'Erros', data: fases.map((fase) => fase.erros), backgroundColor: cor('--p-red-500'), borderRadius: 4 },
      ],
    };
  });

  protected readonly opcoesGrafico = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } },
  };

  rotuloFase(fase: string): string {
    return ROTULO_FASE[fase] ?? fase;
  }

  rotuloStatus(status: string): string {
    return ROTULO_STATUS[status] ?? status;
  }

  severidadeAlerta(severidade: string): 'danger' | 'warn' | 'secondary' {
    return SEVERIDADE_ALERTA[severidade] ?? 'secondary';
  }

  aprovadas(spec: { fases: { estado: string }[] }): number {
    return spec.fases.filter((fase) => fase.estado === 'aprovada').length;
  }

  progresso(spec: { fases: { estado: string }[] }): number {
    return Math.round((this.aprovadas(spec) / (spec.fases.length || 1)) * 100);
  }
}

/** Como `carregar`, mas devolve uma lista vazia enquanto carrega, para os `computed` não precisarem tratar null. */
function carregarComPadrao<T>(origem: () => Promise<T[]>) {
  const dado = carregar(origem);
  return computed<T[]>(() => dado() ?? []);
}
