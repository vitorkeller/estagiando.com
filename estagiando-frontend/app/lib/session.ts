import "server-only";
import { cookies } from "next/headers";

export type Role = "STUDENT" | "ADVISOR" | "COORDINATOR";

export type SessionPayload = {
  id: number;
  role: Role;
  iat: number;
  exp: number;
};

/**
 * Decodifica o payload do JWT sem verificar a assinatura.
 * A verificação real acontece no backend a cada requisição autenticada.
 * Aqui usamos só para decisões de roteamento (optimistic check).
 */
function decodeJwtPayload(token: string): SessionPayload | null {
  try {
    const [, payloadB64] = token.split(".");
    // JWT usa base64url — converte para base64 padrão
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Lê o access_token do cookie e retorna o payload decodificado.
 * Retorna null se o cookie não existir ou o token estiver expirado.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Verifica expiração (exp está em segundos)
  const agora = Math.floor(Date.now() / 1000);
  if (payload.exp < agora) return null;

  return payload;
}

/** Mapeamento de role para rota home do perfil */
export const ROLE_HOME: Record<Role, string> = {
  STUDENT: "/aluno/estagios",
  ADVISOR: "/orientador/avaliacoes",
  COORDINATOR: "/coordenacao/dashboard",
};
