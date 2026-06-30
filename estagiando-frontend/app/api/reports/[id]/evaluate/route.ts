import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("access_token")?.value;

		if (!token) {
			return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3333";

		const res = await fetch(`${backendUrl}/reports/${id}/evaluate`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });

	} catch (error) {
		console.error("Erro ao avaliar relatório:", error);
		return NextResponse.json({ message: "Erro interno." }, { status: 500 });
	}
}
