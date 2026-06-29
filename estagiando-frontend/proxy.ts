import { NextRequest, NextResponse } from "next/server";
import { getSession, ROLE_HOME, type Role } from "@/app/lib/session";

/**
 * Rotas públicas — acessíveis sem sessão.
 * Tudo que não estiver aqui é protegido por padrão.
 */
const PUBLIC_ROUTES = ["/"];

/**
 * Prefixos de rota que exigem um role específico.
 * Se o usuário estiver autenticado mas com role errado, é redirecionado
 * para a home do seu próprio perfil.
 */
const ROLE_ROUTES: Record<string, Role> = {
  "/aluno": "STUDENT",
  "/orientador": "ADVISOR",
  "/coordenacao": "COORDINATOR",
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const session = await getSession();

  // --- Usuário NÃO autenticado ---
  if (!session) {
    // Tenta acessar rota protegida → manda para o login
    if (!isPublic) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // --- Usuário autenticado ---

  // Está na página de login → redireciona para a home do seu perfil
  if (isPublic) {
    return NextResponse.redirect(
      new URL(ROLE_HOME[session.role], req.nextUrl)
    );
  }

  // Verifica se a rota exige um role específico
  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (session.role !== requiredRole) {
        // Role errado → redireciona para a home correta do usuário
        return NextResponse.redirect(
          new URL(ROLE_HOME[session.role], req.nextUrl)
        );
      }
      break;
    }
  }

  return NextResponse.next();
}

// O proxy roda em todas as rotas exceto arquivos estáticos e internos do Next
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
