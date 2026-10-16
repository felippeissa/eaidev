import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

import { AuthService } from '../../core/auth.service';
import { PageHeader } from '../../layout/page-header.component';
import { StatCard } from '../../shared/stat-card.component';
import { gerarFaseLocal } from '@/lib/spec-gerador';
import {
  ESTADOS_KANBAN,
  ESTADOS_TASK,
  analisarConsistencia,
  aplicarGeracao,
  limparPendencias,
  marcarFaseErro,
  marcarFaseGerando,
  montarPacoteMcp,
  moverFase,
  moverTask,
  obterSpec,
  podePublicar,
  publicarSpec,
  reabrirSpec,
  removerFeature,
  revisarDocumentationImpact,
  salvarArtefato,
  salvarFeature,
} from '@/lib/spec-store';
import type { Spec, SpecFase, SpecFaseEstado, SpecFaseId, SpecFeature, SpecImplementationStatus, SpecTaskEstado } from '@/types/spdd';

type Etapa = 'define' | 'design' | 'plan' | 'validate' | 'publish' | 'implement' | 'verify';

const ETAPAS: { id: Etapa; rotulo: string; icone: string }[] = [
  { id: 'define', rotulo: 'Definir', icone: 'pi-clipboard' },
  { id: 'design', rotulo: 'Projetar', icone: 'pi-objects-column' },
  { id: 'plan', rotulo: 'Planejar', icone: 'pi-list-check' },
  { id: 'validate', rotulo: 'Validar', icone: 'pi-shield' },
  { id: 'publish', rotulo: 'Publicar', icone: 'pi-cloud-upload' },
  { id: 'implement', rotulo: 'Implementar', icone: 'pi-code' },
  { id: 'verify', rotulo: 'Verificar', icone: 'pi-verified' },
];

const ETAPA_DA_FASE: Record<SpecFaseId, Etapa> = { constituicao: 'define', especificacao: 'define', plano: 'design', tasks: 'plan', validacao: 'validate' };

const IMPLEMENTACAO: Record<SpecImplementationStatus, { rotulo: string; severidade: 'secondary' | 'info' | 'success' | 'warn' | 'danger' }> = {
  'NOT STARTED': { rotulo: 'Não iniciado', severidade: 'secondary' },
  'IN PROGRESS': { rotulo: 'Em andamento', severidade: 'info' },
  ALIGNED: { rotulo: 'Alinhado', severidade: 'success' },
  'PARTIALLY ALIGNED': { rotulo: 'Parcialmente alinhado', severidade: 'warn' },
  'DRIFT DETECTED': { rotulo: 'Divergência detectada', severidade: 'danger' },
  'REQUIRES SPEC UPDATE': { rotulo: 'Requer atualização da especificação', severidade: 'danger' },
  VALIDATED: { rotulo: 'Validado', severidade: 'success' },
};

const BORDA: Record<SpecFaseEstado, string> = {
  pendente: 'var(--p-surface-400)',
  gerando: 'var(--p-sky-500)',
  revisao: 'var(--p-yellow-500)',
  aprovada: 'var(--p-green-500)',
  erro: 'var(--p-red-500)',
};

@Component({
  selector: 'app-especificacao-detalhe',
  imports: [FormsModule, RouterLink, PageHeader, StatCard, Button, Card, InputText, Message, ProgressBar, Tag, Textarea, Tooltip],
  template: `
    @if (spec(); as s) {
      <app-page-header [titulo]="s.titulo" [trilha]="trilha(s)">
        <p-button [label]="origem() === 'lista' ? 'Especificações' : 'Produto'" icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="voltar(s)" />
        @if (s.status === 'Publicada') {
          <p-button label="Abrir nova versão" icon="pi pi-replay" [outlined]="true" (onClick)="reabrir(s)" />
        } @else {
          <p-button label="Publicar" icon="pi pi-send" [disabled]="!publicacao().ok" [pTooltip]="publicacao().motivo ?? ''" tooltipPosition="top" (onClick)="publicar(s)" />
        }
      </app-page-header>

      <div class="resumo">
        <app-stat-card label="Status" [value]="s.status" icon="pi pi-circle" />
        <app-stat-card label="Funcionalidades" [value]="'' + s.features.length" icon="pi pi-list-check" />
        <app-stat-card label="Artefatos" [value]="'' + s.artefatos.length" icon="pi pi-file" />
        <app-stat-card label="Tarefas" [value]="'' + s.tasks.length" icon="pi pi-clipboard" />
        <app-stat-card label="Implementação" [value]="implementacao(s).rotulo" icon="pi pi-bolt" />
        <app-stat-card label="Bloqueios" [value]="'' + criticos()" icon="pi pi-exclamation-triangle" />
      </div>

      <nav class="ciclo" aria-label="Ciclo da mudança">
        <div class="etapas">
          @for (e of etapas; track e.id) {
            <p-button [label]="e.rotulo" [icon]="'pi ' + e.icone" size="small" [text]="etapa() !== e.id" [style]="etapa() !== e.id ? corTexto : null" (onClick)="ir(e.id)" />
          }
        </div>
        <p-tag [value]="aprovadas(s) + '/' + s.fases.length + ' pontos de aprovação aprovados'" severity="secondary" />
      </nav>

      @if (erro()) {
        <p-message severity="error" [text]="erro()" styleClass="aviso" />
      }

      @switch (etapa()) {
        @case ('define') {
          <p-card header="Contexto da documentação" subheader="A documentação não é duplicada na especificação: os documentos do produto são consultados como contexto e só recebem alteração após a análise de impacto, a revisão humana e a publicação.">
            @if (s.referenciasDocumentais.length > 0) {
              <div class="chips">@for (r of s.referenciasDocumentais; track r) { <code class="chip">{{ r }}</code> }</div>
            } @else {
              <p class="mudo">Nenhuma referência documental selecionada na criação.</p>
            }
            <p-button label="Abrir documentação do produto" icon="pi pi-arrow-up-right" size="small" [outlined]="true" [style]="corTextoOutlined" [routerLink]="['/projetos/docs']" />
          </p-card>

          <div class="quadro">
            @for (col of colunas; track col.id) {
              <section class="coluna" [class.alvo]="alvo() === col.id" (dragover)="$event.preventDefault(); alvo.set(col.id)" (dragleave)="alvo.set(null)" (drop)="soltarFase(s, col.id)">
                <header><span class="rotulo">{{ col.nome }}</span><p-tag [value]="'' + fasesDa(s, col.id).length" severity="secondary" /></header>
                @for (f of fasesDa(s, col.id); track f.id) {
                  <article class="fase" [style.border-left-color]="borda(f)" [attr.draggable]="f.estado !== 'gerando' && s.status !== 'Publicada'" (dragstart)="arrastando.set(f.id)" (dragend)="arrastando.set(null)" (click)="abrirFase(f)">
                    <strong>{{ f.nome }}</strong>
                    <small class="mudo">{{ f.descricao }}</small>
                    <div class="selos">
                      @if (f.estado === 'aprovada') { <p-tag value="Aprovada" severity="success" icon="pi pi-check" /> }
                      @if (f.estado === 'gerando') { <p-tag value="Gerando" severity="info" icon="pi pi-spin pi-spinner" /> }
                      @if (f.pendencias.length > 0) { <p-tag [value]="f.pendencias.length + ' pendência(s)'" severity="warn" icon="pi pi-exclamation-triangle" /> }
                      @if (f.estado === 'erro') { <p-tag value="Falha na geração" severity="danger" /> }
                      <small class="mudo">{{ f.responsavel }}</small>
                    </div>
                    @if ((f.estado === 'pendente' || f.estado === 'revisao' || f.estado === 'erro') && s.status !== 'Publicada') {
                      <p-button label="Gerar com IA" icon="pi pi-sparkles" size="small" [outlined]="true" [fluid]="true" [style]="corTextoOutlined" [loading]="gerandoId() === f.id" (onClick)="$event.stopPropagation(); gerar(s, f.id)" />
                    }
                    @if (f.estado === 'revisao' && f.pendencias.length === 0 && s.status !== 'Publicada') {
                      <p-button label="Aprovar" icon="pi pi-check" size="small" severity="success" [fluid]="true" (onClick)="$event.stopPropagation(); mover(s, f.id, 'aprovada')" />
                    }
                  </article>
                } @empty {
                  <p class="vazio">Arraste uma fase para cá.</p>
                }
              </section>
            }
          </div>

          <p-card header="Funcionalidades da especificação" subheader="Funcionalidades são propostas durante o SPDD e podem ser revisadas sem transformar a especificação em CRUD.">
            @if (s.status !== 'Publicada') {
              <div class="linha">
                <input pInputText placeholder="Nome da nova funcionalidade" [(ngModel)]="novaFeature" (keydown.enter)="adicionarFeature(s)" [fluid]="true" />
                <p-button label="Adicionar" icon="pi pi-plus" (onClick)="adicionarFeature(s)" />
              </div>
            }
          </p-card>
          @for (f of s.features; track f.id) {
            <p-card styleClass="bloco">
              <ng-template #title>
                <span class="titulo-feature">
                  @if (editandoId() === f.id) {
                    <input pInputText [(ngModel)]="nomeEditado" />
                    <p-button label="Salvar" size="small" (onClick)="salvarNome(s, f)" />
                  } @else {
                    {{ f.codigo }} · {{ f.nome }}
                  }
                  <span class="espaco"></span>
                  <p-tag [value]="implementacaoDe(f.implementationStatus).rotulo" [severity]="implementacaoDe(f.implementationStatus).severidade" />
                  @if (s.status !== 'Publicada') {
                    <p-button icon="pi pi-pencil" [text]="true" severity="secondary" [rounded]="true" [ariaLabel]="'Editar ' + f.nome" (onClick)="editarNome(f)" />
                    <p-button icon="pi pi-trash" [text]="true" severity="danger" [rounded]="true" [ariaLabel]="'Remover ' + f.nome" (onClick)="removerFeat(s, f.id)" />
                  }
                </span>
              </ng-template>
              <ng-template #subtitle>{{ f.resumo }}</ng-template>
              <div class="chips">@for (p of f.patterns; track p) { <p-tag [value]="p" severity="contrast" /> }</div>
              <div class="tres">
                <div><span class="rotulo">Requisitos ({{ f.requirements.length }})</span>@for (r of f.requirements; track r.id) { <small class="mudo bloco">{{ r.id }} · {{ r.titulo }}</small> }</div>
                <div><span class="rotulo">Critérios de aceite ({{ f.acceptanceCriteria.length }})</span>@for (c of f.acceptanceCriteria; track c.id) { <small class="mudo bloco"><i class="pi" [class.pi-check-circle]="c.status === 'met'" [class.pi-question-circle]="c.status !== 'met'"></i> {{ c.id }}</small> }</div>
                <div><span class="rotulo">Repositórios / Tarefas ({{ f.taskIds.length }})</span><small class="mudo bloco">{{ f.impactedRepositories.join(', ') || 'A definir' }}</small></div>
              </div>
            </p-card>
          } @empty {
            <p-card styleClass="bloco"><p class="vazio">As funcionalidades serão propostas durante a fase de Especificação.</p></p-card>
          }

          @if (comPendencia(s).length > 0) {
            <p-card header="Refinar a intenção e as interações" subheader="Os pontos de aprovação continuam governando a aprovação. Responder as pendências abaixo regenera a fase sem criar ownership rígido por etapa." styleClass="bloco">
              @for (f of comPendencia(s); track f.id) {
                <div class="pendencias">
                  <strong>{{ f.nome }}: {{ f.pendencias.length }} pendência(s)</strong>
                  @for (p of f.pendencias; track p) {
                    <div class="campo">
                      <label [for]="f.id + p">{{ p }}</label>
                      <textarea pTextarea [id]="f.id + p" rows="2" placeholder="Descreva a decisão ou a resposta para esta pendência." [ngModel]="respostas()[f.id + '::' + p] || ''" (ngModelChange)="responder(f.id + '::' + p, $event)" [fluid]="true"></textarea>
                    </div>
                  }
                  <div class="acoes">
                    <p-button label="Cancelar" icon="pi pi-times" size="small" severity="secondary" [text]="true" (onClick)="limparRespostas(f)" />
                    <p-button label="Salvar" size="small" (onClick)="salvarRespostas(s, f)" />
                  </div>
                </div>
              }
            </p-card>
          }
        }

        @case ('design') {
          @if (s.artefatos.length === 0) {
            <p-card><p class="vazio">Nenhum artefato gerado ainda. Comece gerando a fase de constituição no quadro.</p></p-card>
          } @else {
            <div class="artefatos">
              <p-card header="Artefatos" [subheader]="s.artefatos.length + ' documento(s) da especificação'">
                @for (a of s.artefatos; track a.id) {
                  <button type="button" class="lista" [class.ativo]="a.id === artefato()?.id" (click)="escolher(a.id)">
                    {{ a.titulo }}<small class="mudo bloco">{{ nomeFase(s, a.faseId) }}</small>
                  </button>
                }
              </p-card>
              @if (artefato(); as a) {
                <p-card [header]="a.titulo" [subheader]="'Atualizado em ' + a.atualizadoEm + ' por ' + a.autor">
                  <div class="acoes topo">
                    <p-tag [value]="a.formato" severity="secondary" />
                    @if (editando()) {
                      <p-button label="Salvar" icon="pi pi-save" size="small" (onClick)="salvarArtefatoAtual(s, a.id)" />
                    } @else {
                      <p-button label="Editar" icon="pi pi-pencil" size="small" [outlined]="true" [disabled]="s.status === 'Publicada'" (onClick)="editar(a.conteudo)" />
                    }
                  </div>
                  @if (editando()) {
                    <textarea pTextarea rows="22" class="mono" [(ngModel)]="rascunho" [fluid]="true"></textarea>
                  } @else {
                    <pre class="codigo">{{ a.conteudo }}</pre>
                    @if (s.status === 'Publicada') { <small class="mudo"><i class="pi pi-eye"></i> Versão publicada em modo somente leitura.</small> }
                  }
                </p-card>
              }
            </div>
          }

          @if (s.features.length === 0) {
            <p-card styleClass="bloco"><p class="vazio">A prévia aparecerá quando a fase de Especificação propor uma funcionalidade.</p></p-card>
          } @else {
            @for (f of s.features; track f.id) {
              <p-card styleClass="bloco">
                <ng-template #title><span class="titulo-feature"><i class="pi pi-objects-column"></i> Renderizador de prévias</span></ng-template>
                <ng-template #subtitle>{{ f.codigo }} · {{ f.nome }} · derivado de funcionalidade + padrões + artefatos</ng-template>
                @if (f.patterns.length === 0) {
                  <p class="vazio">A funcionalidade ainda não possui padrões para gerar uma representação.</p>
                } @else {
                  <div class="previas">
                    @for (padrao of f.patterns; track padrao) {
                      <div class="previa">
                        <div class="previa-topo">
                          <strong><i [class]="'pi ' + iconePadrao(padrao)"></i> {{ rotuloPadrao(padrao) }}</strong>
                          <p-tag [value]="disponivel(padrao, s) ? 'Representação disponível' : 'Dados insuficientes'" [severity]="disponivel(padrao, s) ? 'success' : 'secondary'" />
                        </div>
                        @if (disponivel(padrao, s)) {
                          <p class="mudo">Prévia derivada do artefato {{ artefatoDoPadrao(padrao, s)?.titulo ?? 'aprovado' }}. A representação é somente visual e não executa código.</p>
                        } @else {
                          <p class="mudo">Não há artefatos suficientes para representar este padrão sem inventar informação.</p>
                        }
                      </div>
                    }
                  </div>
                }
              </p-card>
            }
          }
        }

        @case ('plan') {
          @if (s.tasks.length === 0) {
            <p-card><p class="vazio">Nenhuma tarefa gerada. Aprove o plano e gere a fase de tarefas.</p></p-card>
          } @else {
            <div class="quadro tres-col">
              @for (col of colunasTask; track col.id) {
                <section class="coluna" (dragover)="$event.preventDefault()" (drop)="soltarTask(s, col.id)">
                  <header><span class="rotulo">{{ col.nome }}</span><p-tag [value]="'' + tasksDa(s, col.id).length" severity="secondary" /></header>
                  @for (t of tasksDa(s, col.id); track t.id) {
                    <article class="fase tarefa" draggable="true" (dragstart)="arrastandoTask.set(t.id)">
                      <div class="topo-tarefa"><code class="mudo">{{ t.codigo }}</code>@if (t.paralelizavel) { <p-tag value="paralela" severity="info" icon="pi pi-bolt" /> }</div>
                      <strong>{{ t.titulo }}</strong>
                      <div class="selos"><p-tag [value]="t.story" severity="secondary" />@if (t.dependeDe.length > 0) { <small class="mudo"><i class="pi pi-sitemap"></i> {{ t.dependeDe.join(', ') }}</small> }</div>
                      <ul>@for (c of t.criterios; track c) { <li class="mudo">{{ c }}</li> }</ul>
                      <p-button label="Copiar prompt" icon="pi pi-copy" size="small" [text]="true" (onClick)="copiar(t.prompt, 'Prompt copiado')" />
                    </article>
                  }
                </section>
              }
            </div>
          }
          <p-card header="Salvaguardas e repositórios impactados" subheader="Orientações para a implementação externa, sem execução pelo EAI.dev." styleClass="bloco">
            @for (item of s.safeguards; track item) { <p class="mudo">{{ item }}</p> }
            <div class="chips">@for (r of repositoriosImpactados(s); track r) { <p-tag [value]="r" severity="secondary" /> }</div>
          </p-card>
        }

        @case ('validate') {
          <p-card [header]="'Análise de consistência'" [subheader]="'Rastreabilidade entre requisitos, regras, tarefas e cenários de teste.' + (criticos() > 0 ? ' ' + criticos() + ' item(ns) crítico(s) bloqueiam a publicação.' : '')">
            @for (a of achados(); track a.id) {
              <div class="achado"><div><strong>{{ a.tipo }}</strong><p class="mudo">{{ a.mensagem }}</p></div><p-tag [value]="a.severidade" [severity]="a.severidade === 'Crítico' ? 'danger' : a.severidade === 'Alto' ? 'warn' : 'info'" /></div>
            } @empty {
              <p class="mudo">Nenhuma inconsistência encontrada. A especificação está pronta para publicação.</p>
            }
          </p-card>
          <p-card header="Análise de impacto na documentação" subheader="Esta especificação altera os seguintes documentos do wiki-repo." styleClass="bloco">
            <p-tag [value]="revisada(s) ? 'Revisão humana concluída' : 'Aguardando revisão humana'" [severity]="revisada(s) ? 'success' : 'warn'" />
            @for (i of s.documentationImpact.items; track i.path) {
              <div class="achado"><div><code>{{ i.path }}</code><p class="mudo">{{ i.diff }}</p>@if (i.status !== 'proposed') { <small class="ok">Proposta revisada.</small> }</div><p-tag [value]="i.action === 'create' ? 'criar' : i.action === 'update' ? 'atualizar' : 'sem alteração'" severity="secondary" /></div>
            } @empty {
              <p class="mudo">Nenhum documento impactado foi identificado.</p>
            }
            @if (!revisada(s)) {
              <p-button label="Confirmar revisão humana" icon="pi pi-check-circle" (onClick)="revisar(s)" />
            } @else {
              <small class="ok">A publicação pode prosseguir para gerar a versão da especificação, atualizar a Wiki e gerar o pacote MCP.</small>
            }
          </p-card>
        }

        @case ('publish') {
          @if (s.publication; as pub) {
            <div class="resumo tres-res">
              <p-card header="Versão da especificação" [subheader]="s.codigo + ' v' + pub.specificationVersion + ' · imutável'"><p-tag value="Publicada" severity="success" /></p-card>
              <p-card header="Atualização da Wiki" [subheader]="pub.wikiUpdate.paths.length + ' documento(s) atualizado(s) no wiki-repo'"><p-tag [value]="pub.wikiUpdate.status === 'published' ? 'Atualizada' : 'Pendente'" severity="success" /></p-card>
              <p-card header="Pacote MCP" [subheader]="pub.mcpPackage.resource"><p-tag [value]="pub.mcpPackage.status === 'available' ? 'Disponível' : 'Gerado'" severity="success" /></p-card>
            </div>
          } @else {
            <p-card><p class="vazio">A tela de resultado aparecerá depois que a especificação passar pela revisão humana e for publicada.</p></p-card>
          }
          <p-card header="Pacote MCP" subheader="Conteúdo que o servidor MCP entrega aos agentes de código quando a especificação está publicada." styleClass="bloco">
            <div class="acoes topo">
              <p-tag [value]="s.status === 'Publicada' ? 'Disponível' : 'Somente após publicar'" [severity]="s.status === 'Publicada' ? 'success' : 'warn'" />
              <p-button label="Copiar" icon="pi pi-copy" size="small" [outlined]="true" (onClick)="copiar(json(s), 'Pacote MCP copiado')" />
              <p-button label="Baixar" icon="pi pi-download" size="small" [outlined]="true" (onClick)="baixar(s)" />
            </div>
            <p class="mudo">Recurso MCP: <code>eai-dev://specs/{{ s.id }}&#64;{{ s.versao }}</code></p>
            <pre class="codigo alto">{{ json(s) }}</pre>
          </p-card>
          <p-card header="Histórico de versões" subheader="Cada publicação congela os artefatos daquela versão." styleClass="bloco">
            @for (v of s.versoes; track v.versao) {
              <div class="achado"><div><strong>Versão {{ v.versao }}</strong><p class="mudo">{{ v.resumo }}</p><small class="mudo">{{ v.publicadoEm }} · {{ v.publicadoPor }}</small></div><p-tag value="Publicada" severity="success" /></div>
            } @empty {
              <p class="mudo">Esta spec ainda não foi publicada. A versão em elaboração é a {{ s.versao }}.</p>
            }
          </p-card>
        }

        @case ('implement') {
          <p-card header="Acompanhamento da implementação" subheader="Feedback recebido da IDE/coding assistant. O EAI.dev acompanha a implementação, mas não a executa.">
            <div class="achado"><div><code class="mudo">{{ s.codigo }}</code><br /><strong>{{ s.titulo }}</strong></div><p-tag [value]="implementacao(s).rotulo" [severity]="implementacao(s).severidade" /></div>
            <p-progressbar [value]="s.implementation.progress" />
            <div class="duas-col">
              @for (f of s.features; track f.id) {
                <div class="mini"><div class="mini-topo"><strong>{{ f.codigo }} · {{ f.nome }}</strong><p-tag [value]="implementacaoDe(f.implementationStatus).rotulo" [severity]="implementacaoDe(f.implementationStatus).severidade" /></div><small class="mudo bloco">{{ atendidos(f) }}/{{ f.acceptanceCriteria.length }} critérios atendidos</small></div>
              } @empty {
                <p class="mudo">Esta especificação ainda não tem funcionalidades.</p>
              }
            </div>
            @for (ev of s.implementation.feedback.slice(0, 2); track ev.id) {
              <small class="mudo bloco"><i class="pi pi-sitemap"></i> {{ ev.message }} {{ ev.repository ? '· ' + ev.repository : '' }}</small>
            }
          </p-card>
        }

        @case ('verify') {
          <p-card>
            <ng-template #title><span class="titulo-feature"><i class="pi pi-check-circle destaque"></i> VERIFICAR</span></ng-template>
            <ng-template #subtitle>As evidências recebidas da implementação são comparadas com os critérios de aceite, a conformidade e as divergências.</ng-template>
            <div class="selos situacao">
              <p-tag [value]="implementacao(s).rotulo" [severity]="implementacao(s).severidade" />
              <span class="mudo">{{ criteriosAtendidos(s) }}/{{ criterios(s).length }} critérios de aceite atendidos</span>
            </div>
            <div class="criterios">
              @for (c of criterios(s); track c.id) {
                <div class="criterio">
                  <i class="pi" [class.pi-check-circle]="c.status === 'met'" [class.pi-question-circle]="c.status !== 'met'" [class.ok]="c.status === 'met'" [class.aviso-cor]="c.status !== 'met'"></i>
                  <div><code class="mudo">{{ c.id }} · {{ c.codigo }}</code><span class="mudo bloco">{{ c.descricao }}</span></div>
                </div>
              } @empty {
                <p class="mudo">Esta especificação ainda não tem critérios de aceite.</p>
              }
            </div>
          </p-card>
          <p-card styleClass="bloco" [class.divergente]="divergente(s)">
            <ng-template #title><span class="titulo-feature"><i class="pi pi-exclamation-triangle aviso-cor"></i> Conformidade / Divergências</span></ng-template>
            <ng-template #subtitle>A divergência nunca atualiza o wiki-repo automaticamente.</ng-template>
            @if (divergente(s)) {
              <p class="perigo"><i class="pi pi-sitemap"></i> Foi identificada divergência em relação à intenção publicada.</p>
              <p-button label="Revisar especificação" (onClick)="reabrir(s)" />
            } @else {
              <p class="mudo sem-margem">Nenhuma divergência detectada nesta especificação.</p>
            }
          </p-card>
        }
      }
    } @else if (carregado()) {
      <p-card header="Especificação não encontrada" subheader="Não foi possível restaurar o contexto do produto.">
        <p-button label="Voltar para produtos" [outlined]="true" routerLink="/projetos" />
      </p-card>
    }
  `,
  styles: [
    `
      .resumo {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      /* Números do resumo menores que os do Painel: aqui cabem textos como "Em elaboração" sem quebrar em duas linhas. */
      .resumo ::ng-deep .valor {
        font-size: 1.25rem;
        line-height: 1.75rem;
      }
      .previas {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .previa {
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .previa-topo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .previa p {
        margin: 0.5rem 0 0;
        font-size: 0.875rem;
      }
      .destaque {
        color: var(--p-primary-color);
      }
      .aviso-cor {
        color: var(--p-yellow-500);
      }
      .situacao {
        margin-bottom: 0.75rem;
      }
      .criterios {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .criterio {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.625rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 6px;
        font-size: 0.875rem;
      }
      .criterio i {
        margin-top: 0.125rem;
      }
      .criterio code {
        font-size: 0.75rem;
      }
      .sem-margem {
        margin: 0;
      }
      :host ::ng-deep .divergente .p-card {
        border: 1px solid color-mix(in srgb, var(--p-red-500) 40%, transparent);
      }
      .tres-res {
        grid-template-columns: repeat(3, 1fr);
      }
      .ciclo {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
      }
      .etapas,
      .chips,
      .selos,
      .acoes {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem;
      }
      .acoes {
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .topo {
        margin-bottom: 0.75rem;
      }
      :host ::ng-deep .bloco,
      :host ::ng-deep .aviso {
        display: block;
        margin-top: 1rem;
      }
      .quadro {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .tres-col {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: 0;
      }
      .coluna {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 14rem;
        padding: 0.625rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
      }
      .coluna.alvo {
        border-color: var(--p-primary-color);
        background: var(--p-highlight-background);
      }
      .coluna header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.25rem;
      }
      .rotulo {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--p-text-muted-color);
      }
      .fase {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-left: 4px solid;
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-background);
        cursor: pointer;
      }
      .tarefa {
        border-left-color: var(--p-content-border-color);
        cursor: grab;
      }
      .tarefa ul {
        margin: 0;
        padding-left: 1rem;
        font-size: 0.75rem;
      }
      .topo-tarefa {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .vazio {
        padding: 1.5rem 0.25rem;
        text-align: center;
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      .bloco {
        display: block;
      }
      .ok {
        color: var(--p-green-600);
      }
      .perigo {
        color: var(--p-red-600);
      }
      .linha {
        display: flex;
        gap: 0.5rem;
      }
      .titulo-feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .espaco {
        flex: 1;
      }
      .tres {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        margin-top: 0.75rem;
      }
      .pendencias {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .artefatos {
        display: grid;
        grid-template-columns: 18rem 1fr;
        gap: 1rem;
        align-items: start;
      }
      .lista {
        display: block;
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .lista:hover {
        background: var(--p-content-hover-background);
      }
      .lista.ativo {
        background: var(--p-highlight-background);
        color: var(--p-primary-color);
        font-weight: 500;
      }
      .codigo {
        margin: 0;
        padding: 0.75rem;
        overflow: auto;
        white-space: pre-wrap;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
      }
      .alto {
        max-height: 26rem;
      }
      .mono {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 0.8125rem;
      }
      .achado {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem;
        margin: 0.5rem 0;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
      }
      .achado p {
        margin: 0.25rem 0 0;
      }
      .duas-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin: 0.75rem 0;
      }
      .mini-topo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .mini:only-child {
        grid-column: 1 / -1;
      }
      .mini {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.625rem;
        border-radius: var(--p-content-border-radius);
        background: var(--p-content-hover-background);
      }
      @media (max-width: 1100px) {
        .previas,
        .quadro,
        .tres-col,
        .tres-res,
        .artefatos,
        .duas-col {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class EspecificacaoDetalhePage {
  private readonly router = inject(Router);
  private readonly mensagens = inject(MessageService);
  private readonly auth = inject(AuthService);

  /** Vêm da rota (`/projetos/especificacoes/:id?stage=&origem=`). */
  readonly id = input.required<string>();
  readonly stage = input<Etapa | undefined>(undefined);
  readonly origem = input<string | undefined>(undefined);

  protected readonly etapas = ETAPAS;
  /** Etapas que não estão abertas usam a cor de texto padrão; só a aberta fica em destaque (verde). */
  /** Botão com contorno em tom neutro: letra na cor de texto padrão e borda na cor de borda padrão. */
  protected readonly corTextoOutlined = { '--p-button-outlined-primary-color': 'var(--p-text-color)', '--p-button-outlined-primary-border-color': 'var(--p-content-border-color)' };
  protected readonly corTexto = { '--p-button-text-primary-color': 'var(--p-text-color)' };
  protected readonly colunas = ESTADOS_KANBAN;
  protected readonly colunasTask = ESTADOS_TASK;

  protected readonly spec = signal<Spec | undefined>(undefined);
  protected readonly carregado = signal(false);
  protected readonly erro = signal('');
  protected readonly gerandoId = signal<SpecFaseId | null>(null);
  protected readonly arrastando = signal<string | null>(null);
  protected readonly arrastandoTask = signal<string | null>(null);
  protected readonly alvo = signal<SpecFaseEstado | null>(null);
  protected readonly respostas = signal<Record<string, string>>({});
  protected readonly faseSelecionada = signal<string | undefined>(undefined);
  protected readonly artefatoId = signal<string | undefined>(undefined);
  protected readonly editando = signal(false);
  protected readonly editandoId = signal<string | undefined>(undefined);
  protected novaFeature = '';
  protected nomeEditado = '';
  protected rascunho = '';

  protected readonly etapa = computed<Etapa>(() => this.stage() ?? 'define');
  protected readonly achados = computed(() => (this.spec() ? analisarConsistencia(this.spec()!) : []));
  protected readonly criticos = computed(() => this.achados().filter((a) => a.severidade === 'Crítico').length);
  protected readonly publicacao = computed(() => (this.spec() ? podePublicar(this.spec()!) : { ok: false }) as { ok: boolean; motivo?: string });
  protected readonly artefato = computed(() => {
    const s = this.spec();
    if (!s) return undefined;
    const doFase = this.faseSelecionada() ? s.artefatos.find((a) => a.faseId === this.faseSelecionada()) : undefined;
    return s.artefatos.find((a) => a.id === this.artefatoId()) ?? doFase ?? s.artefatos[0];
  });

  constructor() {
    effect(() => {
      const id = this.id();
      void obterSpec(id).then((s) => {
        this.spec.set(s);
        this.carregado.set(true);
      });
    });
  }

  protected trilha(s: Spec) {
    return [
      { label: 'Produtos', routerLink: '/projetos' },
      { label: s.projeto, routerLink: '/projetos/' + s.projetoId },
      { label: 'Especificações', routerLink: '/projetos/especificacoes' },
      { label: s.titulo },
    ];
  }

  private async recarregar(): Promise<void> {
    this.spec.set(await obterSpec(this.id()));
  }

  protected ir(etapa: Etapa): void {
    void this.router.navigate([], { queryParams: { stage: etapa }, queryParamsHandling: 'merge' });
  }

  protected voltar(s: Spec): void {
    void this.router.navigate(this.origem() === 'lista' ? ['/projetos/especificacoes'] : ['/projetos', s.projetoId]);
  }


  private static readonly ROTULOS_PADRAO: Record<string, string> = {
    CRUD: 'CRUD',
    API: 'API',
    Integration: 'Integração',
    Workflow: 'Fluxo',
    Event: 'Evento',
    Job: 'Rotina',
    Report: 'Relatório',
    UI: 'Interface',
    'Business Rule': 'Regra de negócio',
    'Data Migration': 'Migração de dados',
    Architecture: 'Arquitetura',
  };
  private static readonly ICONES_PADRAO: Record<string, string> = {
    CRUD: 'pi-database',
    API: 'pi-code',
    Architecture: 'pi-objects-column',
    Integration: 'pi-sitemap',
    Workflow: 'pi-share-alt',
    Event: 'pi-sitemap',
    Job: 'pi-share-alt',
    Report: 'pi-objects-column',
    UI: 'pi-objects-column',
    'Business Rule': 'pi-file',
    'Data Migration': 'pi-database',
  };

  protected rotuloPadrao = (p: string) => EspecificacaoDetalhePage.ROTULOS_PADRAO[p] ?? p;
  protected iconePadrao = (p: string) => EspecificacaoDetalhePage.ICONES_PADRAO[p] ?? 'pi-file';

  /** Tipo de artefato que sustenta cada padrão; CRUD depende do modelo de dados, não de um artefato. */
  private tipoDoPadrao(p: string): string {
    if (p === 'Architecture') return 'arquitetura';
    if (p === 'API' || p === 'Integration' || p === 'Event') return 'contratos';
    if (p === 'Business Rule') return 'regras';
    if (p === 'Data Migration') return 'data-model';
    return 'requisitos';
  }

  protected disponivel(p: string, s: Spec): boolean {
    if (p === 'CRUD') return s.entidades.length > 0;
    return s.artefatos.some((a) => a.tipo === this.tipoDoPadrao(p));
  }

  protected artefatoDoPadrao = (p: string, s: Spec) => s.artefatos.find((a) => a.tipo === this.tipoDoPadrao(p));

  protected aprovadas = (s: Spec) => s.fases.filter((f) => f.estado === 'aprovada').length;
  protected implementacao = (s: Spec) => IMPLEMENTACAO[s.implementation.status];
  protected implementacaoDe = (status: SpecImplementationStatus) => IMPLEMENTACAO[status];
  protected borda = (f: SpecFase) => BORDA[f.estado];
  protected nomeFase = (s: Spec, id: SpecFaseId) => s.fases.find((f) => f.id === id)?.nome;
  protected revisada = (s: Spec) => s.documentationImpact.status === 'reviewed' || s.documentationImpact.status === 'published';
  protected comPendencia = (s: Spec) => s.fases.filter((f) => f.pendencias.length > 0);
  protected atendidos = (f: SpecFeature) => f.acceptanceCriteria.filter((c) => c.status === 'met').length;
  protected criterios = (s: Spec) => s.features.flatMap((f) => f.acceptanceCriteria.map((c) => ({ ...c, codigo: f.codigo })));
  protected criteriosAtendidos = (s: Spec) => this.criterios(s).filter((c) => c.status === 'met').length;
  protected divergente = (s: Spec) => s.implementation.status === 'DRIFT DETECTED' || s.features.some((f) => f.implementationStatus === 'DRIFT DETECTED');
  protected repositoriosImpactados = (s: Spec) => [...new Set(s.features.flatMap((f) => f.impactedRepositories))];
  protected json = (s: Spec) => JSON.stringify(montarPacoteMcp(s), null, 2);

  protected fasesDa(s: Spec, estado: SpecFaseEstado): SpecFase[] {
    return s.fases.filter((f) => (estado === 'pendente' ? f.estado === 'pendente' || f.estado === 'erro' : f.estado === estado));
  }

  protected tasksDa(s: Spec, estado: SpecTaskEstado) {
    return s.tasks.filter((t) => t.estado === estado);
  }

  protected abrirFase(f: SpecFase): void {
    this.faseSelecionada.set(f.id);
    this.artefatoId.set(undefined);
    this.ir(ETAPA_DA_FASE[f.id]);
  }

  protected async gerar(s: Spec, faseId: SpecFaseId, ajustes = ''): Promise<void> {
    this.gerandoId.set(faseId);
    await marcarFaseGerando(s.id, faseId);
    await this.recarregar();
    try {
      const resultado = await gerarFaseLocal(s, faseId, ajustes);
      await aplicarGeracao(s.id, faseId, resultado);
      this.faseSelecionada.set(faseId);
      this.artefatoId.set(undefined);
      this.mensagens.add({ severity: 'success', summary: 'Fase concluída', detail: 'Revise os artefatos antes de aprovar o ponto de aprovação.' });
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : 'Falha ao gerar a fase.';
      await marcarFaseErro(s.id, faseId, mensagem);
      this.mensagens.add({ severity: 'error', summary: 'Não foi possível gerar a fase', detail: mensagem });
    } finally {
      this.gerandoId.set(null);
      await this.recarregar();
    }
  }

  protected async mover(s: Spec, faseId: SpecFaseId, destino: SpecFaseEstado): Promise<void> {
    const resposta = await moverFase(s.id, faseId, destino);
    await this.recarregar();
    if (resposta.erro) {
      this.erro.set(resposta.erro);
      this.mensagens.add({ severity: 'error', summary: 'Não foi possível mover a fase', detail: resposta.erro });
    } else this.erro.set('');
  }

  protected async soltarFase(s: Spec, destino: SpecFaseEstado): Promise<void> {
    const fase = this.arrastando();
    this.arrastando.set(null);
    this.alvo.set(null);
    if (fase) await this.mover(s, fase as SpecFaseId, destino);
  }

  protected async soltarTask(s: Spec, destino: SpecTaskEstado): Promise<void> {
    const task = this.arrastandoTask();
    this.arrastandoTask.set(null);
    if (task) {
      await moverTask(s.id, task, destino);
      await this.recarregar();
    }
  }

  protected async adicionarFeature(s: Spec): Promise<void> {
    const nome = this.novaFeature.trim();
    if (!nome) return;
    await salvarFeature(s.id, {
      id: `${s.id}-feat-${Date.now()}`,
      codigo: `FEAT-${String(s.features.length + 1).padStart(3, '0')}`,
      nome,
      resumo: 'Funcionalidade adicionada durante a revisão da especificação.',
      patterns: ['UI'],
      requirements: [],
      businessRules: [],
      acceptanceCriteria: [],
      operations: [],
      impactedRepositories: [],
      taskIds: [],
      implementationStatus: 'NOT STARTED',
    });
    this.novaFeature = '';
    await this.recarregar();
  }

  protected editarNome(f: SpecFeature): void {
    this.editandoId.set(f.id);
    this.nomeEditado = f.nome;
  }

  protected async salvarNome(s: Spec, f: SpecFeature): Promise<void> {
    await salvarFeature(s.id, { ...f, nome: this.nomeEditado.trim() || f.nome });
    this.editandoId.set(undefined);
    await this.recarregar();
  }

  protected async removerFeat(s: Spec, id: string): Promise<void> {
    await removerFeature(s.id, id);
    await this.recarregar();
  }

  protected responder(chave: string, valor: string): void {
    this.respostas.update((atual) => ({ ...atual, [chave]: valor }));
  }

  protected limparRespostas(f: SpecFase): void {
    this.respostas.update((atual) => {
      const proximo = { ...atual };
      for (const p of f.pendencias) delete proximo[`${f.id}::${p}`];
      return proximo;
    });
  }

  /** As respostas viram o ajuste que orienta a nova geração da fase. */
  protected async salvarRespostas(s: Spec, f: SpecFase): Promise<void> {
    const texto = f.pendencias.map((p) => `- ${p}\n  Resposta: ${this.respostas()[`${f.id}::${p}`]?.trim() || '(sem resposta)'}`).join('\n');
    this.limparRespostas(f);
    await limparPendencias(s.id, f.id);
    await this.recarregar();
    await this.gerar(s, f.id, texto);
  }

  protected escolher(id: string): void {
    this.artefatoId.set(id);
    this.editando.set(false);
  }

  protected editar(conteudo: string): void {
    this.rascunho = conteudo;
    this.editando.set(true);
  }

  protected async salvarArtefatoAtual(s: Spec, artefatoId: string): Promise<void> {
    await salvarArtefato(s.id, artefatoId, this.rascunho);
    this.editando.set(false);
    await this.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Artefato atualizado com sucesso', detail: 'O conteúdo refinado substituiu a versão anterior.' });
  }

  protected async revisar(s: Spec): Promise<void> {
    await revisarDocumentationImpact(s.id, this.auth.sessao()?.usuario.nome ?? 'Usuário do produto');
    await this.recarregar();
    this.mensagens.add({ severity: 'success', summary: 'Revisão concluída', detail: 'As alterações propostas na Wiki passaram pela aprovação humana.' });
  }

  protected async publicar(s: Spec): Promise<void> {
    const resultado = await publicarSpec(s.id);
    await this.recarregar();
    if (resultado.erro) this.mensagens.add({ severity: 'error', summary: 'Não foi possível publicar', detail: resultado.erro });
    else {
      this.ir('publish');
      this.mensagens.add({ severity: 'success', summary: 'Especificação publicada', detail: 'Nova versão na Wiki e pacote MCP disponível aos agentes.' });
    }
  }

  protected async reabrir(s: Spec): Promise<void> {
    await reabrirSpec(s.id);
    await this.recarregar();
    this.ir('define');
    this.mensagens.add({ severity: 'success', summary: 'Nova versão aberta', detail: 'A especificação voltou para revisão da intenção.' });
  }

  protected copiar(texto: string, titulo: string): void {
    void navigator.clipboard.writeText(texto);
    this.mensagens.add({ severity: 'success', summary: titulo });
  }

  protected baixar(s: Spec): void {
    const url = URL.createObjectURL(new Blob([this.json(s)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${s.id}-mcp.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
