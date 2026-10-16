import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import { AuthService } from '../../core/auth.service';
import { LogoExpresso } from './logo-expresso.component';

/**
 * Tela de login conforme o design "Informatiza 3.0" (TEMP/01 - 1920x1080).
 * Os componentes são todos do PrimeNG com o tema Aura de fábrica; o CSS daqui
 * só posiciona e dimensiona o que o design define fora dos componentes
 * (cartão, logo e textos de rodapé).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputText, Password, Checkbox, Button, Message, LogoExpresso],
  template: `
    <div class="tela">
      <main class="centro">
        <section class="cartao">
          <app-logo-expresso />

          <form class="formulario" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
            <div class="campo">
              <label for="login">Usuário</label>
              <input
                pInputText
                id="login"
                formControlName="login"
                placeholder="Digite"
                autocomplete="username"
                [fluid]="true"
              />
              @if (invalido('login')) {
                <p-message severity="error" variant="simple" size="small">Informe o usuário.</p-message>
              }
            </div>

            <div class="campo">
              <label for="senha">Senha</label>
              <p-password
                inputId="senha"
                formControlName="senha"
                placeholder="Digite"
                autocomplete="current-password"
                [feedback]="false"
                [toggleMask]="true"
                [fluid]="true"
              />
              @if (invalido('senha')) {
                <p-message severity="error" variant="simple" size="small">Informe a senha.</p-message>
              }
            </div>

            <div class="linha">
              <span class="opcao">
                <p-checkbox inputId="lembrar" formControlName="manterConectado" [binary]="true" />
                <label for="lembrar">Mantenha-me conectado</label>
              </span>
              <p-button
                type="button"
                label="Recuperar senha"
                [text]="true"
                size="small"
                [style]="{ 'white-space': 'nowrap' }"
                (onClick)="recuperarSenha()"
              />
            </div>

            <p-button
              type="submit"
              [label]="carregando() ? 'Entrando...' : 'Entrar'"
              [loading]="carregando()"
              size="large"
              [fluid]="true"
            />
          </form>

          <p class="ou">Ou</p>

          <p-button
            type="button"
            [outlined]="true"
            [rounded]="true"
            [fluid]="true"
            [style]="botaoSocial"
            (onClick)="emBreve('Entrar com ID Goiás')"
          >
            <img class="icone-id-goias" src="login/id-goias.svg" alt="" />
            <span>Entrar com ID Goiás</span>
          </p-button>

          <p-button
            type="button"
            [outlined]="true"
            [rounded]="true"
            [fluid]="true"
            [style]="botaoSocial"
            (onClick)="emBreve('Entrar com gov.br')"
          >
            <img class="icone-govbr" src="login/govbr.svg" alt="" />
            <span>Entrar com gov.br</span>
          </p-button>

          <p class="rodape">
            Utilizamos cookies do navegador para rastrear sua sessão e oferecer uma experiência melhor. Você pode
            consultar a nossa <strong>Política de Cookie</strong> para mais detalhes.
          </p>
          <p class="rodape">
            Ao fazer o login, você concorda com nossa <strong>Política de Privacidade</strong>
          </p>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .tela {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--p-emerald-50);
      }
      .centro {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
      }
      .cartao {
        width: 400px;
        max-width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 17px;
        padding: 24px;
        background: var(--p-content-background);
        border: 1px solid var(--p-content-border-color);
        border-radius: 8px;
      }
      .formulario {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 17px;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .campo label {
        line-height: 21px;
      }
      .linha {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .opcao {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        white-space: nowrap;
      }
      .ou {
        margin: 0;
        font-size: 12px;
        line-height: 21px;
        text-align: center;
      }
      .cartao > p-button {
        width: 100%;
      }
      .icone-id-goias {
        width: 31.667px;
        height: 30.815px;
      }
      .icone-govbr {
        width: 34.341px;
        height: 12.365px;
      }
      .rodape {
        margin: 0;
        font-size: 12px;
        text-align: center;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly mensagens = inject(MessageService);

  readonly carregando = signal(false);

  /**
   * Botões de login social: borda do tema (primary-200), texto na cor padrão em
   * vez da cor primária, e a mesma altura nos dois (a do botão com o ícone maior).
   */
  protected readonly botaoSocial = {
    '--p-button-outlined-primary-color': 'var(--p-text-color)',
    height: '3.05rem',
  };

  readonly form = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
    manterConectado: [false],
  });

  invalido(campo: 'login' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  async entrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((controle) => controle.markAsDirty());
      return;
    }
    this.carregando.set(true);
    try {
      const { login, senha, manterConectado } = this.form.getRawValue();
      const sessao = await this.auth.autenticar({ login, senha, manterConectado });
      this.mensagens.add({
        severity: 'success',
        summary: 'Acesso liberado',
        detail: `Bem-vindo, ${sessao.usuario.nome.split(' ')[0]}.`,
      });
      await this.router.navigate(['/']);
    } catch (erro) {
      this.mensagens.add({
        severity: 'error',
        summary: 'Não foi possível entrar',
        detail: erro instanceof Error ? erro.message : 'Tente novamente.',
      });
    } finally {
      this.carregando.set(false);
    }
  }

  recuperarSenha(): void {
    this.mensagens.add({
      severity: 'info',
      summary: 'Recuperação de senha',
      detail: 'Enviamos as instruções para o seu e-mail corporativo.',
    });
  }

  emBreve(nome: string): void {
    this.mensagens.add({
      severity: 'info',
      summary: 'Em breve',
      detail: `${nome} ainda está em construção.`,
    });
  }
}
