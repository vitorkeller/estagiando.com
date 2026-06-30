"use client";

import { useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";

type Relatorio = {
  id: string;
  description: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  evaluatorComment?: string;
};

type ModalState = {
  aberto: boolean;
  descricao: string;
  anexoUrl: string;
  enviando: boolean;
  erro: string;
  sucesso: boolean;
};

// ID do estágio criado no banco — em produção viria da API
const INTERNSHIP_ID = 2;

export default function AlunoDashboard() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [modal, setModal] = useState<ModalState>({
    aberto: false,
    descricao: "",
    anexoUrl: "",
    enviando: false,
    erro: "",
    sucesso: false,
  });

  function abrirModal() {
    setModal({ aberto: true, descricao: "", anexoUrl: "", enviando: false, erro: "", sucesso: false });
  }

  function fecharModal() {
    setModal((m) => ({ ...m, aberto: false }));
  }

  async function carregarRelatorios() {
    setCarregando(true);
    try {
      const res = await fetch(`/api/internships/${INTERNSHIP_ID}/reports`);
      if (res.ok) {
        const data = await res.json();
        setRelatorios(data);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function submeterRelatorio() {
    if (!modal.descricao.trim()) {
      setModal((m) => ({ ...m, erro: "A descrição é obrigatória." }));
      return;
    }

    setModal((m) => ({ ...m, enviando: true, erro: "" }));

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internshipId: INTERNSHIP_ID,
        description: modal.descricao,
        attachmentUrl: modal.anexoUrl || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setModal((m) => ({ ...m, enviando: false, erro: data.message || "Erro ao enviar relatório." }));
      return;
    }

    setModal((m) => ({ ...m, enviando: false, sucesso: true }));
    await carregarRelatorios();
    setTimeout(fecharModal, 1500);
  }

  function statusLabel(status: Relatorio["status"]) {
    if (status === "APPROVED") return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">Aprovado</span>
    );
    if (status === "REJECTED") return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">Indeferido</span>
    );
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">Em Análise</span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Portal do Aluno
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Meu Painel de Estágio</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={abrirModal}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 shadow-md"
            >
              Nova Submissão de Relatório
            </button>
            <LogoutButton />
          </div>
        </header>

        {/* Resumo do Estágio */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">By Seven</h2>
              <p className="text-sm text-slate-500">Estagiário de Desenvolvimento de Software</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
              ATIVO
            </span>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Período de Vigência</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">10/01/2026 - 10/07/2026</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Carga Horária</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">30h / semana</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">ID do Estágio</p>
              <p className="mt-1 text-sm font-mono text-slate-700">{INTERNSHIP_ID}</p>
            </div>
          </div>
        </section>

        {/* Histórico de Relatórios */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Histórico de Relatórios</h2>
            <button
              onClick={carregarRelatorios}
              disabled={carregando}
              className="text-xs text-blue-700 hover:underline disabled:opacity-50"
            >
              {carregando ? "Carregando..." : "Atualizar"}
            </button>
          </div>

          {relatorios.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Nenhum relatório enviado ainda. Clique em &quot;Nova Submissão&quot; para começar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50">
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Data de Envio</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Parecer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {relatorios.map((rel) => (
                    <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 max-w-xs truncate">{rel.description}</td>
                      <td className="p-4 text-slate-500">{new Date(rel.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="p-4">{statusLabel(rel.status)}</td>
                      <td className="p-4 max-w-xs text-xs text-slate-500 italic">
                        {rel.evaluatorComment || "Aguardando avaliação."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Submissão */}
      {modal.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nova Submissão de Relatório</h2>
            <p className="text-sm text-slate-500 mb-6">Preencha os dados e anexe o link do documento.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={modal.descricao}
                  onChange={(e) => setModal((m) => ({ ...m, descricao: e.target.value }))}
                  placeholder="Descreva as atividades realizadas no período..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link do Anexo (PDF ou Google Drive / OneDrive / Dropbox)
                </label>
                <input
                  type="url"
                  value={modal.anexoUrl}
                  onChange={(e) => setModal((m) => ({ ...m, anexoUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {modal.erro && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{modal.erro}</p>
              )}

              {modal.sucesso && (
                <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2">
                  Relatório enviado com sucesso!
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={fecharModal}
                disabled={modal.enviando}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={submeterRelatorio}
                disabled={modal.enviando}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition shadow-md disabled:opacity-50"
              >
                {modal.enviando ? "Enviando..." : "Enviar Relatório"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
