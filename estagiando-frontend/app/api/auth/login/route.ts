import { NextResponse } from "next/server";

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
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: data.message || "E-mail ou senha inválidos." },
				{ status: backendResponse.status }
			);
		}

		let redirectTo = "/aluno/estagios";

		if (data.user?.role === "COORDINATOR") {
			redirectTo = "/coordenacao/dashboard";
		} else if (data.user?.role === "ADVISOR") {
			redirectTo = "/orientador/avaliacoes";
		}

		const response = NextResponse.json({
			message: "Login realizado com sucesso.",
			redirectTo,
			user: data.user
		});

		if (data.refreshToken) {
			response.cookies.set("refresh_token", data.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				path: "/auth",
				maxAge: 60 * 60 * 24
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
