import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("access_token")?.value;
		if (!token) return NextResponse.json({ message: "Não autenticado." }, { status: 401 });

		const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";
		const res = await fetch(`${backendUrl}/internships/internships/pending`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		console.error("Erro:", error);
		return NextResponse.json({ message: "Erro interno." }, { status: 500 });
	}
}
