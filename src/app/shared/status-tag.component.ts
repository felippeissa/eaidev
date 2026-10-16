import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';

type Severidade = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

/** Cada situação do sistema vira a severidade do `p-tag` que a representa. */
const SEVERIDADES: Record<string, Severidade> = {
  Sucesso: 'success',
  Ativo: 'success',
  Publicada: 'success',
  Aprovada: 'success',
  Concluído: 'success',
  Saudável: 'success',
  Falha: 'danger',
  Inativo: 'danger',
  Indisponível: 'danger',
  Crítico: 'danger',
  Atrasado: 'danger',
  Executando: 'info',
  'Em andamento': 'info',
  'Em revisão': 'info',
  'Em elaboração': 'info',
  Planejado: 'info',
  Pausado: 'warn',
  Pendente: 'warn',
  'Aguardando aprovação': 'warn',
  Alto: 'warn',
  Médio: 'secondary',
  Baixo: 'secondary',
  Aberto: 'danger',
  Deprecado: 'warn',
  Rascunho: 'secondary',
  Produção: 'success',
  Homologação: 'info',
  Desenvolvimento: 'secondary',
  Agendada: 'secondary',
  Ignorada: 'secondary',
  Cancelada: 'danger',
  'Aguardando ação manual': 'warn',
  Disponível: 'success',
  Degradado: 'warn',
};

@Component({
  selector: 'app-status-tag',
  imports: [Tag],
  template: `<p-tag [value]="rotulo()" [severity]="severidade()" [rounded]="true" />`,
})
export class StatusTag {
  readonly status = input.required<string>();
  readonly label = input<string>();
  protected readonly rotulo = computed(() => this.label() ?? this.status());
  protected readonly severidade = computed<Severidade>(() => SEVERIDADES[this.status()] ?? 'secondary');
}
