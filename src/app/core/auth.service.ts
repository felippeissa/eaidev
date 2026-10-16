import { Injectable, signal } from '@angular/core';

import { USUARIOS } from './mock-usuarios';
import { Sessao } from './models';

const STORAGE_KEY = 'eai.session';
const VERSAO_SESSAO = 2;

export interface Credenciais {
  login: string;
  senha: string;
  manterConectado: boolean;
}

/**
 * Autenticação de demonstração, com a mesma regra do app em React:
 * qualquer usuário e uma senha de 4 ou mais caracteres. A sessão usa a mesma
 * chave e o mesmo formato, então quem entra num lado já está dentro no outro
 * quando os dois rodam na mesma origem.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly sessao = signal<Sessao | null>(this.ler());

  private ler(): Sessao | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const sessao = JSON.parse(raw) as Sessao;
      if (sessao.versao !== VERSAO_SESSAO) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return sessao;
    } catch {
      return null;
    }
  }

  async autenticar(entrada: Credenciais): Promise<Sessao> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const alvo = entrada.login.trim().toLowerCase();
    const usuario = USUARIOS.find((u) => u.login === alvo || u.email.toLowerCase() === alvo) ?? USUARIOS[0];

    if (entrada.senha.trim().length < 4) throw new Error('Usuário ou senha inválidos.');

    const sessao: Sessao = {
      usuario: { ...usuario, login: alvo || usuario.login },
      criadoEm: Date.now(),
      manterConectado: entrada.manterConectado,
      versao: VERSAO_SESSAO,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
    this.sessao.set(sessao);
    return sessao;
  }

  encerrar(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessao.set(null);
  }
}
