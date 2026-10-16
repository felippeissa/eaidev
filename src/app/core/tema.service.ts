import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const CHAVE = 'eai.tema';

/** Claro por padrão; o escuro entra pela classe `.app-dark` no <html> (ver `darkModeSelector`). */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly documento = inject(DOCUMENT);
  readonly escuro = signal(false);

  constructor() {
    const salvo = localStorage.getItem(CHAVE);
    this.aplicar(salvo === 'escuro');
  }

  alternar(): void {
    this.aplicar(!this.escuro());
  }

  private aplicar(escuro: boolean): void {
    this.escuro.set(escuro);
    this.documento.documentElement.classList.toggle('app-dark', escuro);
    localStorage.setItem(CHAVE, escuro ? 'escuro' : 'claro');
  }
}
