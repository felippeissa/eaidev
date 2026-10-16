import { Component } from '@angular/core';

/** Logo "Aplicações Expresso" do design: 12 vetores posicionados por inset (%) mais o texto "Aplicações". */
@Component({
  selector: 'app-logo-expresso',
  template: `
    <div class="logo" role="img" aria-label="Aplicações Expresso">
      @for (v of vetores; track v.arquivo) {
        <div class="vetor" [style.inset]="v.inset">
          <img alt="" [src]="'login/logo/' + v.arquivo" />
        </div>
      }
      <span class="aplicacoes">Aplicações</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 71.575px;
        padding: 20.949px 0;
        box-sizing: border-box;
      }
      .logo {
        position: relative;
        width: 196px;
        height: 50.257px;
        flex-shrink: 0;
      }
      .vetor {
        position: absolute;
      }
      .vetor img {
        position: absolute;
        inset: 0;
        display: block;
        max-width: none;
        width: 100%;
        height: 100%;
      }
      .aplicacoes {
        position: absolute;
        left: 80.54px;
        top: -22.44px;
        font-style: italic;
        font-weight: 800;
        font-size: 17.457px;
        line-height: 19.203px;
        color: #00a76f;
        text-transform: uppercase;
        white-space: nowrap;
      }
    `,
  ],
})
export class LogoExpresso {
  /** inset no formato CSS: topo direita base esquerda, igual ao do design. */
  protected readonly vetores = [
    { arquivo: 'v0.svg', inset: '0.52% 24.31% 30.1% 61.29%' },
    { arquivo: 'v1.svg', inset: '0.52% 14.35% 30.1% 70.78%' },
    { arquivo: 'v2.svg', inset: '0 83.61% 29.72% 0' },
    { arquivo: 'v3.svg', inset: '0 57.24% 0.22% 23.53%' },
    { arquivo: 'v4.svg', inset: '0.65% 45.44% 31.41% 40.56%' },
    { arquivo: 'v5.svg', inset: '1.69% 72.61% 31.41% 10.72%' },
    { arquivo: 'v6.svg', inset: '0 0 29.72% 81.74%' },
    { arquivo: 'v7.svg', inset: '0 35.11% 29.72% 49.43%' },
    { arquivo: 'v8.svg', inset: '79.23% 20.73% 14.24% 60.71%' },
    { arquivo: 'v9.svg', inset: '79.22% 40.64% 14.25% 54.89%' },
    { arquivo: 'v10.svg', inset: '93.47% 16.19% 0 65.26%' },
    { arquivo: 'v11.svg', inset: '93.46% 36.09% 0.01% 59.43%' },
  ];
}
