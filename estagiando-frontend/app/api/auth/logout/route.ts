import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get("refresh_token")?.value;

		// Invalida o refresh_token no backend se existir
		if (refreshToken) {
			const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";
			await fetch(`${backendUrl}/auth/logout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			});
		}

		const response = NextResponse.json({ message: "Logout realizado com sucesso." });

		// Limpa os cookies
		response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
		response.cookies.set("refresh_token", "", { maxAge: 0, path: "/api/auth" });

		return response;

	} catch (error) {
		console.error("Erro ao fazer logout:", error);
		return NextResponse.json(
			{ message: "Erro interno ao fazer logout." },
			{ status: 500 }
		);
	}
}
