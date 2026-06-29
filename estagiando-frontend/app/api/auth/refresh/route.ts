import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get("refresh_token")?.value;

		if (!refreshToken) {
			return NextResponse.json(
				{ message: "Sessão expirada. Faça login novamente." },
				{ status: 401 }
			);
		}

		const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";

		const backendResponse = await fetch(`${backendUrl}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: data.message || "Sessão expirada. Faça login novamente." },
				{ status: backendResponse.status }
			);
		}

		const isProduction = process.env.NODE_ENV === "production";

		const response = NextResponse.json({ message: "Token renovado com sucesso." });

		response.cookies.set("access_token", data.accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 15, // 15 minutos
		});

		return response;

	} catch (error) {
		console.error("Erro ao renovar token:", error);
		return NextResponse.json(
			{ message: "Erro interno ao renovar sessão." },
			{ status: 500 }
		);
	}
}
