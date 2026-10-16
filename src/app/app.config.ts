import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    // Claro por padrão: o escuro só entra se a classe `.app-dark` for posta no <html>.
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
    MessageService,
  ],
};
