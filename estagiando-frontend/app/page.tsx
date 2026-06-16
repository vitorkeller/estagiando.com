"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  message?: string;
  redirectTo?: string;
  user?: {
    name: string;
    email: string;
    role: "ALUNO" | "ORIENTADOR" | "COORDENADOR" | "ADMIN";
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrarSessao, setLembrarSessao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: senha,
          rememberSession: lembrarSessao,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setErro(data.message || "Erro ao fazer login.");
        return;
      }

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8">
              <div className="mb-3 flex h-14 w-70 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold">
                Estagiando.com
              </div>
            </div>
  
            <div className="max-w-l">
              <h2 className="text-2xl font-bold leading-tight">
                Gerencie estágios, relatórios, avaliações e aprovações em um só
                lugar.
              </h2>
            </div>
          </div>
          <br />
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="font-semibold">Controle de Acesso</h3>
              <p className="mt-1 text-sm text-slate-300">
                Login seguro com perfis de aluno, orientador e coordenação.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="font-semibold">Fluxo de Aprovação</h3>
              <p className="mt-1 text-sm text-slate-300">
                Envio, análise, deferimento e encerramento de estágios.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="font-semibold">Auditoria</h3>
              <p className="mt-1 text-sm text-slate-300">
                Registro de ações com usuário, data, hora e rastreabilidade.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-100 px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-bold text-white">
                E
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Sistema de Gestão de Estágios
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Portal acadêmico institucional
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-8">

                <h2 className="text-2xl font-bold text-slate-900">
                  Entrar no sistema
                </h2>

              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    E-mail institucional
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nome@instituicao.edu.br"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="senha"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Senha
                  </label>

                  <input
                    id="senha"
                    type="password"
                    required
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={lembrarSessao}
                      onChange={(event) =>
                        setLembrarSessao(event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    Manter sessão ativa
                  </label>

                  <a
                    href="#"
                    className="text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    Esqueci minha senha
                  </a>
                </div>

                {erro && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {carregando ? "Autenticando..." : "Acessar plataforma"}
                </button>
              </form>

            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Todas as ações relevantes são registradas para auditoria e
              rastreabilidade.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}