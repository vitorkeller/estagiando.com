"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/app/components/LogoutButton";

type Relatorio = {
  id: number;
  description: string;
  attachmentUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  Internship: {
    id: number;
    companyName: string;
    User: {
      id: number;
      name: string;
      email: string;
    };
  };
};

type ModalAvaliacao = {
  aberto: boolean;
  relatorio: Relatorio | null;
  comentario: string;
  aprovando: boolean | null;
  enviando: boolean;
  erro: string;
  sucesso: boolean;
};

export default function OrientadorDashboard() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modal, setModal] = useState<ModalAvaliacao>({
    aberto: false,
    relatorio: null,
    comentario: "",
    aprovando: null,
    enviando: false,
    erro: "",
    sucesso: false,
  });

  async function carregarRelatorios() {
    setCarregando(true);
    try {
      const res = await fetch("/api/reports/pending");
      if (res.ok) {
        const data = await res.json();
        setRelatorios(data);
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  function abrirModal(relatorio: Relatorio, aprovando: boolean) {
    setModal({ aberto: true, relatorio, comentario: "", aprovando, enviando: false, erro: "", sucesso: false });
  }

  function fecharModal() {
    setModal((m) => ({ ...m, aberto: false }));
  }

  async function avaliar() {
    if (!modal.relatorio) return;

    setModal((m) => ({ ...m, enviando: true, erro: "" }));

    const res = await fetch(`/api/reports/${modal.relatorio.id}/evaluate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approve: modal.aprovando,
        comment: modal.comentario || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setModal((m) => ({ ...m, enviando: false, erro: data.message || "Erro ao avaliar." }));
      return;
    }

    setModal((m) => ({ ...m, enviando: false, sucesso: true }));
    await carregarRelatorios();
    setTimeout(fecharModal, 1500);
  }

  const pendentes = relatorios.length;

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Corpo Docente / Orientação
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios para Avaliar</h1>
            <p className="text-sm text-slate-500 mt-1">Validação de relatórios e emissão de pareceres.</p>
          </div>
          <LogoutButton />
        </header>

        {/* Métrica */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Relatórios Aguardando Parecer</h3>
            <p className="mt-2 text-3xl font-bold text-amber-600">{pendentes}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-end">
            <button
              onClick={carregarRelatorios}
              className="text-xs text-blue-700 hover:underline"
            >
              Atualizar lista
            </button>
          </div>
        </section>

        {/* Lista de Relatórios Pendentes */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Relatórios Pendentes</h2>

          {carregando ? (
            <p className="text-sm text-slate-400 text-center py-8">Carregando...</p>
          ) : relatorios.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum relatório pendente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50">
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Empresa</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Data de Envio</th>
                    <th className="p-4">Anexo</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {relatorios.map((rel) => (
                    <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{rel.Internship.User.name}</div>
                        <div className="text-xs text-slate-400">{rel.Internship.User.email}</div>
                      </td>
                      <td className="p-4 text-slate-600">{rel.Internship.companyName}</td>
                      <td className="p-4 max-w-xs truncate text-slate-700">{rel.description}</td>
                      <td className="p-4 text-slate-500">{new Date(rel.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="p-4">
                        {rel.attachmentUrl ? (
                          <a href={rel.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                            Ver anexo
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Sem anexo</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirModal(rel, true)}
                            className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => abrirModal(rel, false)}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200 transition"
                          >
                            Indeferir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Avaliação */}
      {modal.aberto && modal.relatorio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {modal.aprovando ? "Aprovar Relatório" : "Indeferir Relatório"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Aluno: <span className="font-medium text-slate-700">{modal.relatorio.Internship.User.name}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Parecer / Comentário (opcional)
              </label>
              <textarea
                rows={4}
                value={modal.comentario}
                onChange={(e) => setModal((m) => ({ ...m, comentario: e.target.value }))}
                placeholder="Adicione um comentário para o aluno..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {modal.erro && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{modal.erro}</p>
            )}
            {modal.sucesso && (
              <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2">
                Avaliação registrada com sucesso!
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={fecharModal}
                disabled={modal.enviando}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={avaliar}
                disabled={modal.enviando}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition shadow-md disabled:opacity-50 ${
                  modal.aprovando ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {modal.enviando ? "Enviando..." : modal.aprovando ? "Confirmar Aprovação" : "Confirmar Indeferimento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
