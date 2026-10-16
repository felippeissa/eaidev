import { Signal, signal } from '@angular/core';

/**
 * Carrega um dado assíncrono e o expõe como signal: `null` enquanto carrega,
 * o valor depois. É o que o `useSuspenseQuery` faz no app em React.
 */
export function carregar<T>(origem: () => Promise<T>): Signal<T | null> {
  const dado = signal<T | null>(null);
  void origem().then((valor) => dado.set(valor));
  return dado.asReadonly();
}

/** Versão recarregável, para telas que mudam o dado e precisam relê-lo. */
export function carregarRecarregavel<T>(origem: () => Promise<T>): { dado: Signal<T | null>; recarregar: () => Promise<void> } {
  const dado = signal<T | null>(null);
  const recarregar = async () => dado.set(await origem());
  void recarregar();
  return { dado: dado.asReadonly(), recarregar };
}

export function atraso<T>(valor: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}
