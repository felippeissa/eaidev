import type { Usuario } from "@/types";
import { usuarios } from "@/mocks/data";

const STORAGE_KEY = "eai.session";

/**
 * Sobe quando o formato do usuário guardado muda.
 *
 * A sessão carrega uma cópia do `Usuario`, então uma alteração no tipo — como
 * `time` virando `times` — deixa no navegador um objeto que não existe mais.
 * Sem esta checagem, quem já estava logado abria a aplicação e via a tela de
 * erro, sem entender por quê e sem ter como sair do estado.
 */
const VERSAO_SESSAO = 2;

export type Sessao = {
  usuario: Usuario;
  criadoEm: number;
  manterConectado: boolean;
  versao?: number;
};

export function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sessao = JSON.parse(raw) as Sessao;
    // Formato antigo: descarta em silêncio e manda para o login, em vez de
    // deixar a aplicação tentar ler um campo que não existe mais.
    if (sessao.versao !== VERSAO_SESSAO) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function autenticar(input: {
  login: string;
  senha: string;
  manterConectado: boolean;
}): Promise<Sessao> {
  await new Promise((r) => setTimeout(r, 700));
  const alvo = input.login.trim().toLowerCase();
  const usuario =
    usuarios.find((u) => u.login === alvo || u.email.toLowerCase() === alvo) ?? usuarios[0]!;

  if (input.senha.trim().length < 4) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const sessao: Sessao = {
    usuario: { ...usuario, login: alvo || usuario.login },
    criadoEm: Date.now(),
    manterConectado: input.manterConectado,
    versao: VERSAO_SESSAO,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
  }
  return sessao;
}
