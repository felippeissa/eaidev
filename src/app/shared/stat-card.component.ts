import { Component, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';

/** Indicador do painel: rótulo, valor grande, texto de apoio e um ícone. */
@Component({
  selector: 'app-stat-card',
  imports: [Card, Avatar],
  template: `
    <p-card>
      <div class="indicador">
        <div class="texto">
          <span class="rotulo">{{ label() }}</span>
          <span class="valor">{{ value() }}</span>
          @if (hint()) {
            <small class="apoio">{{ hint() }}</small>
          }
        </div>
        <p-avatar [icon]="icon()" shape="square" size="large" />
      </div>
    </p-card>
  `,
  styles: [
    `
      .indicador {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .texto {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .rotulo {
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--p-text-muted-color);
      }
      .valor {
        font-size: 1.75rem;
        font-weight: 600;
      }
      .apoio {
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>();
  readonly icon = input.required<string>();
}
