export type PerfilUsuario = 'Administrador' | 'Gestor' | 'Desenvolvedor' | 'Leitor';
export type StatusUsuario = 'Ativo' | 'Pendente' | 'Inativo';

export interface Usuario {
  id: string;
  login: string;
  nome: string;
  email: string;
  times: string[];
  perfil: PerfilUsuario;
  status: StatusUsuario;
}

export interface Sessao {
  usuario: Usuario;
  criadoEm: number;
  manterConectado: boolean;
  versao?: number;
}
