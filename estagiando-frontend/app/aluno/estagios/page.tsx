"use client";

import { useState } from "react";

type Estagio = {
  id: string;
  empresa: string;
  cargo: string;
  periodo: string;
  cargaHoraria: string;
  status: "ATIVO" | "CONCLUIDO" | "PENDENTE";
};

type Relatorio = {
  id: string;
  titulo: string;
  dataEntrega: string;
  status: "DEFERIDO" | "INDEFERIDO" | "EM_ANALISE";
  parecer?: string;
};

export default function AlunoDashboard() {
  // Dados simulados vindos da API
  const [estagio] = useState<Estagio>({
    id: "EST-2026-01",
    empresa: "Tech Solutions Inovações Ltda",
    cargo: "Estagiário de Desenvolvimento Software",
    periodo: "10/01/2026 - 10/07/2026",
    cargaHoraria: "30h / semana",
    status: "ATIVO",
  });

  const [relatorios, setRelatorios] = useState<Relatorio[]>([
    {
      id: "REL-01",
      titulo: "Relatório Parcial - Primeiro Bimestre",
      dataEntrega: "15/03/2026",
      status: "DEFERIDO",
      parecer: "Atividades condizentes com o plano de estágio. Ótimo desempenho.",
    },
    {
      id: "REL-02",
      titulo: "Relatório Parcial - Segundo Bimestre",
      dataEntrega: "20/05/2026",
      status: "EM_ANALISE",
    },
  ]);

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
          <button className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 shadow-md">
            Nova Submissão de Relatório
          </button>
        </header>

        {/* Resumo do Estágio Atual */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{estagio.empresa}</h2>
              <p className="text-sm text-slate-500">{estagio.cargo}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
              {estagio.status}
            </span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Período de Vigência</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{estagio.periodo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Carga Horária</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{estagio.cargaHoraria}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Código Identificador</p>
              <p className="mt-1 text-sm font-mono text-slate-700">{estagio.id}</p>
            </div>
          </div>
        </section>

        {/* Histórico de Entregas e Relatórios */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Histórico de Relatórios de Atividades</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50">
                  <th className="p-4">Documento / Relatório</th>
                  <th className="p-4">Data de Envio</th>
                  <th className="p-4">Status da Avaliação</th>
                  <th className="p-4">Parecer Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {relatorios.map((rel) => (
                  <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{rel.titulo}</td>
                    <td className="p-4 text-slate-500">{rel.dataEntrega}</td>
                    <td className="p-4">
                      {rel.status === "DEFERIDO" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                          Deferido
                        </span>
                      )}
                      {rel.status === "INDEFERIDO" && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                          Indeferido
                        </span>
                      )}
                      {rel.status === "EM_ANALISE" && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                          Em Análise
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-xs text-slate-500 italic">
                      {rel.parecer || "Aguardando avaliação do orientador instruído."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}