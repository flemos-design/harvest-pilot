'use client';

import { useParcelas } from '@/hooks/use-parcelas';
import { useOperacoes } from '@/hooks/use-operacoes';
import { Loader2, MapPin, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function DashboardPage() {
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();
  const { data: operacoes, isLoading: isLoadingOperacoes } = useOperacoes();

  if (isLoadingParcelas || isLoadingOperacoes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Estatísticas
  const totalParcelas = parcelas?.length || 0;
  const areaTotal = parcelas?.reduce((sum, p) => sum + p.area, 0) || 0;
  const totalOperacoes = operacoes?.length || 0;
  const custoTotal = operacoes?.reduce((sum, op) => sum + (op.custoTotal || 0), 0) || 0;

  // Operações por tipo
  const operacoesPorTipo = operacoes?.reduce((acc, op) => {
    const existing = acc.find(item => item.name === op.tipo);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: op.tipo, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Operações por mês (últimos 6 meses)
  const operacoesPorMes = operacoes?.reduce((acc, op) => {
    const mes = format(new Date(op.data), 'MMM yyyy', { locale: pt });
    const existing = acc.find(item => item.mes === mes);
    if (existing) {
      existing.total += 1;
    } else {
      acc.push({ mes, total: 1 });
    }
    return acc;
  }, [] as Array<{ mes: string; total: number }>);

  // Últimas 5 operações
  const ultimasOperacoes = operacoes
    ?.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Visão geral da exploração agrícola com monitorização de vigor por satélite (Sentinel Hub) e alertas meteorológicos (IPMA)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MapPin className="w-8 h-8 text-green-600" />}
            title="Total Terrenos"
            value={totalParcelas.toString()}
            subtitle={`${areaTotal.toFixed(2)} hectares`}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<Activity className="w-8 h-8 text-blue-600" />}
            title="Total Operações"
            value={totalOperacoes.toString()}
            subtitle="Registos de campo"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<DollarSign className="w-8 h-8 text-amber-600" />}
            title="Custos Totais"
            value={`${custoTotal.toFixed(2)}€`}
            subtitle="Todas as operações"
            bgColor="bg-amber-50"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
            title="Área Média"
            value={`${totalParcelas > 0 ? (areaTotal / totalParcelas).toFixed(2) : 0} ha`}
            subtitle="Por terreno"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Operações por Tipo */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operações por Tipo</h3>
            {operacoesPorTipo && operacoesPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={operacoesPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {operacoesPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Sem dados de operações
              </div>
            )}
          </div>

          {/* Operações por Mês */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operações por Mês</h3>
            {operacoesPorMes && operacoesPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operacoesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#10b981" name="Operações" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Sem dados de operações
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity & Terrenos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
              <Link href="/operacoes" className="text-sm text-green-600 hover:text-green-700">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-4">
              {ultimasOperacoes && ultimasOperacoes.length > 0 ? (
                ultimasOperacoes.map((operacao) => (
                  <div key={operacao.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <span className="text-2xl">{TIPO_ICONS[operacao.tipo] || '📋'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{operacao.tipo}</p>
                      {operacao.descricao && (
                        <p className="text-sm text-gray-600">{operacao.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(operacao.data), "d MMM, yyyy", { locale: pt })}
                        </span>
                        {operacao.parcela && (
                          <span>{operacao.parcela.nome}</span>
                        )}
                      </div>
                    </div>
                    {operacao.custoTotal && operacao.custoTotal > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        {operacao.custoTotal.toFixed(2)}€
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhuma operação registada ainda
                </div>
              )}
            </div>
          </div>

          {/* Terrenos Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Terrenos</h3>
              <Link href="/parcelas" className="text-sm text-green-600 hover:text-green-700">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {parcelas && parcelas.length > 0 ? (
                parcelas.slice(0, 5).map((parcela) => (
                  <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{parcela.nome}</p>
                      <p className="text-sm text-gray-600">
                        {parcela.area} ha
                        {parcela.altitude && ` • ${parcela.altitude}m`}
                      </p>
                    </div>
                    {parcela.culturas && parcela.culturas.length > 0 && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                        {parcela.culturas[0].especie}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhum terreno criado ainda
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/parcelas/nova"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition text-center"
            >
              <div className="text-3xl mb-2">🗺️</div>
              <p className="font-medium">Novo Terreno</p>
            </Link>
            <Link
              href="/operacoes/nova"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition text-center"
            >
              <div className="text-3xl mb-2">📝</div>
              <p className="font-medium">Nova Operação</p>
            </Link>
            <Link
              href="/parcelas"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="font-medium">Ver Terrenos</p>
            </Link>
            <Link
              href="/operacoes"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition text-center"
            >
              <div className="text-3xl mb-2">📋</div>
              <p className="font-medium">Ver Operações</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center gap-4">
        <div>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
