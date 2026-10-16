import { usuarios as usuariosSeed } from "@/mocks/data";
import type { Usuario } from "@/types";

const STORAGE_CRIADOS = "eai-dev-usuarios";
const STORAGE_ALTERADOS = "eai-dev-usuarios-alterados";
const STORAGE_EXCLUIDOS = "eai-dev-usuarios-excluidos";

function delay<T>(valor: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

function ler<T>(chave: string, vazio: T): T {
  if (typeof window === "undefined") return vazio;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : vazio;
  } catch {
    return vazio;
  }
}

function gravar(chave: string, valor: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(chave, JSON.stringify(valor));
}

const lerCriados = () => ler<Usuario[]>(STORAGE_CRIADOS, []);
const lerAlterados = () => ler<Record<string, Partial<Usuario>>>(STORAGE_ALTERADOS, {});
const lerExcluidos = () => ler<string[]>(STORAGE_EXCLUIDOS, []);

/**
 * Os convidados vêm primeiro, para quem acabou de convidar ver o resultado.
 *
 * Os usuários de exemplo são um array importado, que não dá para alterar em
 * memória: editar ou excluir um deles grava a mudança à parte e a aplica na
 * leitura. É o que permite mexer neles sem tocar no arquivo de mocks.
 */
/**
 * Normaliza um registro vindo do navegador.
 *
 * O que está gravado pode ter sido escrito por uma versão anterior do tipo —
 * `time` como texto único, antes de virar a lista `times`. Sem isto, a tela
 * tenta ler uma lista que não existe e derruba a aplicação inteira, e a pessoa
 * fica presa: recarregar não resolve, porque o dado ruim está no navegador.
 */
function normalizar(usuario: Usuario & { time?: string }): Usuario {
  const { time, ...resto } = usuario;
  return {
    ...resto,
    times: Array.isArray(usuario.times) ? usuario.times : time ? [time] : [],
  };
}

export function listarUsuarios(): Promise<Usuario[]> {
  const alterados = lerAlterados();
  const excluidos = new Set(lerExcluidos());
  const lista = [...lerCriados().map(normalizar), ...usuariosSeed]
    .filter((usuario) => !excluidos.has(usuario.id))
    .map((usuario) => normalizar({ ...usuario, ...alterados[usuario.id] }));
  return delay(lista);
}

export function convidarUsuario(entrada: {
  nome: string;
  email: string;
  perfil: Usuario["perfil"];
  times?: string[];
}): Promise<Usuario> {
  const usuario: Usuario = {
    id: `usr-${Date.now()}`,
    // O login sai da parte do e-mail antes do @, que é como os existentes
    // são formados.
    login: entrada.email.split("@")[0] ?? entrada.email,
    nome: entrada.nome,
    email: entrada.email,
    times: entrada.times ?? [],
    perfil: entrada.perfil,
    // Quem é convidado já entra como ativo: só existem Ativo e Inativo.
    status: "Ativo",
  };
  gravar(STORAGE_CRIADOS, [usuario, ...lerCriados()]);
  return delay(usuario);
}

export function atualizarUsuario(id: string, mudancas: Partial<Usuario>): Promise<void> {
  const criados = lerCriados();
  const indice = criados.findIndex((usuario) => usuario.id === id);
  if (indice >= 0) {
    criados[indice] = { ...criados[indice]!, ...mudancas };
    gravar(STORAGE_CRIADOS, criados);
  } else {
    const alterados = lerAlterados();
    gravar(STORAGE_ALTERADOS, { ...alterados, [id]: { ...alterados[id], ...mudancas } });
  }
  return delay(undefined);
}

export function excluirUsuario(id: string): Promise<void> {
  const criados = lerCriados();
  if (criados.some((usuario) => usuario.id === id)) {
    gravar(
      STORAGE_CRIADOS,
      criados.filter((usuario) => usuario.id !== id),
    );
  } else {
    gravar(STORAGE_EXCLUIDOS, [...new Set([...lerExcluidos(), id])]);
  }
  return delay(undefined);
}
