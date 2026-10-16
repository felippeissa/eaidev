import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Drawer } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Timeline } from 'primeng/timeline';

import { atraso, carregar } from '../../core/carregar';
import { PageHeader } from '../../layout/page-header.component';
import { StatCard } from '../../shared/stat-card.component';
import { StatusTag } from '../../shared/status-tag.component';
import { observabilidade } from '@/mocks/agentic';
import type { ObservabilidadeAlerta, WorkflowExecucao } from '@/types';

type Aba = 'visao-geral' | 'ia-modelos' | 'workflows' | 'contexto' | 'publicacoes' | 'alertas';
type Investigacao = { tipo: 'workflow'; item: WorkflowExecucao } | { tipo: 'alerta'; item: ObservabilidadeAlerta };
type Severidade = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const SAUDE: Record<string, Severidade> = { Saudável: 'success', Degradado: 'warn', Indisponível: 'danger' };
const WORKFLOW: Record<string, Severidade> = { Sucesso: 'success', 'Em andamento': 'info', Falha: 'danger', 'Aguardando aprovação': 'warn' };
const PUBLICACAO: Record<string, Severidade> = { Concluída: 'success', 'Em andamento': 'info', NEEDS_ATTENTION: 'danger' };
const PUBLICACAO_ROTULO: Record<string, string> = { Concluída: 'Concluída', 'Em andamento': 'Em andamento', NEEDS_ATTENTION: 'Requer atenção' };
const ETAPA: Record<string, Severidade> = { Concluído: 'success', 'Em andamento': 'info', Falha: 'danger', Pendente: 'secondary' };

const TIPO_ALERTA: Record<string, string> = {
  'Falha de geração': 'Falha de geração',
  'Tempo limite': 'Tempo limite',
  Inconsistência: 'Inconsistência',
  'Custo acima do previsto': 'Custo acima do previsto',
  'Provider indisponível': 'Provedor indisponível',
  'Fallback excessivo': 'Fallback excessivo',
  'Workflow interrompido': 'Workflow interrompido',
  'Human Gate parado': 'Aprovação humana parada',
  'Falha de indexação': 'Falha de indexação',
  'Publicação em NEEDS_ATTENTION': 'Publicação requer atenção',
  'MCP indisponível': 'MCP indisponível',
  'Taxa de erro anormal': 'Taxa de erro anormal',
};

const numero = (v: number) => v.toLocaleString('pt-BR');
const compacto = (v: number) => Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-observabilidade',
  imports: [RouterLink, PageHeader, StatCard, StatusTag, Button, Card, Drawer, IconField, InputIcon, InputText, Message, Tab, TabList, TabPanel, TabPanels, Tabs, TableModule, Tag, Timeline],
  template: `
    <app-page-header titulo="Observabilidade" [trilha]="[{ label: 'Observabilidade' }]">
      <p-button label="Exportar métricas" [outlined]="true" (onClick)="exportar()" />
    </app-page-header>

    @if (dados(); as d) {
      <p-tabs [value]="aba()" (valueChange)="aba.set($any($event))" [scrollable]="true">
        <p-tablist>
          <p-tab value="visao-geral">Visão geral</p-tab>
          <p-tab value="ia-modelos">IA e modelos</p-tab>
          <p-tab value="workflows">Workflows</p-tab>
          <p-tab value="contexto">Contexto</p-tab>
          <p-tab value="publicacoes">Publicações</p-tab>
          <p-tab value="alertas">Alertas</p-tab>
        </p-tablist>
        <p-tabpanels>
          <!-- ===== Visão geral ===== -->
          <p-tabpanel value="visao-geral">
            <div class="indicadores seis">
              <app-stat-card label="Execuções nas últimas 24h" [value]="num(d.resumo.execucoes24h)" icon="pi pi-chart-line" />
              <app-stat-card label="Taxa de sucesso" [value]="d.resumo.taxaSucesso.toFixed(1) + '%'" icon="pi pi-check-circle" />
              <app-stat-card label="Falhas" [value]="'' + d.resumo.falhas" icon="pi pi-times-circle" />
              <app-stat-card label="Aprovações pendentes" [value]="'' + d.resumo.aprovacoesPendentes" icon="pi pi-clock" />
              <app-stat-card label="Tokens consumidos" [value]="comp(d.resumo.tokens)" icon="pi pi-bolt" />
              <app-stat-card label="Custo estimado" [value]="mo(d.resumo.custoEstimado)" icon="pi pi-dollar" />
            </div>
            <div class="duas-colunas">
              <p-card header="Componentes da plataforma" subheader="Saúde operacional e latência P95 dos principais componentes.">
                <div class="componentes">
                  @for (c of d.componentes; track c.id) {
                    <div class="caixa">
                      <div class="topo"><strong>{{ c.nome }}</strong><p-tag [value]="c.status" [severity]="saude(c.status)" /></div>
                      <small class="mudo">P95: {{ c.p95 }}</small>
                      <small class="mudo">{{ c.detalhe }}</small>
                    </div>
                  } @empty {
                    <p class="mudo">Nenhum componente monitorado ainda.</p>
                  }
                </div>
              </p-card>
              <p-card header="Impacto no processo de engenharia" subheader="Indicadores de valor gerados a partir de eventos agregados.">
                <div class="metricas">
                  <div class="caixa"><small class="mudo">Especificações assistidas</small><strong>{{ num(d.impactoEngenharia.especificacoesAssistidas) }}</strong></div>
                  <div class="caixa"><small class="mudo">Aprovadas sem alteração</small><strong>{{ d.impactoEngenharia.aprovadasSemAlteracao }}%</strong></div>
                  <div class="caixa"><small class="mudo">Aprovadas após ajustes</small><strong>{{ d.impactoEngenharia.aprovadasComAjustes }}%</strong></div>
                  <div class="caixa"><small class="mudo">Rejeitadas</small><strong>{{ d.impactoEngenharia.rejeitadas }}%</strong></div>
                  <div class="caixa"><small class="mudo">Divergências detectadas</small><strong>{{ d.impactoEngenharia.divergenciasDetectadas }}</strong></div>
                  <div class="caixa"><small class="mudo">DEFINIR → PUBLICAR</small><strong>{{ d.impactoEngenharia.tempoDefinirPublicar }}</strong></div>
                </div>
              </p-card>
            </div>
          </p-tabpanel>

          <!-- ===== IA e modelos ===== -->
          <p-tabpanel value="ia-modelos">
            <div class="indicadores tres">
              <app-stat-card label="Modelos ativos" [value]="'' + d.modelos.length" icon="pi pi-microchip-ai" />
              <app-stat-card label="Fallbacks" [value]="'' + totalFallbacks()" icon="pi pi-share-alt" />
              <app-stat-card label="Tokens por modelo" [value]="comp(totalTokens())" icon="pi pi-bolt" />
            </div>
            <p-card header="Desempenho por modelo" subheader="Execuções, percentis, consumo, novas tentativas e fallbacks." styleClass="bloco">
              <p-table #tModelos [value]="d.modelos" [paginator]="true" [rows]="10" [rowHover]="true" [globalFilterFields]="['nome', 'provider']" [tableStyle]="{ 'min-width': '60rem' }">
                <ng-template #caption>
                  <p-iconfield><p-inputicon class="pi pi-search" /><input pInputText type="text" placeholder="Buscar modelo ou provedor" (input)="tModelos.filterGlobal($any($event.target).value, 'contains')" /></p-iconfield>
                </ng-template>
                <ng-template #header>
                  <tr>
                    <th pSortableColumn="nome">Modelo <p-sortIcon field="nome" /></th>
                    <th pSortableColumn="execucoes">Execuções <p-sortIcon field="execucoes" /></th>
                    <th pSortableColumn="taxaSucesso">Sucesso <p-sortIcon field="taxaSucesso" /></th>
                    <th>P50</th><th>P95</th><th>P99</th>
                    <th pSortableColumn="tokens">Tokens <p-sortIcon field="tokens" /></th>
                    <th pSortableColumn="custoEstimado">Custo <p-sortIcon field="custoEstimado" /></th>
                    <th>Novas tentativas</th><th>Fallbacks</th>
                  </tr>
                </ng-template>
                <ng-template #body let-m>
                  <tr>
                    <td><strong>{{ m.nome }}</strong><br /><small class="mudo">Provedor: {{ m.provider }}</small></td>
                    <td>{{ num(m.execucoes) }}</td><td>{{ m.taxaSucesso.toFixed(1) }}%</td>
                    <td>{{ m.p50 }}</td><td>{{ m.p95 }}</td><td>{{ m.p99 }}</td>
                    <td>{{ comp(m.tokens) }}</td><td>{{ mo(m.custoEstimado) }}</td>
                    <td>{{ m.retries }}</td><td>{{ m.fallbacks }}</td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
            <p-card header="Roteamento por capacidade" subheader="Workflows solicitam capacidades; o ModelRouter aplica a política e seleciona o modelo." styleClass="bloco">
              <div class="tres-col">
                @for (r of d.roteamentos; track r.capability) {
                  <div class="caixa">
                    <code class="capacidade">{{ r.capability }}</code>
                    <dl>
                      <div><dt>Modelo primário</dt><dd>{{ r.modeloPrimario }}</dd></div>
                      <div><dt>Fallback</dt><dd>{{ r.fallback }}</dd></div>
                      <div><dt>Política</dt><dd>{{ r.politica }}</dd></div>
                    </dl>
                  </div>
                } @empty {
                  <p class="mudo">Nenhuma política de roteamento configurada.</p>
                }
              </div>
            </p-card>
          </p-tabpanel>

          <!-- ===== Workflows ===== -->
          <p-tabpanel value="workflows">
            <p-card header="Execuções de workflows" subheader="Workflows, nós, modelos e aprovações humanas são dimensões distintas da execução.">
              <p-table #tWf [value]="d.workflows" [paginator]="true" [rows]="10" [rowHover]="true" [globalFilterFields]="['workflow', 'projeto', 'especificacao']" [tableStyle]="{ 'min-width': '70rem' }">
                <ng-template #caption>
                  <p-iconfield><p-inputicon class="pi pi-search" /><input pInputText type="text" placeholder="Buscar workflow, produto ou especificação" (input)="tWf.filterGlobal($any($event.target).value, 'contains')" /></p-iconfield>
                </ng-template>
                <ng-template #header>
                  <tr>
                    <th pSortableColumn="workflow">Workflow <p-sortIcon field="workflow" /></th>
                    <th pSortableColumn="especificacao">Especificação <p-sortIcon field="especificacao" /></th>
                    <th pSortableColumn="status">Situação <p-sortIcon field="status" /></th>
                    <th>Duração</th><th>P95</th>
                    <th pSortableColumn="nodesExecutados">Nós <p-sortIcon field="nodesExecutados" /></th>
                    <th>Modelo principal</th><th>Aprovação humana</th><th>Início</th>
                    <th style="width: 5rem"><span class="so-leitor">Ações</span></th>
                  </tr>
                </ng-template>
                <ng-template #body let-w>
                  <tr>
                    <td><code>{{ w.workflow }}</code><br /><small class="mudo">{{ w.projeto }}</small></td>
                    <td>{{ w.especificacao }}</td>
                    <td><p-tag [value]="w.status" [severity]="workflow(w.status)" /></td>
                    <td>{{ w.duracao }}</td><td>{{ w.p95 }}</td><td>{{ w.nodesExecutados }}</td>
                    <td>{{ w.modeloPrincipal }}</td><td>{{ w.humanGate }}</td><td>{{ w.inicio }}</td>
                    <td><p-button icon="pi pi-search" [text]="true" severity="secondary" ariaLabel="Investigar" (onClick)="investigar({ tipo: 'workflow', item: w })" /></td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </p-tabpanel>

          <!-- ===== Contexto ===== -->
          <p-tabpanel value="contexto">
            <div class="indicadores quatro">
              <app-stat-card label="Consultas de contexto" [value]="num(d.contexto.consultas)" icon="pi pi-search" />
              <app-stat-card label="Recuperação P95" [value]="d.contexto.p95Recuperacao" icon="pi pi-clock" />
              <app-stat-card label="Zero resultados" [value]="'' + d.contexto.zeroResults" icon="pi pi-exclamation-triangle" />
              <app-stat-card label="Falhas de indexação" [value]="'' + d.contexto.falhasIndexacao" icon="pi pi-times-circle" />
            </div>
            <div class="duas-colunas iguais">
              <p-card header="Context Pipeline" subheader="Resumo do índice e da recuperação de contexto.">
                <div class="metricas">
                  <div class="caixa"><small class="mudo">Índice ativo</small><code>{{ d.contexto.indiceAtivo }}</code></div>
                  <div class="caixa"><small class="mudo">Chunks recuperados</small><strong>{{ num(d.contexto.chunksRecuperados) }}</strong></div>
                  <div class="caixa"><small class="mudo">Embedding P95</small><strong>{{ d.contexto.embeddingP95 }}</strong></div>
                  <div class="caixa"><small class="mudo">Milvus P95</small><strong>{{ d.contexto.milvusP95 }}</strong></div>
                  <div class="caixa"><small class="mudo">Retrieval P95</small><strong>{{ d.contexto.retrievalP95 }}</strong></div>
                </div>
              </p-card>
              <p-card header="Configuração técnica" subheader="Identificadores operacionais, sem conteúdo RAG ou prompts.">
                <dl class="linhas">
                  <div><dt>Modelo de embedding</dt><dd>{{ d.contexto.modeloEmbedding }}</dd></div>
                  <div><dt>Dimensão</dt><dd>{{ num(d.contexto.dimensao) }}</dd></div>
                  <div><dt>Vector store</dt><dd>{{ d.contexto.vectorStore }}</dd></div>
                  <div><dt>Consumo</dt><dd>{{ d.contexto.consumo }}</dd></div>
                </dl>
              </p-card>
            </div>
          </p-tabpanel>

          <!-- ===== Publicações ===== -->
          <p-tabpanel value="publicacoes">
            <div class="indicadores quatro">
              <app-stat-card label="Publicações" [value]="'' + d.publicacoes.length" icon="pi pi-chart-line" />
              <app-stat-card label="Taxa de sucesso" [value]="taxaPublicacao()" icon="pi pi-check-circle" />
              <app-stat-card label="Pendentes" [value]="'' + pendentes()" icon="pi pi-clock" />
              <app-stat-card label="Requerem atenção" [value]="'' + atencao()" icon="pi pi-exclamation-triangle" />
            </div>
            <div class="tres-col bloco-grade">
              @for (p of d.publicacoes; track p.id) {
                <p-card>
                  <ng-template #title><span class="topo">{{ p.especificacao }} {{ p.versao }} <p-tag [value]="rotuloPublicacao(p.status)" [severity]="publicacao(p.status)" /></span></ng-template>
                  <ng-template #subtitle>{{ p.projeto }} · {{ p.inicio }}</ng-template>
                  <small class="mudo bloco-texto">Saga: versão imutável → commit no Oracle → Outbox → Wiki → pacote MCP → reindexação</small>
                  @for (e of p.etapas; track e.nome) {
                    <div class="etapa"><span>{{ e.nome }}</span><p-tag [value]="e.status" [severity]="etapa(e.status)" /></div>
                  } @empty {
                    <p class="mudo">Saga ainda não iniciada.</p>
                  }
                  @if (p.retry > 0) { <p-tag [value]="'Retry #' + p.retry" severity="warn" /> }
                </p-card>
              } @empty {
                <p-card class="todas"><p class="mudo">Nenhuma publicação registrada. As publicações aparecem aqui quando uma especificação for publicada.</p></p-card>
              }
            </div>
          </p-tabpanel>

          <!-- ===== Alertas ===== -->
          <p-tabpanel value="alertas">
            <p-card header="Alertas da plataforma" subheader="Ocorrências operacionais que exigem investigação.">
              @for (a of d.alertas; track a.id) {
                <div class="alerta">
                  <div class="alerta-corpo">
                    <div class="selos"><app-status-tag [status]="a.severidade" /><strong>{{ tipoAlerta(a.tipo) }}</strong><p-tag [value]="a.componente" severity="secondary" /></div>
                    <p class="mudo sem-margem">{{ a.mensagem }}</p>
                    <small class="mudo">{{ a.contexto }}{{ a.projeto ? ' · ' + a.projeto : '' }}{{ a.especificacao ? ' · ' + a.especificacao : '' }} · {{ a.quando }}</small>
                  </div>
                  <p-button label="Investigar" [outlined]="true" size="small" (onClick)="investigar({ tipo: 'alerta', item: a })" />
                </div>
              } @empty {
                <p class="mudo vazio"><i class="pi pi-shield"></i> Nenhum alerta aberto. Nada exige investigação no momento.</p>
              }
            </p-card>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    }

    <p-drawer [visible]="!!investigacao()" (visibleChange)="!$event && investigacao.set(null)" position="right" [header]="tituloInvestigacao()" [style]="{ width: '34rem' }">
      <p class="mudo">Detalhes mockados de telemetria. Este painel não representa auditoria de domínio.</p>
      @if (investigacao(); as inv) {
        @if (inv.tipo === 'workflow') {
          <div class="metricas">
            <div class="caixa"><small class="mudo">Produto</small><strong>{{ inv.item.projeto }}</strong></div>
            <div class="caixa"><small class="mudo">Especificação</small><strong>{{ inv.item.especificacao }}</strong></div>
            <div class="caixa"><small class="mudo">Situação</small><strong>{{ inv.item.status }}</strong></div>
            <div class="caixa"><small class="mudo">Modelo principal</small><strong>{{ inv.item.modeloPrincipal }}</strong></div>
            <div class="caixa"><small class="mudo">Duração</small><strong>{{ inv.item.duracao }}</strong></div>
            <div class="caixa"><small class="mudo">P95</small><strong>{{ inv.item.p95 }}</strong></div>
          </div>
          <div class="caixa ids"><small class="mudo">Trace ID: {{ inv.item.traceId }}</small><small class="mudo">Correlation ID: {{ inv.item.correlationId }}</small></div>
          <p-timeline [value]="inv.item.nodes">
            <ng-template #marker let-n><span class="marcador" [class.falha]="n.status === 'Falha'" [class.espera]="n.status === 'Aguardando aprovação'" [class.ok]="n.status === 'Concluído'"></span></ng-template>
            <ng-template #content let-n>
              <div class="no-linha"><strong>{{ n.nome }}</strong> <small class="mudo">{{ n.duracao }}</small><br /><small class="mudo">{{ detalheNo(n) }}</small></div>
            </ng-template>
          </p-timeline>
        } @else {
          <div class="selos"><app-status-tag [status]="inv.item.severidade" /><p-tag [value]="inv.item.componente" severity="secondary" /></div>
          <div class="caixa ids"><strong>{{ inv.item.contexto }}</strong><span class="mudo">{{ inv.item.mensagem }}</span></div>
          <dl class="linhas">
            <div><dt>Quando</dt><dd>{{ inv.item.quando }}</dd></div>
            <div><dt>Produto</dt><dd>{{ inv.item.projeto ?? 'Não informado' }}</dd></div>
            <div><dt>Especificação</dt><dd>{{ inv.item.especificacao ?? 'Não informada' }}</dd></div>
            <div><dt>Trace ID</dt><dd><code>{{ inv.item.traceId ?? 'Não informado' }}</code></dd></div>
            <div><dt>Correlation ID</dt><dd><code>{{ inv.item.correlationId ?? 'Não informado' }}</code></dd></div>
          </dl>
          <p-message severity="info" text="A telemetria ajuda a investigar a ocorrência. Aprovações, publicações e decisões de domínio continuam registradas pela auditoria do Java Core/Oracle." />
        }
      }
    </p-drawer>
  `,
  styles: [
    `
      .indicadores {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .indicadores.seis {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
      .indicadores.quatro {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .indicadores.tres {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .duas-colunas {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
        gap: 1rem;
      }
      .duas-colunas.iguais {
        grid-template-columns: 1fr 1fr;
      }
      :host ::ng-deep .bloco {
        display: block;
        margin-top: 1rem;
      }
      .componentes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.5rem;
      }
      .metricas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
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
      .caixa code {
        word-break: break-all;
        font-size: 0.75rem;
      }
      .ids {
        margin-bottom: 1rem;
      }
      .topo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .tres-col {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .bloco-grade {
        margin-top: 0;
      }
      .capacidade {
        word-break: break-all;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--p-primary-color);
      }
      dl {
        margin: 0.75rem 0 0;
      }
      dl > div,
      .linhas > div {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.25rem 0;
        font-size: 0.875rem;
      }
      dt {
        color: var(--p-text-muted-color);
        flex-shrink: 0;
      }
      dd {
        margin: 0;
        text-align: right;
        min-width: 0;
      }
      .linhas {
        margin: 0;
      }
      .etapa {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.25rem 0;
        font-size: 0.875rem;
      }
      .alerta {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .alerta-corpo {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
        flex: 1;
      }
      .selos {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .sem-margem {
        margin: 0;
      }
      .bloco-texto {
        display: block;
        margin: 0.75rem 0;
      }
      .so-leitor {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
      .marcador {
        display: block;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        background: var(--p-sky-500);
      }
      .marcador.ok {
        background: var(--p-green-500);
      }
      .marcador.falha {
        background: var(--p-red-500);
      }
      .marcador.espera {
        background: var(--p-yellow-500);
      }
      .no-linha {
        padding-bottom: 1rem;
        font-size: 0.875rem;
      }
      .vazio {
        padding: 1.5rem 0;
        text-align: center;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      @media (max-width: 1200px) {
        .indicadores.seis {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .indicadores.quatro {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .duas-colunas,
        .duas-colunas.iguais,
        .tres-col,
        .componentes {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ObservabilidadePage {
  private readonly mensagens = inject(MessageService);

  protected readonly dados = carregar(() => atraso(observabilidade));
  protected readonly aba = signal<Aba>('visao-geral');
  protected readonly investigacao = signal<Investigacao | null>(null);

  protected num = numero;
  protected comp = compacto;
  protected mo = moeda;
  protected saude = (s: string) => SAUDE[s] ?? 'secondary';
  protected workflow = (s: string) => WORKFLOW[s] ?? 'secondary';
  protected publicacao = (s: string) => PUBLICACAO[s] ?? 'secondary';
  protected rotuloPublicacao = (s: string) => PUBLICACAO_ROTULO[s] ?? s;
  protected etapa = (s: string) => ETAPA[s] ?? 'secondary';
  protected tipoAlerta = (t: string) => TIPO_ALERTA[t] ?? t;

  protected readonly totalFallbacks = computed(() => (this.dados()?.modelos ?? []).reduce((t, m) => t + m.fallbacks, 0));
  protected readonly totalTokens = computed(() => (this.dados()?.modelos ?? []).reduce((t, m) => t + m.tokens, 0));
  protected readonly pendentes = computed(() => (this.dados()?.publicacoes ?? []).filter((p) => p.status === 'Em andamento').length);
  protected readonly atencao = computed(() => (this.dados()?.publicacoes ?? []).filter((p) => p.status === 'NEEDS_ATTENTION').length);
  protected readonly taxaPublicacao = computed(() => {
    const itens = this.dados()?.publicacoes ?? [];
    return itens.length === 0 ? '—' : `${Math.round((itens.filter((p) => p.status === 'Concluída').length / itens.length) * 100)}%`;
  });

  protected readonly tituloInvestigacao = computed(() => {
    const inv = this.investigacao();
    return inv ? (inv.tipo === 'workflow' ? inv.item.workflow : this.tipoAlerta(inv.item.tipo)) : 'Investigação';
  });

  protected investigar(inv: Investigacao): void {
    this.investigacao.set(inv);
  }

  protected detalheNo(n: { modelo?: string; tokens?: number; detalhe?: string }): string {
    return [n.modelo ? `Modelo: ${n.modelo}` : undefined, n.tokens ? `Tokens: ${numero(n.tokens)}` : undefined, n.detalhe].filter(Boolean).join(' · ');
  }

  protected exportar(): void {
    this.mensagens.add({ severity: 'info', summary: 'Exportação simulada', detail: 'Neste protótipo o arquivo não é gerado de verdade.' });
  }
}
