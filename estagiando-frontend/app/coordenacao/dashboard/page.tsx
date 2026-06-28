"use client";

import { useState } from "react";

type ConvenioPendente = {
  id: string;
  empresa: string;
  cnpj: string;
  dataSolicitacao: string;
};

type AuditLogMinimo = {
  id: string;
  usuario: string;
  acao: string;
  timestamp: string;
};

export default function CoordenacaoDashboard() {
  const [convenios, setConvenios] = useState<ConvenioPendente[]>([
    {
      id: "CONV-401",
      empresa: "Apex Soluções de Engenharia S/A",
      cnpj: "12.345.678/0001-99",
      dataSolicitacao: "22/06/2026",
    },
    {
      id: "CONV-402",
      empresa: "Blume Softwares Editoriais",
      cnpj: "98.765.432/0001-11",
      dataSolicitacao: "25/06/2026",
    },
  ]);

  const [logs] = useState<AuditLogMinimo[]>([
    {
      id: "LOG-992",
      usuario: "Dr. Roberto Neves (Orientador)",
      acao: "Deferimento do relatório parcial do aluno RA: 2201948",
      timestamp: "25/06/2026 às 14:32",
    },
    {
      id: "LOG-991",
      usuario: "Ana Beatriz (Aluno)",
      acao: "Upload de arquivo de termo aditivo contratual",
      timestamp: "25/06/2026 às 11:15",
    },
  ]);

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
          <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 shadow-md">
            Ver Painel Completo de Auditoria
          </button>
        </header>

        {/* Métricas Operacionais */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Estágios Ativos na Instituição</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">142</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Convênios para Homologação</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{convenios.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Empresas Parceiras Ativas</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-600">48</p>
          </div>
        </section>

        {/* Grid Layout Duplo: Convênios e Auditoria Recente */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Homologação de Convênios */}
          <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Solicitações de Convênio Corporativo</h2>
            <p className="text-xs text-slate-500 mb-6">Valide os critérios regulatórios antes de emitir a homologação formal.</p>
            
            <div className="space-y-4">
              {convenios.map((conv) => (
                <div key={conv.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{conv.empresa}</h4>
                    <p className="text-xs text-slate-400">CNPJ: {conv.cnpj} | Solicitado em: {conv.dataSolicitacao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700">
                      Homologar
                    </button>
                    <button className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      Indeferir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rastreabilidade / Monitoramento de Auditoria Rápida */}
          <section className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Atividades do Sistema</h2>
            <p className="text-xs text-slate-500 mb-6">Logs imutáveis em tempo real.</p>

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-blue-600 bg-slate-50 p-3 rounded-r-xl">
                  <div className="text-xs font-bold text-slate-800">{log.usuario}</div>
                  <p className="mt-1 text-xs text-slate-600 leading-tight">{log.acao}</p>
                  <span className="mt-2 block text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}