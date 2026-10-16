import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Sem sessão, qualquer tela interna volta para o login. */
export const autenticadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.sessao() ? true : inject(Router).createUrlTree(['/login']);
};

/** Quem já tem sessão não precisa ver o login de novo. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.sessao() ? inject(Router).createUrlTree(['/']) : true;
};
