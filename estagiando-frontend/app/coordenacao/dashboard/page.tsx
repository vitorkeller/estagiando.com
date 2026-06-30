"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/app/components/LogoutButton";

type Internship = {
  id: number;
  companyName: string;
  companyCnpj: string;
  status: string;
  createdAt: string;
  User: { id: number; name: string; email: string };
};

type AuditLog = {
  id: number;
  entity: string;
  entityId: number;
  action: string;
  performedBy: number;
  performedByRole: string;
  createdAt: string;
};

export default function CoordenacaoDashboard() {
  const [pendentes, setPendentes] = useState<Internship[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const [resPendentes, resLogs] = await Promise.all([
        fetch("/api/internships/pending"),
        fetch("/api/audit-logs"),
      ]);
      if (resPendentes.ok) setPendentes(await resPendentes.json());
      if (resLogs.ok) setLogs(await resLogs.json());
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function decidir(id: number, acao: "approve" | "reject") {
    setProcessando(id);
    try {
      const res = await fetch(`/api/internships/${id}/${acao}`, { method: "PATCH" });
      if (res.ok) await carregar();
    } finally {
      setProcessando(null);
    }
  }

  function actionLabel(action: string) {
    const map: Record<string, string> = {
      CREATE: "Criou", APPROVE: "Aprovou", REJECT: "Indeferiu",
      FINALIZE: "Finalizou", DENY: "Negou",
    };
    return map[action] ?? action;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Gestão Institucional Macro
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Painel de Controle da Coordenação</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={carregar}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              Atualizar
            </button>
            <LogoutButton />
          </div>
        </header>

        {/* Métricas */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Convênios para Homologação</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{pendentes.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Registros de Auditoria</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{logs.length}</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Convênios Pendentes */}
          <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 lg:col-span-2">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Estágios Aguardando Homologação</h2>
            <p className="text-xs text-slate-500 mb-6">Valide os critérios antes de emitir a homologação formal.</p>

            {carregando ? (
              <p className="text-sm text-slate-400 text-center py-8">Carregando...</p>
            ) : pendentes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum estágio aguardando homologação.</p>
            ) : (
              <div className="space-y-4">
                {pendentes.map((int) => (
                  <div key={int.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{int.companyName}</h4>
                      <p className="text-xs text-slate-400">
                        CNPJ: {int.companyCnpj} | Aluno: {int.User.name} | Solicitado em: {new Date(int.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decidir(int.id, "approve")}
                        disabled={processando === int.id}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {processando === int.id ? "..." : "Homologar"}
                      </button>
                      <button
                        onClick={() => decidir(int.id, "reject")}
                        disabled={processando === int.id}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                      >
                        Indeferir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Logs de Auditoria */}
          <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Auditoria do Sistema</h2>
            <p className="text-xs text-slate-500 mb-6">Logs imutáveis em tempo real.</p>

            {carregando ? (
              <p className="text-sm text-slate-400 text-center py-4">Carregando...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum registro ainda.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.slice(0, 20).map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-600 bg-slate-50 p-3 rounded-r-xl">
                    <div className="text-xs font-bold text-slate-800">
                      {actionLabel(log.action)} — {log.entity} #{log.entityId}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Role: {log.performedByRole} | Usuário ID: {log.performedBy}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
