import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const email = String(body.email || "").toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { message: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  if (password !== "123456") {
    return NextResponse.json(
      { message: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  let redirectTo = "/aluno/estagios";

  if (email.includes("orientador")) {
    redirectTo = "/orientador/avaliacoes";
  }

  if (email.includes("coordenador")) {
    redirectTo = "/coordenacao/dashboard";
  }

  return NextResponse.json({
    message: "Login realizado com sucesso.",
    redirectTo,
  });
}