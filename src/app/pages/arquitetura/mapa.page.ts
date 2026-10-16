import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';

import { PageHeader } from '../../layout/page-header.component';

type No = { id: string; x: number; y: number; rotulo: string; tipo?: 'entrada' | 'saida' };
type Ligacao = { id: string; de: string; para: string; rotulo: string; animada?: boolean };

const LARGURA = 170;
const ALTURA = 36;

const NOS: No[] = [
  { id: 'cidadao', x: 0, y: 120, rotulo: 'Cidadão / Servidor', tipo: 'entrada' },
  { id: 'portal', x: 220, y: 40, rotulo: 'portal-servidor-web' },
  { id: 'app', x: 220, y: 200, rotulo: 'cidadao-app' },
  { id: 'gateway', x: 470, y: 120, rotulo: 'api-gateway' },
  { id: 'auth', x: 700, y: 10, rotulo: 'auth-service' },
  { id: 'pagamentos', x: 700, y: 120, rotulo: 'pagamentos-core' },
  { id: 'notificacao', x: 700, y: 230, rotulo: 'notificacao-service' },
  { id: 'banco', x: 940, y: 65, rotulo: 'postgres-identidade', tipo: 'saida' },
  { id: 'financeiro', x: 940, y: 175, rotulo: 'postgres-financeiro', tipo: 'saida' },
];

const LIGACOES: Ligacao[] = [
  { id: 'e1', de: 'cidadao', para: 'portal', rotulo: 'acessa', animada: true },
  { id: 'e2', de: 'cidadao', para: 'app', rotulo: 'acessa', animada: true },
  { id: 'e3', de: 'portal', para: 'gateway', rotulo: 'HTTPS' },
  { id: 'e4', de: 'app', para: 'gateway', rotulo: 'HTTPS' },
  { id: 'e5', de: 'gateway', para: 'auth', rotulo: 'valida token' },
  { id: 'e6', de: 'gateway', para: 'pagamentos', rotulo: 'roteia' },
  { id: 'e7', de: 'gateway', para: 'notificacao', rotulo: 'roteia' },
  { id: 'e8', de: 'auth', para: 'banco', rotulo: 'persiste' },
  { id: 'e9', de: 'pagamentos', para: 'financeiro', rotulo: 'persiste' },
];

/** Diagrama do fluxo de integrações, com zoom e arrasto da área. */
@Component({
  selector: 'app-mapa',
  imports: [PageHeader, Button],
  template: `
    <app-page-header titulo="Mapa de fluxos" [trilha]="[{ label: 'Arquitetura' }, { label: 'Mapa de fluxos' }]" />

    <div class="palco">
      <svg class="svg" width="100%" height="540" (pointerdown)="comecarPan($event)" (wheel)="roda($event)">
        <defs>
          <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="ponta" />
          </marker>
        </defs>
        <g [attr.transform]="'translate(' + t().x + ',' + t().y + ') scale(' + t().k + ')'">
          @for (l of ligacoes; track l.id) {
            <path [attr.d]="caminho(l)" class="ligacao" [class.animada]="l.animada" marker-end="url(#seta)" />
            <text [attr.x]="meio(l).x" [attr.y]="meio(l).y - 6" text-anchor="middle" class="legenda">{{ l.rotulo }}</text>
          }
          @for (n of nos; track n.id) {
            <g [attr.transform]="'translate(' + n.x + ',' + n.y + ')'">
              <rect [attr.width]="largura" [attr.height]="altura" rx="8" class="no" [class.entrada]="n.tipo === 'entrada'" [class.saida]="n.tipo === 'saida'" />
              <text [attr.x]="largura / 2" [attr.y]="altura / 2 + 4" text-anchor="middle" class="rotulo">{{ n.rotulo }}</text>
            </g>
          }
        </g>
      </svg>
      <div class="controles">
        <p-button icon="pi pi-plus" [outlined]="true" severity="secondary" size="small" ariaLabel="Aproximar" (onClick)="zoom(1.2)" />
        <p-button icon="pi pi-minus" [outlined]="true" severity="secondary" size="small" ariaLabel="Afastar" (onClick)="zoom(0.8)" />
        <p-button icon="pi pi-expand" [outlined]="true" severity="secondary" size="small" ariaLabel="Ajustar à tela" (onClick)="ajustar()" />
      </div>
    </div>
  `,
  styles: [
    `
      .palco {
        position: relative;
        height: 540px;
        overflow: hidden;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        background: radial-gradient(circle at 1px 1px, var(--p-content-border-color) 1px, transparent 0) 0 0 / 18px 18px, var(--p-content-background);
      }
      .svg {
        display: block;
        cursor: grab;
        touch-action: none;
      }
      .no {
        fill: var(--p-content-background);
        stroke: var(--p-surface-400);
        stroke-width: 1.5;
      }
      .no.entrada {
        stroke: var(--p-primary-color);
      }
      .no.saida {
        stroke: var(--p-sky-500);
      }
      .rotulo {
        font-size: 12px;
        fill: var(--p-text-color);
      }
      .ligacao {
        fill: none;
        stroke: var(--p-surface-400);
        stroke-width: 1.5;
      }
      .ligacao.animada {
        stroke: var(--p-primary-color);
        stroke-dasharray: 6 4;
        animation: fluxo 1s linear infinite;
      }
      .ponta {
        fill: var(--p-surface-400);
      }
      .legenda {
        font-size: 10px;
        fill: var(--p-text-muted-color);
      }
      .controles {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      @keyframes fluxo {
        to {
          stroke-dashoffset: -20;
        }
      }
    `,
  ],
})
export class MapaPage {
  protected readonly nos = NOS;
  protected readonly ligacoes = LIGACOES;
  protected readonly largura = LARGURA;
  protected readonly altura = ALTURA;

  private readonly inicial = { x: 40, y: 120, k: 0.85 };
  protected readonly t = signal({ ...this.inicial });

  private ponto(id: string, lado: 'direita' | 'esquerda') {
    const n = NOS.find((x) => x.id === id)!;
    return { x: n.x + (lado === 'direita' ? LARGURA : 0), y: n.y + ALTURA / 2 };
  }

  protected caminho(l: Ligacao): string {
    const a = this.ponto(l.de, 'direita');
    const b = this.ponto(l.para, 'esquerda');
    const meio = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${meio} ${a.y}, ${meio} ${b.y}, ${b.x} ${b.y}`;
  }

  protected meio(l: Ligacao): { x: number; y: number } {
    const a = this.ponto(l.de, 'direita');
    const b = this.ponto(l.para, 'esquerda');
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  protected zoom(fator: number): void {
    this.t.update((v) => ({ ...v, k: Math.min(2.5, Math.max(0.3, v.k * fator)) }));
  }

  protected roda(e: WheelEvent): void {
    e.preventDefault();
    this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
  }

  protected ajustar(): void {
    this.t.set({ ...this.inicial });
  }

  protected comecarPan(e: PointerEvent): void {
    const base = this.t();
    const andar = (m: PointerEvent) => this.t.set({ ...base, x: base.x + (m.clientX - e.clientX), y: base.y + (m.clientY - e.clientY) });
    const soltar = () => {
      window.removeEventListener('pointermove', andar);
      window.removeEventListener('pointerup', soltar);
    };
    window.addEventListener('pointermove', andar);
    window.addEventListener('pointerup', soltar);
  }
}
