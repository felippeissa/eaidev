import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimulationLinkDatum, SimulationNodeDatum, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';

import type { GrafoDado } from '@/types';

type Categoria = 'db' | 'core' | 'front' | 'infra';
type NoSim = SimulationNodeDatum & { id: string; label: string; tipo: string; grau: number; categoria: Categoria };
type ArestaSim = SimulationLinkDatum<NoSim> & { tipo: string };

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;

const CATEGORIA_POR_TIPO: Record<string, Categoria> = { Banco: 'db', Serviço: 'core', Aplicação: 'front', Biblioteca: 'front', Plataforma: 'infra' };

const META: Record<Categoria, { cor: string; rotulo: string; tecnologia: string }> = {
  db: { cor: '#0ea5e9', rotulo: 'Banco de dados', tecnologia: 'PostgreSQL 16 / Redis 7' },
  core: { cor: '#10b981', rotulo: 'Serviço core / API', tecnologia: 'Java 21 · Spring Boot 3' },
  front: { cor: '#8b5cf6', rotulo: 'Interface / aplicação', tecnologia: 'Angular 19 · TypeScript' },
  infra: { cor: '#f59e0b', rotulo: 'Infraestrutura', tecnologia: 'Kubernetes · OpenTelemetry' },
};

const raio = (grau: number) => 16 + Math.min(grau, 8) * 2.6;
const idDe = (no: string | number | NoSim | undefined) => (no === undefined ? '' : typeof no === 'object' ? no.id : String(no));

/**
 * Grafo de dependências: malha com física (d3-force), zoom e pan, busca, arrasto dos nós e painel de metadados.
 */
@Component({
  selector: 'app-grafo-dependencias',
  imports: [FormsModule, Button, IconField, InputIcon, InputText, Tag],
  template: `
    <div class="palco" #palco>
      <svg #svg class="svg" [attr.width]="tamanho().w" [attr.height]="tamanho().h" (pointerdown)="comecarPan($event)" (wheel)="zoomRoda($event)">
        <g [attr.transform]="'translate(' + (tamanho().w / 2 + transform().x) + ',' + (tamanho().h / 2 + transform().y) + ') scale(' + transform().k + ')'">
          @for (a of arestas(); track $index) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2" class="aresta" [class.dim]="esmaecido(a.origem, a.alvo)" [class.ativa]="ativaAresta(a.origem, a.alvo)" />
          }
          @for (n of nosView(); track n.id) {
            <g class="no" [attr.transform]="'translate(' + n.x + ',' + n.y + ')'" [class.dim]="esmaecidoNo(n.id)" (pointerdown)="comecarArrasto($event, n.id)" (pointerenter)="hover.set(n.id)" (pointerleave)="hover.set(null)" (click)="selecionar(n.id); $event.stopPropagation()">
              <circle [attr.r]="n.r" [attr.fill]="n.cor" [attr.fill-opacity]="0.2" [attr.stroke]="n.cor" [attr.stroke-width]="selecionado() === n.id ? 3 : 1.5" />
              <circle [attr.r]="n.r * 0.45" [attr.fill]="n.cor" />
              <text [attr.y]="n.r + 14" text-anchor="middle" class="rotulo-no">{{ n.label }}</text>
            </g>
          }
        </g>
      </svg>

      <div class="legenda">
        @for (c of categorias; track c) {
          <span><i class="ponto" [style.background]="meta[c].cor"></i> {{ rotuloLegenda(c) }}</span>
        }
      </div>

      <div class="barra" [style.left]="noSelecionado() ? 'calc(50% - 150px)' : '50%'">
        <p-iconfield>
          <p-inputicon class="pi pi-search" />
          <input pInputText type="text" placeholder="Buscar componente" aria-label="Buscar componente" [ngModel]="busca()" (ngModelChange)="busca.set($event)" />
        </p-iconfield>
        <p-button icon="pi pi-plus" [text]="true" [rounded]="true" severity="secondary" ariaLabel="Aproximar" (onClick)="zoom(1.25)" />
        <p-button icon="pi pi-minus" [text]="true" [rounded]="true" severity="secondary" ariaLabel="Afastar" (onClick)="zoom(0.8)" />
        <p-button icon="pi pi-bullseye" [text]="true" [rounded]="true" severity="secondary" ariaLabel="Resetar câmera" (onClick)="resetar()" />
        <p-button [label]="pausado() ? 'Retomar física' : 'Pausar física'" [icon]="pausado() ? 'pi pi-play' : 'pi pi-pause'" [text]="!pausado()" [outlined]="pausado()" size="small" severity="secondary" (onClick)="alternarFisica()" />
      </div>

      <aside class="painel" [class.aberto]="!!noSelecionado()">
        @if (noSelecionado(); as n) {
          <div class="painel-topo">
            <div>
              <code class="nome">{{ n.label }}</code>
              <p-tag [value]="meta[n.categoria].rotulo" severity="secondary" [style]="{ color: meta[n.categoria].cor }" />
            </div>
            <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="secondary" size="small" ariaLabel="Fechar painel" (onClick)="selecionar(null)" />
          </div>
          <dl>
            <div><dt>Situação</dt><dd class="ok"><i class="pi pi-circle-fill"></i> Disponível</dd></div>
            <div><dt>Tipo</dt><dd>{{ n.tipo }}</dd></div>
            <div><dt>Tecnologia</dt><dd>{{ meta[n.categoria].tecnologia }}</dd></div>
            <div><dt>Conexões</dt><dd>{{ dependencias().length }}</dd></div>
          </dl>
          <h4>Dependências diretas</h4>
          @for (d of dependencias(); track d.alvo + d.tipo) {
            <button type="button" class="dep" (click)="selecionar(d.alvo)" (pointerenter)="hover.set(d.alvo)" (pointerleave)="hover.set(null)">
              <code>{{ d.alvo }}</code><span>{{ d.saida ? '→' : '←' }} {{ d.tipo }}</span>
            </button>
          }
        }
      </aside>
    </div>
  `,
  styles: [
    `
      .palco {
        position: relative;
        height: 620px;
        overflow: hidden;
        border: 1px solid var(--p-content-border-color);
        border-radius: 16px;
        background: radial-gradient(circle at 1px 1px, var(--p-content-border-color) 1px, transparent 0) 0 0 / 22px 22px, var(--p-content-background);
      }
      .svg {
        display: block;
        cursor: grab;
        touch-action: none;
      }
      .svg:active {
        cursor: grabbing;
      }
      .aresta {
        stroke: var(--p-text-muted-color);
        stroke-opacity: 0.45;
        stroke-width: 1.2;
      }
      .aresta.ativa {
        stroke: var(--p-primary-color);
        stroke-opacity: 1;
        stroke-width: 2;
      }
      .aresta.dim,
      .no.dim {
        opacity: 0.15;
      }
      .no {
        cursor: pointer;
      }
      .rotulo-no {
        font-size: 11px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        fill: var(--p-text-color);
        pointer-events: none;
      }
      .legenda {
        position: absolute;
        top: 1rem;
        left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 12px;
        background: color-mix(in srgb, var(--p-content-background) 80%, transparent);
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
        backdrop-filter: blur(8px);
      }
      .ponto {
        display: inline-block;
        width: 0.625rem;
        height: 0.625rem;
        margin-right: 0.375rem;
        border-radius: 50%;
      }
      .barra {
        position: absolute;
        bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem;
        transform: translateX(-50%);
        border: 1px solid var(--p-content-border-color);
        border-radius: 999px;
        background: color-mix(in srgb, var(--p-content-background) 80%, transparent);
        backdrop-filter: blur(8px);
        transition: left 0.3s;
      }
      .barra input {
        width: 11rem;
        border-radius: 999px;
      }
      .painel {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        padding: 1.25rem;
        overflow-y: auto;
        border-left: 1px solid var(--p-content-border-color);
        background: color-mix(in srgb, var(--p-content-background) 92%, transparent);
        transform: translateX(100%);
        transition: transform 0.3s;
      }
      .painel.aberto {
        transform: none;
      }
      .painel-topo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .painel-topo > div {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        align-items: flex-start;
      }
      .nome {
        font-weight: 600;
      }
      dl {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 0 0 1rem;
        font-size: 0.75rem;
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.625rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 8px;
      }
      dt {
        color: var(--p-text-muted-color);
      }
      dd {
        margin: 0;
        font-weight: 500;
        text-align: right;
      }
      dd.ok {
        color: var(--p-green-600);
      }
      h4 {
        margin: 0 0 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--p-text-muted-color);
      }
      .dep {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        margin-bottom: 0.5rem;
        padding: 0.625rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.75rem;
        text-align: left;
        cursor: pointer;
      }
      .dep:hover {
        background: var(--p-content-hover-background);
      }
      .dep span {
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class GrafoDependencias implements OnDestroy {
  private readonly zona = inject(NgZone);
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');

  readonly dados = input.required<GrafoDado>();

  protected readonly categorias: Categoria[] = ['db', 'core', 'front', 'infra'];
  protected readonly meta = META;

  protected readonly transform = signal({ x: 0, y: 0, k: 1 });
  protected readonly tamanho = signal({ w: 900, h: 620 });
  protected readonly hover = signal<string | null>(null);
  protected readonly selecionado = signal<string | null>(null);
  protected readonly busca = signal('');
  protected readonly pausado = signal(false);
  /** Muda a cada passo da simulação para o Angular redesenhar as posições. */
  private readonly tick = signal(0);

  private nos: NoSim[] = [];
  private ligacoes: ArestaSim[] = [];
  private sim?: ReturnType<typeof forceSimulation<NoSim>>;
  private observador?: ResizeObserver;

  protected readonly nosView = computed(() => {
    this.tick();
    return this.nos.map((n) => ({ id: n.id, label: n.label, x: n.x ?? 0, y: n.y ?? 0, r: raio(n.grau), cor: META[n.categoria].cor }));
  });

  protected readonly arestas = computed(() => {
    this.tick();
    return this.ligacoes.map((l) => {
      const o = l.source as NoSim;
      const t = l.target as NoSim;
      return { x1: o.x ?? 0, y1: o.y ?? 0, x2: t.x ?? 0, y2: t.y ?? 0, origem: o.id, alvo: t.id };
    });
  });

  protected readonly noSelecionado = computed(() => this.nos.find((n) => n.id === this.selecionado()) ?? null);

  /** Vizinhança do nó em foco (selecionado ou sob o mouse). */
  private readonly foco = computed(() => this.hover() ?? this.selecionado());
  private readonly vizinhos = computed(() => {
    const f = this.foco();
    if (!f) return null;
    const conj = new Set<string>([f]);
    for (const l of this.ligacoes) {
      const o = idDe(l.source);
      const t = idDe(l.target);
      if (o === f) conj.add(t);
      if (t === f) conj.add(o);
    }
    return conj;
  });

  protected readonly dependencias = computed(() => {
    const s = this.selecionado();
    if (!s) return [];
    return this.ligacoes.flatMap((l) => {
      const o = idDe(l.source);
      const t = idDe(l.target);
      if (o === s) return [{ alvo: t, tipo: l.tipo, saida: true }];
      if (t === s) return [{ alvo: o, tipo: l.tipo, saida: false }];
      return [];
    });
  });

  constructor() {
    effect(() => this.montar(this.dados()));
    afterNextRender(() => {
      const el = this.palco().nativeElement;
      const medir = () => this.tamanho.set({ w: el.clientWidth, h: el.clientHeight });
      medir();
      this.observador = new ResizeObserver(medir);
      this.observador.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.sim?.stop();
    this.observador?.disconnect();
  }

  private montar(dados: GrafoDado): void {
    this.sim?.stop();
    this.nos = dados.nos.map((n) => ({ ...n, categoria: CATEGORIA_POR_TIPO[n.tipo] ?? 'infra' }));
    const porId = new Map(this.nos.map((n) => [n.id, n]));
    this.ligacoes = dados.arestas.flatMap((a) => {
      const source = porId.get(a.source);
      const target = porId.get(a.target);
      return source && target ? [{ source, target, tipo: a.tipo } as ArestaSim] : [];
    });
    this.zona.runOutsideAngular(() => {
      this.sim = forceSimulation<NoSim>(this.nos)
        .force('link', forceLink<NoSim, ArestaSim>(this.ligacoes).id((n) => n.id).distance(110).strength(0.5))
        .force('charge', forceManyBody<NoSim>().strength(-620).distanceMax(720))
        .force('collide', forceCollide<NoSim>((n) => raio(n.grau) + 16).strength(0.9))
        .force('center', forceCenter(0, 0).strength(0.06))
        .force('x', forceX(0).strength(0.035))
        .force('y', forceY(0).strength(0.05))
        .on('tick', () => this.zona.run(() => this.tick.update((v) => v + 1)));
    });
  }

  protected rotuloLegenda(c: Categoria): string {
    const total = this.nos.filter((n) => n.categoria === c).length;
    const nome = { db: 'Bancos', core: 'Serviços core', front: 'Frontends', infra: 'Infraestrutura' }[c];
    return `${nome} (${total})`;
  }

  /** Esmaece o que não é do foco nem casa com a busca. */
  protected esmaecidoNo(id: string): boolean {
    const termo = this.busca().trim().toLowerCase();
    if (termo) return !this.nos.find((n) => n.id === id)?.label.toLowerCase().includes(termo);
    const v = this.vizinhos();
    return v ? !v.has(id) : false;
  }

  protected esmaecido(origem: string, alvo: string): boolean {
    const termo = this.busca().trim().toLowerCase();
    if (termo) return true;
    const f = this.foco();
    return f ? origem !== f && alvo !== f : false;
  }

  protected ativaAresta(origem: string, alvo: string): boolean {
    const f = this.foco();
    return !!f && (origem === f || alvo === f);
  }

  protected selecionar(id: string | null): void {
    this.selecionado.set(id);
  }

  /* ---------- zoom e pan ---------- */

  protected zoom(fator: number): void {
    this.transform.update((t) => ({ ...t, k: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k * fator)) }));
  }

  protected zoomRoda(evento: WheelEvent): void {
    evento.preventDefault();
    this.zoom(evento.deltaY < 0 ? 1.1 : 0.9);
  }

  protected resetar(): void {
    this.transform.set({ x: 0, y: 0, k: 1 });
  }

  protected alternarFisica(): void {
    this.pausado.update((p) => !p);
    if (this.pausado()) this.sim?.stop();
    else this.sim?.alpha(0.5).restart();
  }

  protected comecarPan(evento: PointerEvent): void {
    if ((evento.target as Element).closest('.no')) return;
    this.selecionar(null);
    const base = this.transform();
    const andar = (e: PointerEvent) => this.transform.set({ ...base, x: base.x + (e.clientX - evento.clientX), y: base.y + (e.clientY - evento.clientY) });
    const soltar = () => {
      window.removeEventListener('pointermove', andar);
      window.removeEventListener('pointerup', soltar);
    };
    window.addEventListener('pointermove', andar);
    window.addEventListener('pointerup', soltar);
  }

  /** Arrastar um nó o fixa sob o ponteiro enquanto o gesto durar. */
  protected comecarArrasto(evento: PointerEvent, id: string): void {
    evento.stopPropagation();
    const no = this.nos.find((n) => n.id === id);
    if (!no) return;
    let moveu = false;
    const alvoPara = (e: PointerEvent) => {
      const t = this.transform();
      const r = this.palco().nativeElement.getBoundingClientRect();
      return { x: (e.clientX - r.left - this.tamanho().w / 2 - t.x) / t.k, y: (e.clientY - r.top - this.tamanho().h / 2 - t.y) / t.k };
    };
    const andar = (e: PointerEvent) => {
      moveu = true;
      const p = alvoPara(e);
      no.fx = p.x;
      no.fy = p.y;
      this.sim?.alphaTarget(0.3).restart();
    };
    const soltar = () => {
      no.fx = null;
      no.fy = null;
      this.sim?.alphaTarget(0);
      if (this.pausado()) this.sim?.stop();
      window.removeEventListener('pointermove', andar);
      window.removeEventListener('pointerup', soltar);
      if (!moveu) this.selecionar(id);
    };
    window.addEventListener('pointermove', andar);
    window.addEventListener('pointerup', soltar);
  }
}
