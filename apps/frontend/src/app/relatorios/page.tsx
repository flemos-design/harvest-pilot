'use client';

import { useOperacoes } from '@/hooks/use-operacoes';
import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Activity, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱',
  REGA: '💧',
  ADUBACAO: '🌿',
  TRATAMENTO: '🧪',
  COLHEITA: '🌾',
  INSPECAO: '🔍',
  PODA: '✂️',
  DESBASTE: '🪓',
};

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<'30d' | '90d' | '6m' | '1y'>('90d');

  const { data: operacoes, isLoading: isLoadingOps } = useOperacoes();
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const end = new Date();
    let start = new Date();

    switch (periodo) {
      case '30d':
        start = subMonths(end, 1);
        break;
      case '90d':
        start = subMonths(end, 3);
        break;
      case '6m':
        start = subMonths(end, 6);
        break;
      case '1y':
        start = subMonths(end, 12);
        break;
    }

    return { start, end };
  }, [periodo]);

  // Filter operations by period
  const operacoesFiltradas = useMemo(() => {
    if (!operacoes) return [];
    return operacoes.filter(op => {
      const opDate = new Date(op.data);
      return isWithinInterval(opDate, dateRange);
    });
  }, [operacoes, dateRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = operacoesFiltradas.length;
    const custoTotal = operacoesFiltradas.reduce((sum, op) => sum + (op.custoTotal || 0), 0);
    const custoMedio = total > 0 ? custoTotal / total : 0;
    const parcelasAtivas = new Set(operacoesFiltradas.map(op => op.parcelaId)).size;

    // Operations per month
    const meses = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const opsPorMes = total / (meses || 1);

    return {
      total,
      custoTotal,
      custoMedio,
      parcelasAtivas,
      opsPorMes: Math.round(opsPorMes * 10) / 10,
    };
  }, [operacoesFiltradas, dateRange]);

  // Operations by type
  const opsPorTipo = useMemo(() => {
    const grouped: Record<string, number> = {};
    operacoesFiltradas.forEach(op => {
      grouped[op.tipo] = (grouped[op.tipo] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);
  }, [operacoesFiltradas]);

  // Cost by type
  const custoPorTipo = useMemo(() => {
    const grouped: Record<string, number> = {};
    operacoesFiltradas.forEach(op => {
      grouped[op.tipo] = (grouped[op.tipo] || 0) + (op.custoTotal || 0);
    });

    return Object.entries(grouped)
      .map(([tipo, custo]) => ({ tipo, custo }))
      .sort((a, b) => b.custo - a.custo);
  }, [operacoesFiltradas]);

  // Operations by parcela
  const opsPorParcela = useMemo(() => {
    const grouped: Record<string, { nome: string; count: number; custo: number }> = {};

    operacoesFiltradas.forEach(op => {
      if (!op.parcela) return;

      if (!grouped[op.parcelaId]) {
        grouped[op.parcelaId] = { nome: op.parcela.nome, count: 0, custo: 0 };
      }
      grouped[op.parcelaId].count += 1;
      grouped[op.parcelaId].custo += op.custoTotal || 0;
    });

    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [operacoesFiltradas]);

  // Monthly trend
  const tendenciaMensal = useMemo(() => {
    const monthsMap: Record<string, { count: number; custo: number }> = {};

    operacoesFiltradas.forEach(op => {
      const monthKey = format(new Date(op.data), 'MMM yyyy', { locale: ptBR });
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = { count: 0, custo: 0 };
      }
      monthsMap[monthKey].count += 1;
      monthsMap[monthKey].custo += op.custoTotal || 0;
    });

    return Object.entries(monthsMap)
      .map(([mes, data]) => ({ mes, operacoes: data.count, custo: data.custo }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.mes);
        const dateB = new Date(b.mes);
        return dateA.getTime() - dateB.getTime();
      });
  }, [operacoesFiltradas]);

  // Efficiency metrics
  const eficiencia = useMemo(() => {
    if (!parcelas || parcelas.length === 0) return { custoPorHa: 0, opsPorHa: 0 };

    const areaTotal = parcelas.reduce((sum, p) => sum + p.area, 0);
    const custoPorHa = areaTotal > 0 ? kpis.custoTotal / areaTotal : 0;
    const opsPorHa = areaTotal > 0 ? kpis.total / areaTotal : 0;

    return { custoPorHa, opsPorHa };
  }, [parcelas, kpis]);

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74); // Green
    doc.text('HarvestPilot - Relatório de Operações', 14, 22);

    // Period
    doc.setFontSize(10);
    doc.setTextColor(100);
    const periodoTexto = `Período: ${format(dateRange.start, "d MMM yyyy", { locale: ptBR })} - ${format(dateRange.end, "d MMM yyyy", { locale: ptBR })}`;
    doc.text(periodoTexto, 14, 30);
    doc.text(`Gerado em: ${format(new Date(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 36);

    // KPIs Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Indicadores Principais', 14, 46);

    autoTable(doc, {
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Operações', `${kpis.total} (${kpis.opsPorMes}/mês)`],
        ['Custo Total', `${kpis.custoTotal.toFixed(2)}€`],
        ['Custo Médio por Operação', `${kpis.custoMedio.toFixed(2)}€`],
        ['Parcelas Ativas', `${kpis.parcelasAtivas} de ${parcelas?.length || 0}`],
        ['Custo por Hectare', `${eficiencia.custoPorHa.toFixed(2)}€/ha`],
        ['Operações por Hectare', `${eficiencia.opsPorHa.toFixed(1)} ops/ha`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
    });

    // Operations by Type
    let finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.text('Operações por Tipo', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Tipo', 'Quantidade', 'Custo Total']],
      body: opsPorTipo.map(item => {
        const custo = custoPorTipo.find(c => c.tipo === item.tipo)?.custo || 0;
        return [item.tipo, item.count.toString(), `${custo.toFixed(2)}€`];
      }),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });

    // Operations by Parcela
    finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(14);
    doc.text('Atividade por Parcela', 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Parcela', 'Operações', 'Custo Total']],
      body: opsPorParcela.map(item => [
        item.nome,
        item.count.toString(),
        `${item.custo.toFixed(2)}€`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });

    // Summary
    if ((doc as any).lastAutoTable.finalY < 240) {
      finalY = (doc as any).lastAutoTable.finalY || 240;
      doc.setFontSize(14);
      doc.text('Resumo do Período', 14, finalY + 10);

      doc.setFontSize(10);
      doc.setTextColor(60);
      let summaryY = finalY + 18;

      if (opsPorTipo[0]) {
        doc.text(`Operação Mais Frequente: ${opsPorTipo[0].tipo} (${opsPorTipo[0].count} vezes)`, 14, summaryY);
        summaryY += 6;
      }

      if (custoPorTipo[0]) {
        doc.text(`Maior Custo: ${custoPorTipo[0].tipo} (${custoPorTipo[0].custo.toFixed(2)}€)`, 14, summaryY);
        summaryY += 6;
      }

      if (opsPorParcela[0]) {
        doc.text(`Parcela Mais Trabalhada: ${opsPorParcela[0].nome} (${opsPorParcela[0].count} operações)`, 14, summaryY);
      }
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `HarvestPilot - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save
    const fileName = `HarvestPilot_Relatorio_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
    doc.save(fileName);
  };

  if (isLoadingOps || isLoadingParcelas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios & Análises</h1>
              <p className="text-gray-600 mt-1">Insights sobre operações agrícolas e análise NDVI por satélite</p>
            </div>
            <button
              onClick={exportarPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>

          {/* Period Selector */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Período:</span>
            <div className="flex gap-2">
              {[
                { value: '30d' as const, label: '30 dias' },
                { value: '90d' as const, label: '90 dias' },
                { value: '6m' as const, label: '6 meses' },
                { value: '1y' as const, label: '1 ano' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    periodo === p.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-4">
              {format(dateRange.start, "d MMM yyyy", { locale: ptBR })} - {format(dateRange.end, "d MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Total Operações</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
            <p className="text-xs text-gray-500 mt-1">{kpis.opsPorMes} por mês</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Custo Total</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpis.custoTotal.toFixed(2)}€</p>
            <p className="text-xs text-gray-500 mt-1">Média: {kpis.custoMedio.toFixed(2)}€/op</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Parcelas Ativas</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpis.parcelasAtivas}</p>
            <p className="text-xs text-gray-500 mt-1">de {parcelas?.length || 0} totais</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-600 font-medium">Custo por Hectare</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{eficiencia.custoPorHa.toFixed(0)}€</p>
            <p className="text-xs text-gray-500 mt-1">{eficiencia.opsPorHa.toFixed(1)} ops/ha</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendência Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendenciaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="operacoes" stroke="#10b981" name="Operações" />
                <Line yAxisId="right" type="monotone" dataKey="custo" stroke="#3b82f6" name="Custo (€)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Operations by Type */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operações por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opsPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Operações" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cost by Type */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Custos por Tipo de Operação</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {custoPorTipo.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sem dados de custo</p>
                ) : (
                  custoPorTipo.map((item) => (
                    <div key={item.tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{TIPO_ICONS[item.tipo] || '📋'}</span>
                        <span className="font-medium text-gray-900">{item.tipo}</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{item.custo.toFixed(2)}€</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Operations by Parcela */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Atividade por Parcela</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {opsPorParcela.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
                ) : (
                  opsPorParcela.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.nome}</p>
                        <p className="text-xs text-gray-500">{item.count} operações</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{item.custo.toFixed(2)}€</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Resumo do Período</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-green-100 text-sm mb-1">Operação Mais Frequente</p>
              <p className="text-2xl font-bold">
                {opsPorTipo[0] ? `${TIPO_ICONS[opsPorTipo[0].tipo]} ${opsPorTipo[0].tipo}` : 'N/A'}
              </p>
              {opsPorTipo[0] && (
                <p className="text-green-100 text-sm mt-1">{opsPorTipo[0].count} vezes</p>
              )}
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Maior Custo</p>
              <p className="text-2xl font-bold">
                {custoPorTipo[0] ? `${TIPO_ICONS[custoPorTipo[0].tipo]} ${custoPorTipo[0].tipo}` : 'N/A'}
              </p>
              {custoPorTipo[0] && (
                <p className="text-green-100 text-sm mt-1">{custoPorTipo[0].custo.toFixed(2)}€</p>
              )}
            </div>
            <div>
              <p className="text-green-100 text-sm mb-1">Parcela Mais Trabalhada</p>
              <p className="text-2xl font-bold">
                {opsPorParcela[0]?.nome || 'N/A'}
              </p>
              {opsPorParcela[0] && (
                <p className="text-green-100 text-sm mt-1">{opsPorParcela[0].count} operações</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
