"use client";

import { useState } from "react";

type AlunoVinculado = {
  id: string;
  nome: string;
  ra: string;
  empresa: string;
  relatoriosPendentes: number;
  ultimaEntrega: string;
};

export default function OrientadorDashboard() {
  const [alunos] = useState<AlunoVinculado[]>([
    {
      id: "ALU-9821",
      nome: "Ana Beatriz Silva Santos",
      ra: "2201948",
      empresa: "SoftPlan Systems",
      relatoriosPendentes: 1,
      ultimaEntrega: "24/06/2026",
    },
    {
      id: "ALU-3312",
      nome: "Carlos Eduardo Oliveira",
      ra: "2203451",
      empresa: "Google Brasil",
      relatoriosPendentes: 0,
      ultimaEntrega: "10/05/2026",
    },
    {
      id: "ALU-7741",
      nome: "Mariana Costa Rezende",
      ra: "2104992",
      empresa: "Petrobras S.A.",
      relatoriosPendentes: 2,
      ultimaEntrega: "19/06/2026",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <header>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Corpo Docente / Orientação
          </span>
          <h1 className="text-3xl font-bold text-slate-900">Alunos Sob Minha Supervisão</h1>
          <p className="text-sm text-slate-500 mt-1">Validação de relatórios e emissão de pareceres intermediários.</p>
        </header>

        {/* Métricas Rápidas */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Total de Orientandos</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{alunos.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Relatórios Aguardando Parecer</h3>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {alunos.reduce((acc, curr) => acc + curr.relatoriosPendentes, 0)}
            </p>
          </div>
        </section>

        {/* Lista de Orientandos */}
        <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Listagem de Processos Ativos</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50">
                  <th className="p-4">Aluno / RA</th>
                  <th className="p-4">Empresa Concedente</th>
                  <th className="p-4">Última Entrega</th>
                  <th className="p-4 text-center">Pendências</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {alunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{aluno.nome}</div>
                      <div className="text-xs text-slate-400">RA: {aluno.ra}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{aluno.empresa}</td>
                    <td className="p-4 text-slate-500">{aluno.ultimaEntrega}</td>
                    <td className="p-4 text-center">
                      {aluno.relatoriosPendentes > 0 ? (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-800 border border-amber-200">
                          {aluno.relatoriosPendentes} pendente(s)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                        Avaliar Relatórios
                      </button>
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