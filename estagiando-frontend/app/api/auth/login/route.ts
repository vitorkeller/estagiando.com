import { NextResponse } from "next/server";
import { ROLE_HOME, type Role } from "@/app/lib/session";

/** Decodifica o payload do JWT sem verificar assinatura (só para roteamento) */
function decodeJwtPayload(token: string): { role: Role } | null {
	try {
		const [, payloadB64] = token.split(".");
		const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
		return JSON.parse(atob(base64));
	} catch {
		return null;
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const email = String(body.email || "").toLowerCase();
		const password = String(body.password || "");

		if (!email || !password) {
			return NextResponse.json(
				{ message: "E-mail e senha são obrigatórios." },
				{ status: 400 }
			);
		}

		const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";

		const backendResponse = await fetch(`${backendUrl}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: data.message || "E-mail ou senha inválidos." },
				{ status: backendResponse.status }
			);
		}

		// O backend retorna { accessToken, refreshToken }
		// A role está codificada dentro do accessToken: { id, role }
		const payload = decodeJwtPayload(data.accessToken);
		const role: Role = payload?.role ?? "STUDENT";
		const redirectTo = ROLE_HOME[role];

		const isProduction = process.env.NODE_ENV === "production";

		const response = NextResponse.json({
			message: "Login realizado com sucesso.",
			redirectTo,
		});

		// access_token: vida curta (15 min conforme backend), lido pelo proxy
		response.cookies.set("access_token", data.accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 15, // 15 minutos — espelha JWT_EXPIRES_IN do backend
		});

		// refresh_token: vida longa (7 dias), usado só na rota de renovação
		if (data.refreshToken) {
			response.cookies.set("refresh_token", data.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				path: "/api/auth",  // restrito: só acessível pela rota de refresh
				maxAge: 60 * 60 * 24 * 7, // 7 dias — espelha REFRESH_EXPIRES_IN
			});
		}

		return response;

	} catch (error) {
		console.error("Erro no proxy de login:", error);
		return NextResponse.json(
			{ message: "Erro interno ao tentar conectar com o servidor." },
			{ status: 500 }
		);
	}
}
