'use client';

import { useParcelas } from '@/hooks/use-parcelas';
import { useOperacoes } from '@/hooks/use-operacoes';
import { useTarefas, useTarefasStats } from '@/hooks/use-tarefas';
import { useLowStockInsumos, useExpiringSoonInsumos } from '@/hooks/use-insumos';
import { useInsights, useCriticalParcelas } from '@/hooks/use-ia';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { useForecast } from '@/hooks/use-meteorologia';
import { useImagensRemotas } from '@/hooks/use-imagens-remotas';
import {
  Loader2, MapPin, TrendingUp, DollarSign, Calendar, Activity,
  AlertTriangle, CloudRain, Wind, Thermometer, Droplets, Sun,
  CheckCircle2, Clock, AlertOctagon, Package, Leaf, Zap,
  ArrowRight, Brain,
} from 'lucide-react';
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
const PRIORITY_COLORS: Record<string, string> = {
  URGENTE: 'text-red-600 bg-red-50 border-red-200',
  ALTA: 'text-amber-600 bg-amber-50 border-amber-200',
  MEDIA: 'text-blue-600 bg-blue-50 border-blue-200',
  BAIXA: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
};

export default function DashboardPage() {
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();
  const { data: operacoes, isLoading: isLoadingOperacoes } = useOperacoes();
  const { data: tarefas, isLoading: isLoadingTarefas } = useTarefas();
  const { data: tarefasStats } = useTarefasStats();
  const { data: lowStock } = useLowStockInsumos();
  const { data: expiringSoon } = useExpiringSoonInsumos(30);
  const { data: organizacoes } = useOrganizacoes();
  const orgId = organizacoes?.[0]?.id || '';
  const { data: insights, isLoading: isLoadingInsights } = useInsights(orgId);
  const { data: criticalParcelas, isLoading: isLoadingCritical } = useCriticalParcelas(orgId);

  const primeiraParcela = parcelas?.[0];
  const { data: forecast } = useForecast(primeiraParcela?.id || '', 3);
  const { data: imagensRemotas } = useImagensRemotas();

  const isLoading = isLoadingParcelas || isLoadingOperacoes || isLoadingTarefas || isLoadingInsights || isLoadingCritical;

  // Estatísticas
  const totalParcelas = parcelas?.length || 0;
  const areaTotal = parcelas?.reduce((sum, p) => sum + p.area, 0) || 0;
  const totalOperacoes = operacoes?.length || 0;
  const custoTotal = operacoes?.reduce((sum, op) => sum + (op.custoTotal || 0), 0) || 0;

  // Tarefas prioritárias (não concluídas)
  const tarefasPendentes = tarefas
    ?.filter((t) => t.estado !== 'CONCLUIDA')
    .sort((a, b) => {
      const order = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
      return (order[a.prioridade] || 99) - (order[b.prioridade] || 99);
    })
    .slice(0, 5);

  // NDVI médio
  const imagensComNDVI = imagensRemotas?.filter((img) => img.ndvi !== null && img.ndvi !== undefined);
  const ndviMedio = imagensComNDVI?.length
    ? imagensComNDVI.reduce((sum, img) => sum + (img.ndvi || 0), 0) / imagensComNDVI.length
    : null;

  // Operações por tipo
  const operacoesPorTipo = operacoes?.reduce((acc, op) => {
    const existing = acc.find((item) => item.name === op.tipo);
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
    const existing = acc.find((item) => item.mes === mes);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visão geral da exploração agrícola com monitorização de vigor por satélite (Sentinel Hub) e alertas meteorológicos (IPMA)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ========== ALERTAS & INSIGHTS ========== */}
        {(insights && insights.length > 0) || (criticalParcelas && criticalParcelas.length > 0) ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertas Inteligentes</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Via Assistente IA</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights?.slice(0, 3).map((insight, idx) => (
                <AlertCard key={idx} insight={insight} />
              ))}
              {criticalParcelas?.slice(0, 2).map((cp, idx) => (
                <div key={`crit-${idx}`} className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">{cp.nome}</p>
                      <p className="text-sm text-red-700 mt-1">Score crítico: {cp.score}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cp.reasons.map((r, i) => (
                          <span key={i} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ========== WIDGETS RÁPIDOS ========== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarefas Pendentes */}
          <QuickWidget
            icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
            title="Tarefas Pendentes"
            value={tarefasStats?.porEstado?.find((e: any) => e.estado === 'PLANEADA')?.count || 0}
            subtitle={`${tarefasStats?.porEstado?.find((e: any) => e.estado === 'EM_CURSO')?.count || 0} em curso`}
            bgColor="bg-blue-50"
            href="/tarefas"
          />
          {/* Insumos em Alerta */}
          <QuickWidget
            icon={<Package className="w-6 h-6 text-amber-600" />}
            title="Insumos em Alerta"
            value={(lowStock?.length || 0) + (expiringSoon?.length || 0)}
            subtitle={`${lowStock?.length || 0} stock baixo • ${expiringSoon?.length || 0} a expirar`}
            bgColor="bg-amber-50"
            href="/insumos"
          />
          {/* NDVI Médio */}
          <QuickWidget
            icon={<Leaf className="w-6 h-6 text-green-600" />}
            title="NDVI Médio"
            value={ndviMedio !== null ? ndviMedio.toFixed(2) : '—'}
            subtitle={ndviMedio !== null ? interpretNDVI(ndviMedio) : 'Sem dados de satélite'}
            bgColor="bg-green-50"
            href="/satelite"
          />
          {/* Previsão Meteo */}
          <QuickWidget
            icon={<CloudRain className="w-6 h-6 text-cyan-600" />}
            title="Meteorologia"
            value={forecast && forecast[0] ? `${forecast[0].temperatura?.toFixed(0) || '—'}°C` : '—'}
            subtitle={forecast && forecast[0] ? `${forecast[0].probChuva || 0}% chuva` : 'Sem previsão'}
            bgColor="bg-cyan-50"
            href="/parcelas"
          />
        </div>

        {/* ========== PREVISÃO DETALHADA + TAREFAS + INSUMOS ========== */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Previsão Meteorológica */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Previsão {primeiraParcela ? `— ${primeiraParcela.nome}` : 'Meteorológica'}
              </h3>
            </div>
            {forecast && forecast.length > 0 ? (
              <div className="space-y-3">
                {forecast.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                        {idx === 0 ? 'Hoje' : format(new Date(day.data), 'EEE', { locale: pt })}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        {day.tempMin?.toFixed(0)}–{day.tempMax?.toFixed(0)}°C
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        {day.probChuva || 0}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-4 h-4 text-gray-400" />
                        {day.vento || 0} km/h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Sem dados meteorológicos disponíveis</p>
                <p className="text-xs mt-1">A sincronizar com IPMA...</p>
              </div>
            )}
          </div>

          {/* Tarefas Prioritárias */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Tarefas Prioritárias
              </h3>
              <Link href="/tarefas" className="text-sm text-green-600 hover:text-green-700">
                Ver todas →
              </Link>
            </div>
            {tarefasPendentes && tarefasPendentes.length > 0 ? (
              <div className="space-y-3">
                {tarefasPendentes.map((tarefa) => (
                  <Link key={tarefa.id} href={`/tarefas/${tarefa.id}`} className="block">
                    <div className={`border rounded-lg p-3 ${PRIORITY_COLORS[tarefa.prioridade] || PRIORITY_COLORS.BAIXA}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{tarefa.titulo}</p>
                          <p className="text-xs mt-1 opacity-80">
                            {tarefa.tipo} • {format(new Date(tarefa.dataInicio), 'd MMM', { locale: pt })}
                            {tarefa.dataFim && ` → ${format(new Date(tarefa.dataFim), 'd MMM', { locale: pt })}`}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 bg-white dark:bg-gray-800/60 rounded">
                          {tarefa.estado === 'EM_CURSO' ? '▶ Em curso' : tarefa.prioridade}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Todas as tarefas estão concluídas!</p>
              </div>
            )}
          </div>

          {/* Insumos em Alerta */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Insumos em Alerta
              </h3>
              <Link href="/insumos" className="text-sm text-green-600 hover:text-green-700">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {lowStock && lowStock.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-2 uppercase tracking-wide">Stock Baixo</p>
                  {lowStock.slice(0, 3).map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{insumo.nome}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{insumo.categoria}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-700">{insumo.stock} {insumo.unidade}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {expiringSoon && expiringSoon.length > 0 ? (
                <div className={lowStock && lowStock.length > 0 ? 'mt-4' : ''}>
                  <p className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wide">A Expirar (&lt;30d)</p>
                  {expiringSoon.slice(0, 3).map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{insumo.nome}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{insumo.categoria}</p>
                      </div>
                      <span className="text-xs font-medium text-red-700">
                        {insumo.validade ? format(new Date(insumo.validade), 'd MMM yyyy', { locale: pt }) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {(!lowStock || lowStock.length === 0) && (!expiringSoon || expiringSoon.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Todos os insumos em ordem</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== STATS CARDS ORIGINAIS ========== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* ========== CHARTS ========== */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Operações por Tipo</h3>
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
              <div className="flex items-center justify-center h-[300px] text-gray-400">Sem dados de operações</div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Operações por Mês</h3>
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
              <div className="flex items-center justify-center h-[300px] text-gray-400">Sem dados de operações</div>
            )}
          </div>
        </div>

        {/* ========== ATIVIDADE RECENTE + TERRENOS ========== */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Atividade Recente</h3>
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
                      <p className="font-medium text-gray-900 dark:text-gray-100">{operacao.tipo}</p>
                      {operacao.descricao && <p className="text-sm text-gray-600 dark:text-gray-400">{operacao.descricao}</p>}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(operacao.data), 'd MMM, yyyy', { locale: pt })}
                        </span>
                        {operacao.parcela && <span>{operacao.parcela.nome}</span>}
                      </div>
                    </div>
                    {operacao.custoTotal && operacao.custoTotal > 0 && (
                      <span className="text-sm font-medium text-green-600">{operacao.custoTotal.toFixed(2)}€</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">Nenhuma operação registada ainda</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Terrenos</h3>
              <Link href="/parcelas" className="text-sm text-green-600 hover:text-green-700">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {parcelas && parcelas.length > 0 ? (
                parcelas.slice(0, 5).map((parcela) => (
                  <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{parcela.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className="text-center py-8 text-gray-400">Nenhum terreno criado ainda</div>
              )}
            </div>
          </div>
        </div>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/parcelas/nova" className="bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 backdrop-blur rounded-lg p-4 transition text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="font-medium">Novo Terreno</p>
            </Link>
            <Link href="/operacoes/nova" className="bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 backdrop-blur rounded-lg p-4 transition text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="font-medium">Nova Operação</p>
            </Link>
            <Link href="/parcelas" className="bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 backdrop-blur rounded-lg p-4 transition text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-medium">Ver Terrenos</p>
            </Link>
            <Link href="/operacoes" className="bg-white dark:bg-gray-800/10 hover:bg-white dark:bg-gray-800/20 backdrop-blur rounded-lg p-4 transition text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="font-medium">Ver Operações</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function AlertCard({ insight }: { insight: any }) {
  const typeConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    alert: { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
    warning: { icon: <AlertOctagon className="w-5 h-5" />, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    recommendation: { icon: <Zap className="w-5 h-5" />, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    info: { icon: <Sun className="w-5 h-5" />, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  };
  const config = typeConfig[insight.type] || typeConfig.info;

  return (
    <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={config.text}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${config.text}`}>{insight.title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{insight.description}</p>
          {insight.actions && insight.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {insight.actions.slice(0, 2).map((action: string, i: number) => (
                <span key={i} className="text-xs bg-white dark:bg-gray-800/70 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickWidget({
  icon,
  title,
  value,
  subtitle,
  bgColor,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  bgColor: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className={`${bgColor} rounded-lg shadow-sm border p-5 hover:shadow-md transition`}>
        <div className="flex items-center gap-3">
          <div>{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </Link>
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
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function interpretNDVI(valor: number): string {
  if (valor > 0.7) return 'Excelente vigor vegetativo';
  if (valor > 0.5) return 'Bom vigor vegetativo';
  if (valor > 0.3) return 'Vigor moderado';
  return 'Vigor baixo — atenção necessária';
}
