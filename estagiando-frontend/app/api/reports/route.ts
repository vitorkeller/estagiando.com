import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("access_token")?.value;

		if (!token) {
			return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
		}

		const body = await request.json();
		const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";

		const res = await fetch(`${backendUrl}/reports`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });

	} catch (error) {
		console.error("Erro ao criar relatório:", error);
		return NextResponse.json({ message: "Erro interno." }, { status: 500 });
	}
}
