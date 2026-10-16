import { Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

import { carregar } from '../core/carregar';
import { listarProjetos } from '@/lib/projeto-store';

/** Valor que representa "sem filtro". */
export const TODOS_OS_PRODUTOS = 'todos';

/**
 * Filtro de Produto: seleção única, com "Todos os produtos" primeiro e, depois, só os Produtos ativos
 * em ordem alfabética. O valor escolhido vale só para a tela que usa o filtro; nada fica em estado global.
 */
@Component({
  selector: 'app-filtro-produto',
  imports: [FormsModule, Select],
  template: `
    <div class="campo">
      <label [for]="idCampo">Produto</label>
      <p-select [inputId]="idCampo" [options]="opcoes()" optionLabel="rotulo" optionValue="valor" [ngModel]="valor()" (ngModelChange)="valor.set($event ?? 'todos')" [fluid]="true" appendTo="body" />
    </div>
  `,
  styles: [
    `
      .campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    `,
  ],
})
export class FiltroProduto {
  /** id do Produto escolhido, ou `todos`. */
  readonly valor = model<string>(TODOS_OS_PRODUTOS);

  protected readonly idCampo = `filtro-produto-${Math.random().toString(36).slice(2, 7)}`;
  private readonly projetos = carregar(() => listarProjetos());

  protected readonly opcoes = computed(() => [
    { valor: TODOS_OS_PRODUTOS, rotulo: 'Todos os produtos' },
    ...(this.projetos() ?? [])
      .filter((p) => p.ativo === 'Ativo')
      .map((p) => ({ valor: p.id, rotulo: p.nome }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
  ]);
}
