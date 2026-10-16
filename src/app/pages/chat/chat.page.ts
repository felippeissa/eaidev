import { AfterViewChecked, Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';

import { PageHeader } from '../../layout/page-header.component';

type Mensagem = { id: string; autor: 'voce' | 'suporte'; texto: string; hora: string };

const INICIAL: Mensagem[] = [
  { id: 'm1', autor: 'suporte', texto: 'Olá! Sou o time de plataforma. Como podemos ajudar hoje?', hora: '09:12' },
  { id: 'm2', autor: 'voce', texto: 'A esteira do pagamentos-core está falhando nos testes desde ontem.', hora: '09:14' },
  { id: 'm3', autor: 'suporte', texto: 'Identificamos indisponibilidade no banco de homologação. Já abrimos o incidente INC-002 e estamos atuando.', hora: '09:16' },
];

@Component({
  selector: 'app-chat',
  imports: [FormsModule, PageHeader, Avatar, Button, Card, ProgressBar, Tag, Textarea],
  template: `
    <app-page-header titulo="Suporte da plataforma" [trilha]="[{ label: 'Suporte' }]" />

    <div class="grade">
      <p-card>
        <ng-template #title><span class="titulo">Canal #plataforma-suporte <p-tag value="Assistente EAI" severity="info" icon="pi pi-sparkles" /></span></ng-template>
        <div class="mensagens" #lista>
          @for (m of mensagens(); track m.id) {
            <div class="mensagem" [class.minha]="m.autor === 'voce'">
              <p-avatar [icon]="m.autor === 'voce' ? 'pi pi-user' : 'pi pi-android'" shape="circle" />
              <div class="balao">
                <p>{{ m.texto }}</p>
                <small class="mudo">{{ m.hora }}</small>
              </div>
            </div>
          }
          <div class="ferramenta">
            <i class="pi pi-check-circle ok"></i>
            <div><code>incidentes.buscar</code><small class="mudo bloco">INC-002 · banco de homologação indisponível</small></div>
          </div>
          <div class="pensando"><i class="pi pi-spin pi-spinner"></i> Consultando base de conhecimento</div>
        </div>
        <div class="composer">
          <textarea pTextarea rows="2" aria-label="Mensagem" placeholder="Escreva uma mensagem..." [ngModel]="texto()" (ngModelChange)="texto.set($event)" (keydown.enter)="enviarEnter($event)" [fluid]="true"></textarea>
          <p-button icon="pi pi-send" ariaLabel="Enviar mensagem" [disabled]="!texto().trim()" (onClick)="enviar()" />
        </div>
      </p-card>

      <div class="lateral">
        <p-card>
          <div class="agente">
            <p-avatar icon="pi pi-android" shape="circle" size="large" />
            <div>
              <strong>Agente de Plataforma</strong>
              <p-tag value="Ativo" severity="success" [rounded]="true" />
            </div>
          </div>
          <p class="mudo">Responde dúvidas sobre esteiras, ambientes e integrações.</p>
          <code class="mono mudo">google/gemini-2.5-flash</code>
        </p-card>
        <p-card styleClass="bloco">
          <div class="tokens"><span class="mudo">Uso de tokens</span><code>18.420 / 50.000</code></div>
          <p-progressbar [value]="37" [showValue]="false" [style]="{ height: '8px' }" />
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      .grade {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 20rem;
        gap: 1.5rem;
        align-items: start;
      }
      .titulo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .mensagens {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 26rem;
        padding-right: 0.5rem;
        overflow-y: auto;
      }
      .mensagem {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }
      .mensagem.minha {
        flex-direction: row-reverse;
      }
      .balao {
        max-width: 42rem;
        padding: 0.625rem 1rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--p-content-border-radius);
        font-size: 0.875rem;
      }
      .minha .balao {
        border-color: transparent;
        background: var(--p-highlight-background);
        color: var(--p-primary-color);
      }
      .balao p {
        margin: 0 0 0.25rem;
      }
      .ferramenta {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--p-content-border-color);
        border-radius: 6px;
        background: var(--p-content-hover-background);
        font-size: 0.875rem;
      }
      .ok {
        margin-top: 0.125rem;
        color: var(--p-green-500);
      }
      .pensando {
        font-size: 0.875rem;
        color: var(--p-text-muted-color);
      }
      .composer {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      .lateral {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .agente {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .agente div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: flex-start;
      }
      .tokens {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.75rem;
      }
      .mono {
        font-size: 0.75rem;
      }
      .bloco {
        display: block;
      }
      .mudo {
        color: var(--p-text-muted-color);
      }
      @media (max-width: 1000px) {
        .grade {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ChatPage implements AfterViewChecked {
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private rolar = false;

  protected readonly mensagens = signal<Mensagem[]>(INICIAL);
  protected readonly texto = signal('');

  ngAfterViewChecked(): void {
    if (!this.rolar) return;
    const el = this.lista()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
    this.rolar = false;
  }

  protected enviarEnter(evento: Event): void {
    if ((evento as KeyboardEvent).shiftKey) return;
    evento.preventDefault();
    this.enviar();
  }

  protected enviar(): void {
    const conteudo = this.texto().trim();
    if (!conteudo) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const n = this.mensagens().length;
    this.mensagens.update((atual) => [
      ...atual,
      { id: `u-${n}`, autor: 'voce', texto: conteudo, hora },
      { id: `s-${n}`, autor: 'suporte', texto: 'Registramos sua mensagem. Um analista responderá em instantes.', hora },
    ]);
    this.texto.set('');
    this.rolar = true;
  }
}
