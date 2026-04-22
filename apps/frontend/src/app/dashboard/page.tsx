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
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱', REGA: '💧', ADUBACAO: '🌿', TRATAMENTO: '🧪',
  COLHEITA: '🌾', INSPECAO: '🔍', PODA: '✂️', DESBASTE: '🪓',
};

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

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

  const tarefasPendentes = tarefas
    ?.filter((t) => t.estado !== 'CONCLUIDA')
    .sort((a, b) => {
      const order = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
      return (order[a.prioridade] || 99) - (order[b.prioridade] || 99);
    })
    .slice(0, 5);

  const imagensComNDVI = imagensRemotas?.filter((img) => img.ndvi !== null && img.ndvi !== undefined);
  const ndviMedio = imagensComNDVI?.length
    ? imagensComNDVI.reduce((sum, img) => sum + (img.ndvi || 0), 0) / imagensComNDVI.length
    : null;

  const operacoesPorTipo = operacoes?.reduce((acc, op) => {
    const existing = acc.find((item) => item.name === op.tipo);
    if (existing) existing.value += 1;
    else acc.push({ name: op.tipo, value: 1 });
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const operacoesPorMes = operacoes?.reduce((acc, op) => {
    const mes = format(new Date(op.data), 'MMM yyyy', { locale: pt });
    const existing = acc.find((item) => item.mes === mes);
    if (existing) existing.total += 1;
    else acc.push({ mes, total: 1 });
    return acc;
  }, [] as Array<{ mes: string; total: number }>);

  const ultimasOperacoes = operacoes
    ?.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da exploração agrícola com monitorização de vigor por satélite (Sentinel Hub) e alertas meteorológicos (IPMA)"
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ========== ALERTAS & INSIGHTS ========== */}
        {(insights && insights.length > 0) || (criticalParcelas && criticalParcelas.length > 0) ? (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alertas Inteligentes</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">Via Assistente IA</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights?.slice(0, 3).map((insight, idx) => (
                <AlertCard key={idx} insight={insight} />
              ))}
              {criticalParcelas?.slice(0, 2).map((cp, idx) => (
                <Card key={`crit-${idx}`} variant="colored" color="red" padding="md">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-300">{cp.nome}</p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">Score crítico: {cp.score}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cp.reasons.map((r: string, i: number) => (
                          <Badge key={i} variant="red" size="sm">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ) : null}

        {/* ========== WIDGETS RÁPIDOS ========== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickWidget
            icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
            title="Tarefas Pendentes"
            value={tarefasStats?.porEstado?.find((e: any) => e.estado === 'PLANEADA')?.count || 0}
            subtitle={`${tarefasStats?.porEstado?.find((e: any) => e.estado === 'EM_CURSO')?.count || 0} em curso`}
            color="blue"
            href="/tarefas"
          />
          <QuickWidget
            icon={<Package className="w-6 h-6 text-amber-600" />}
            title="Insumos em Alerta"
            value={(lowStock?.length || 0) + (expiringSoon?.length || 0)}
            subtitle={`${lowStock?.length || 0} stock baixo • ${expiringSoon?.length || 0} a expirar`}
            color="amber"
            href="/insumos"
          />
          <QuickWidget
            icon={<Leaf className="w-6 h-6 text-emerald-600" />}
            title="NDVI Médio"
            value={ndviMedio !== null ? ndviMedio.toFixed(2) : '—'}
            subtitle={ndviMedio !== null ? interpretNDVI(ndviMedio) : 'Sem dados de satélite'}
            color="green"
            href="/satelite"
          />
          <QuickWidget
            icon={<CloudRain className="w-6 h-6 text-cyan-600" />}
            title="Meteorologia"
            value={forecast && forecast[0] ? `${forecast[0].temperatura?.toFixed(0) || '—'}°C` : '—'}
            subtitle={forecast && forecast[0] ? `${forecast[0].probChuva || 0}% chuva` : 'Sem previsão'}
            color="cyan"
            href="/parcelas"
          />
        </div>

        {/* ========== PREVISÃO DETALHADA + TAREFAS + INSUMOS ========== */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Previsão Meteorológica */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Previsão {primeiraParcela ? `— ${primeiraParcela.nome}` : 'Meteorológica'}
              </h3>
            </div>
            {forecast && forecast.length > 0 ? (
              <div className="space-y-3">
                {forecast.slice(0, 3).map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20">
                        {idx === 0 ? 'Hoje' : format(new Date(day.data), 'EEE', { locale: pt })}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        {day.tempMin?.toFixed(0)}–{day.tempMax?.toFixed(0)}°C
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        {day.probChuva || 0}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-4 h-4 text-slate-400" />
                        {day.vento || 0} km/h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Sem dados meteorológicos disponíveis</p>
                <p className="text-xs mt-1">A sincronizar com IPMA...</p>
              </div>
            )}
          </Card>

          {/* Tarefas Prioritárias */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Tarefas Prioritárias
              </h3>
              <Link href="/tarefas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ver todas →
              </Link>
            </div>
            {tarefasPendentes && tarefasPendentes.length > 0 ? (
              <div className="space-y-3">
                {tarefasPendentes.map((tarefa) => (
                  <Link key={tarefa.id} href={`/tarefas/${tarefa.id}`} className="block">
                    <div className={`border rounded-xl p-3 transition hover:shadow-sm ${getPriorityStyle(tarefa.prioridade)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{tarefa.titulo}</p>
                          <p className="text-xs mt-1 opacity-80">
                            {tarefa.tipo} • {format(new Date(tarefa.dataInicio), 'd MMM', { locale: pt })}
                            {tarefa.dataFim && ` → ${format(new Date(tarefa.dataFim), 'd MMM', { locale: pt })}`}
                          </p>
                        </div>
                        <Badge variant={tarefa.estado === 'EM_CURSO' ? 'blue' : 'slate'} size="sm">
                          {tarefa.estado === 'EM_CURSO' ? '▶ Em curso' : tarefa.prioridade}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Todas as tarefas estão concluídas!</p>
              </div>
            )}
          </Card>

          {/* Insumos em Alerta */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Insumos em Alerta
              </h3>
              <Link href="/insumos" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {lowStock && lowStock.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">Stock Baixo</p>
                  {lowStock.slice(0, 3).map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{insumo.nome}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{insumo.categoria}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{insumo.stock} {insumo.unidade}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {expiringSoon && expiringSoon.length > 0 ? (
                <div className={lowStock && lowStock.length > 0 ? 'mt-4' : ''}>
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2 uppercase tracking-wide">A Expirar (&lt;30d)</p>
                  {expiringSoon.slice(0, 3).map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-800">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{insumo.nome}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{insumo.categoria}</p>
                      </div>
                      <span className="text-xs font-medium text-red-700 dark:text-red-400">
                        {insumo.validade ? format(new Date(insumo.validade), 'd MMM yyyy', { locale: pt }) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {(!lowStock || lowStock.length === 0) && (!expiringSoon || expiringSoon.length === 0) && (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Todos os insumos em ordem</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<MapPin className="w-8 h-8 text-emerald-600" />} title="Total Terrenos" value={totalParcelas.toString()} subtitle={`${areaTotal.toFixed(2)} hectares`} color="green" />
          <StatCard icon={<Activity className="w-8 h-8 text-blue-600" />} title="Total Operações" value={totalOperacoes.toString()} subtitle="Registos de campo" color="blue" />
          <StatCard icon={<DollarSign className="w-8 h-8 text-amber-600" />} title="Custos Totais" value={`${custoTotal.toFixed(2)}€`} subtitle="Todas as operações" color="amber" />
          <StatCard icon={<TrendingUp className="w-8 h-8 text-purple-600" />} title="Área Média" value={`${totalParcelas > 0 ? (areaTotal / totalParcelas).toFixed(2) : 0} ha`} subtitle="Por terreno" color="purple" />
        </div>

        {/* ========== CHARTS ========== */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Operações por Tipo</h3>
            {operacoesPorTipo && operacoesPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={operacoesPorTipo} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80} fill="#8884d8" dataKey="value">
                    {operacoesPorTipo.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">Sem dados de operações</div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Operações por Mês</h3>
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
              <div className="flex items-center justify-center h-[300px] text-slate-400">Sem dados de operações</div>
            )}
          </Card>
        </div>

        {/* ========== ATIVIDADE RECENTE + TERRENOS ========== */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Atividade Recente</h3>
              <Link href="/operacoes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Ver todas →</Link>
            </div>
            <div className="space-y-4">
              {ultimasOperacoes && ultimasOperacoes.length > 0 ? (
                ultimasOperacoes.map((operacao) => (
                  <div key={operacao.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0 border-slate-100 dark:border-slate-700">
                    <span className="text-2xl">{TIPO_ICONS[operacao.tipo] || '📋'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{operacao.tipo}</p>
                      {operacao.descricao && <p className="text-sm text-slate-600 dark:text-slate-400">{operacao.descricao}</p>}
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(operacao.data), 'd MMM, yyyy', { locale: pt })}
                        </span>
                        {operacao.parcela && <span>{operacao.parcela.nome}</span>}
                      </div>
                    </div>
                    {operacao.custoTotal && operacao.custoTotal > 0 && (
                      <span className="text-sm font-medium text-emerald-600">{operacao.custoTotal.toFixed(2)}€</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">Nenhuma operação registada ainda</div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Terrenos</h3>
              <Link href="/parcelas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Ver todas →</Link>
            </div>
            <div className="space-y-3">
              {parcelas && parcelas.length > 0 ? (
                parcelas.slice(0, 5).map((parcela) => (
                  <div key={parcela.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{parcela.nome}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {parcela.area} ha{parcela.altitude && ` • ${parcela.altitude}m`}
                      </p>
                    </div>
                    {parcela.culturas && parcela.culturas.length > 0 && (
                      <Badge variant="amber" size="sm">{parcela.culturas[0].especie}</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">Nenhum terreno criado ainda</div>
              )}
            </div>
          </Card>
        </div>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { href: '/parcelas/nova', emoji: '🗺️', label: 'Novo Terreno' },
              { href: '/operacoes/nova', emoji: '📝', label: 'Nova Operação' },
              { href: '/parcelas', emoji: '📊', label: 'Ver Terrenos' },
              { href: '/operacoes', emoji: '📋', label: 'Ver Operações' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition text-center"
              >
                <div className="text-3xl mb-2">{action.emoji}</div>
                <p className="font-medium">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function AlertCard({ insight }: { insight: any }) {
  const typeConfig: Record<string, { icon: React.ReactNode; variant: 'red' | 'amber' | 'blue' | 'green' }> = {
    alert: { icon: <AlertTriangle className="w-5 h-5" />, variant: 'red' },
    warning: { icon: <AlertOctagon className="w-5 h-5" />, variant: 'amber' },
    recommendation: { icon: <Zap className="w-5 h-5" />, variant: 'blue' },
    info: { icon: <Sun className="w-5 h-5" />, variant: 'green' },
  };
  const config = typeConfig[insight.type] || typeConfig.info;

  return (
    <Card variant="colored" color={config.variant} padding="md">
      <div className="flex items-start gap-3">
        <div className={config.variant === 'red' ? 'text-red-600' : config.variant === 'amber' ? 'text-amber-600' : config.variant === 'blue' ? 'text-blue-600' : 'text-emerald-600'}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${config.variant === 'red' ? 'text-red-900 dark:text-red-300' : config.variant === 'amber' ? 'text-amber-900 dark:text-amber-300' : config.variant === 'blue' ? 'text-blue-900 dark:text-blue-300' : 'text-emerald-900 dark:text-emerald-300'}`}>
            {insight.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{insight.description}</p>
          {insight.actions && insight.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {insight.actions.slice(0, 2).map((action: string, i: number) => (
                <span key={i} className="text-xs bg-white dark:bg-slate-800/70 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function QuickWidget({
  icon, title, value, subtitle, color, href,
}: {
  icon: React.ReactNode; title: string; value: string | number; subtitle: string; color: string; href: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    green: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800',
  };

  return (
    <Link href={href} className="block">
      <div className={`${colorMap[color] || colorMap.green} rounded-2xl border shadow-sm p-5 hover:shadow-md transition`}>
        <div className="flex items-center gap-3">
          <div>{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

function StatCard({
  icon, title, value, subtitle, color,
}: {
  icon: React.ReactNode; title: string; value: string; subtitle: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`${colorMap[color] || colorMap.green} rounded-2xl border shadow-sm p-6`}>
      <div className="flex items-center gap-4">
        <div>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function getPriorityStyle(priority: string) {
  const map: Record<string, string> = {
    URGENTE: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300',
    ALTA: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300',
    MEDIA: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300',
    BAIXA: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };
  return map[priority] || map.BAIXA;
}

function interpretNDVI(valor: number): string {
  if (valor > 0.7) return 'Excelente vigor vegetativo';
  if (valor > 0.5) return 'Bom vigor vegetativo';
  if (valor > 0.3) return 'Vigor moderado';
  return 'Vigor baixo — atenção necessária';
}
