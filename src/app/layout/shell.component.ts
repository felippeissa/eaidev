import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { PanelMenu } from 'primeng/panelmenu';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Popover } from 'primeng/popover';
import { Divider } from 'primeng/divider';

import { AuthService } from '../core/auth.service';
import { TemaService } from '../core/tema.service';
import { notificacoes } from '@/mocks/data';
import { montarMenu } from './menu';

/**
 * Casca do sistema, no desenho do Figma (TEMP/01 - 1920x1080): header de 56 px,
 * menu lateral flutuante, e a área de conteúdo com o rodapé.
 */
@Component({
  selector: 'app-shell',
  imports: [NgTemplateOutlet, RouterLink, RouterOutlet, Button, Divider, Drawer, OverlayBadge, PanelMenu, Popover],
  template: `
    <header class="topo">
      <div class="topo-inicio">
        <p-button icon="pi pi-bars" [text]="true" severity="secondary" ariaLabel="Alternar menu" class="botao-menu" (onClick)="alternarMenu()" />
        <p-button icon="pi pi-bars" [text]="true" severity="secondary" ariaLabel="Abrir menu" class="botao-menu-movel" (onClick)="gaveta.set(true)" />
        <a href="." aria-label="Página inicial EAI.dev" (click)="irParaInicio($event)"><img class="logo" src="logo-eai-dev.svg" alt="EAI.dev" /></a>
      </div>
      <div class="topo-fim">
        <p-button label="Novo produto" size="small" routerLink="/projetos/novo" class="novo-produto" />
        <p-overlaybadge severity="danger" [value]="''">
          <p-button icon="pi pi-bell" [text]="true" severity="secondary" ariaLabel="Notificações" (onClick)="notificacoesPopover.toggle($event)" />
        </p-overlaybadge>
        <p-button
          [icon]="tema.escuro() ? 'pi pi-sun' : 'pi pi-moon'"
          [text]="true"
          severity="secondary"
          [ariaLabel]="tema.escuro() ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'"
          (onClick)="tema.alternar()"
        />
        <p-button [label]="usuario().nome" icon="pi pi-user" [text]="true" severity="secondary" (onClick)="usuarioPopover.toggle($event)" />
        <p-button icon="pi pi-sign-out" [text]="true" severity="secondary" ariaLabel="Sair" (onClick)="sair()" />
      </div>
    </header>

    <p-popover #notificacoesPopover>
      <div class="popover">
        <strong>Notificações</strong>
        <p-divider />
        @for (item of notificacoes; track item.id) {
          <div class="notificacao">
            <span>{{ item.titulo }}</span>
            <small>{{ item.quando }}</small>
          </div>
        }
      </div>
    </p-popover>

    <p-popover #usuarioPopover>
      <div class="popover">
        <strong>{{ usuario().nome }}</strong>
        <small>{{ usuario().email }}</small>
        <span>Perfil: {{ usuario().perfil }}</span>
        @if (usuario().times.length > 0) {
          <span>{{ usuario().times.length > 1 ? 'Produtos' : 'Produto' }}: {{ usuario().times.join(', ') }}</span>
        }
      </div>
    </p-popover>

    <p-drawer [(visible)]="gaveta" position="left" header="Menu">
      <ng-container [ngTemplateOutlet]="menu" />
    </p-drawer>

    <ng-template #menu>
      <div class="menu">
        <p-panelmenu class="painel-menu" [model]="itens()" [multiple]="true" />
      </div>
    </ng-template>

    <div class="corpo">
      @if (menuAberto()) {
        <aside class="lateral">
          <ng-container [ngTemplateOutlet]="menu" />
        </aside>
      }
      <div class="area">
        <main class="conteudo"><router-outlet /></main>
        <footer class="rodape">
          <span>Copyright © 2026 - Estado de Goiás - Todos os direitos reservados.</span>
          <span>Versão 1.2.2</span>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--p-surface-50);
      }
      :host-context(.app-dark) {
        background: var(--p-surface-950);
      }
      .topo {
        position: sticky;
        top: 0;
        z-index: 30;
        height: 56px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        background: var(--p-content-background);
        border-bottom: 1px solid var(--p-content-border-color);
      }
      .topo-inicio,
      .topo-fim {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .logo {
        display: block;
        height: 1.5rem;
        width: auto;
      }
      .corpo {
        flex: 1;
        display: flex;
        gap: 16px;
        padding: 16px;
        min-height: 0;
      }
      .lateral {
        position: sticky;
        top: 72px;
        width: 244px;
        flex-shrink: 0;
        align-self: flex-start;
        height: calc(100vh - 56px - 32px);
        box-sizing: border-box;
        overflow-y: auto;
        padding: 8px;
        background: var(--p-content-background);
        border: 1px solid var(--p-content-border-color);
        border-radius: 4px;
      }
      .menu {
        display: flex;
        flex-direction: column;
        gap: 4px;
        /* Menu plano, como no desenho: sem painéis com borda, só o item ativo em destaque. */
        --p-panelmenu-gap: 4px;
        --p-panelmenu-panel-border-width: 0;
        --p-panelmenu-panel-first-border-width: 0;
        --p-panelmenu-panel-last-border-width: 0;
        --p-panelmenu-panel-background: transparent;
        --p-panelmenu-panel-padding: 0;
        --p-panelmenu-item-padding: 1rem 0.65625rem;
        --p-panelmenu-submenu-indent: 0;
        --p-panelmenu-submenu-gap: 0;
      }
      /* Grupo aberto: cabeçalho e subitens formam um bloco só, cinza claro, de cantos arredondados. */
      .menu ::ng-deep .p-panelmenu-panel:has(.p-panelmenu-header-active) {
        background: var(--p-content-hover-background);
        border-radius: 8px;
        overflow: hidden;
      }
      .menu ::ng-deep .p-panelmenu-header-link > .p-iconwrapper,
      .menu ::ng-deep .p-panelmenu-header-link .p-panelmenu-submenu-icon {
        width: 12.25px;
        height: 12.25px;
        color: var(--p-text-muted-color);
      }
      /* Item da tela atual em destaque, como no desenho (fundo cinza claro). */
      .menu ::ng-deep .item-ativo > .p-panelmenu-item-content,
      .menu ::ng-deep .item-ativo > .p-panelmenu-header-content,
      .menu ::ng-deep .item-ativo > .p-panelmenu-header > .p-panelmenu-header-content {
        background: var(--p-content-hover-background);
        font-weight: 600;
      }
      /* A seta do submenu fica à direita do botão, depois do rótulo. */
      .menu ::ng-deep .p-panelmenu-header-link > chevrondownicon,
      .menu ::ng-deep .p-panelmenu-header-link > chevronrighticon,
      .menu ::ng-deep .p-panelmenu-item-link > chevrondownicon,
      .menu ::ng-deep .p-panelmenu-item-link > chevronrighticon {
        order: 3;
        margin-left: auto;
      }
      .area {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .conteudo {
        flex: 1;
      }
      .rodape {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        padding: 2rem 0 0;
        font-size: 0.75rem;
        color: var(--p-text-muted-color);
      }
      .popover {
        min-width: 14rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .popover small {
        color: var(--p-text-muted-color);
      }
      .notificacao {
        display: flex;
        flex-direction: column;
        padding: 0.375rem 0;
      }
      .popover ::ng-deep .p-divider {
        margin: 0.5rem 0;
      }
      .botao-menu-movel {
        display: none;
      }
      @media (max-width: 639px) {
        .novo-produto {
          display: none;
        }
      }
      @media (max-width: 1023px) {
        .lateral,
        .botao-menu {
          display: none;
        }
        .botao-menu-movel {
          display: inline-flex;
        }
        .corpo {
          padding: 12px;
        }
      }
    `,
  ],
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly tema = inject(TemaService);
  protected readonly notificacoes = notificacoes;

  protected readonly menuAberto = signal(true);
  protected readonly gaveta = signal(false);

  protected readonly usuario = computed(() => this.auth.sessao()!.usuario);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0]),
    ),
    { initialValue: this.router.url.split('?')[0] },
  );

  /** Reconstruído a cada navegação, para o item e o grupo da tela atual aparecerem marcados. */
  protected readonly itens = computed<MenuItem[]>(() => montarMenu(this.url()));

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  irParaInicio(evento: Event): void {
    evento.preventDefault();
    void this.router.navigate(['/']);
  }

  sair(): void {
    this.auth.encerrar();
    void this.router.navigate(['/login']);
  }
}
