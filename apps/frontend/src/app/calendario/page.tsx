'use client';

import { useOperacoes } from '@/hooks/use-operacoes';
import { useCalendarioByMes } from '@/hooks/use-calendario';
import { Loader2, Calendar, ChevronLeft, ChevronRight, Filter, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useMemo } from 'react';

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

const TIPO_COLORS: Record<string, string> = {
  PLANTACAO: 'bg-green-100 text-green-800 border-green-300',
  REGA: 'bg-blue-100 text-blue-800 border-blue-300',
  ADUBACAO: 'bg-lime-100 text-lime-800 border-lime-300',
  TRATAMENTO: 'bg-purple-100 text-purple-800 border-purple-300',
  COLHEITA: 'bg-amber-100 text-amber-800 border-amber-300',
  INSPECAO: 'bg-gray-100 text-gray-800 border-gray-300',
  PODA: 'bg-orange-100 text-orange-800 border-orange-300',
  DESBASTE: 'bg-red-100 text-red-800 border-red-300',
};

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTipo, setSelectedTipo] = useState<string>('TODOS');

  const { data: operacoes, isLoading, error } = useOperacoes();
  const { data: janelasRecomendadas } = useCalendarioByMes(currentDate.getMonth() + 1);

  // Filter operations for current month
  const operacoesDoMes = useMemo(() => {
    if (!operacoes) return [];

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    return operacoes.filter(op => {
      const opDate = new Date(op.data);
      const isInMonth = opDate >= start && opDate <= end;
      const matchesTipo = selectedTipo === 'TODOS' || op.tipo === selectedTipo;
      return isInMonth && matchesTipo;
    });
  }, [operacoes, currentDate, selectedTipo]);

  // Group operations by date
  const operacoesPorDia = useMemo(() => {
    const grouped: Record<string, typeof operacoesDoMes> = {};

    operacoesDoMes.forEach(op => {
      const dateKey = format(new Date(op.data), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(op);
    });

    return grouped;
  }, [operacoesDoMes]);

  // Get all days in current month
  const diasDoMes = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  // Calculate stats for current month
  const stats = useMemo(() => {
    const total = operacoesDoMes.length;
    const custo = operacoesDoMes.reduce((sum, op) => sum + (op.custoTotal || 0), 0);
    const parcelasUnicas = new Set(operacoesDoMes.map(op => op.parcelaId)).size;

    return { total, custo, parcelasUnicas };
  }, [operacoesDoMes]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar operações</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendário Agrícola</h1>
              <p className="text-gray-600 mt-1">Planeamento de plantação e colheita com janelas recomendadas</p>
            </div>
            <Link
              href="/operacoes/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Nova Operação
            </Link>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 min-w-[200px] text-center">
                {format(currentDate, "MMMM 'de' yyyy", { locale: pt })}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                Hoje
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="PLANTACAO">🌱 Plantação</option>
                <option value="REGA">💧 Rega</option>
                <option value="ADUBACAO">🌿 Adubação</option>
                <option value="TRATAMENTO">🧪 Tratamento</option>
                <option value="COLHEITA">🌾 Colheita</option>
                <option value="INSPECAO">🔍 Inspeção</option>
                <option value="PODA">✂️ Poda</option>
                <option value="DESBASTE">🪓 Desbaste</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Operações este mês</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Talhões trabalhados</p>
            <p className="text-2xl font-bold text-gray-900">{stats.parcelasUnicas}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Custo total</p>
            <p className="text-2xl font-bold text-green-600">{stats.custo.toFixed(2)}€</p>
          </div>
        </div>

        {/* Janelas Recomendadas */}
        {janelasRecomendadas && janelasRecomendadas.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Janelas Recomendadas para {format(currentDate, 'MMMM', { locale: pt })}
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {janelasRecomendadas.map((janela: any) => (
                <div
                  key={janela.id}
                  className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{janela.cultura}</h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {janela.tipoOperacao}
                    </span>
                  </div>
                  {janela.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{janela.descricao}</p>
                  )}
                  <div className="space-y-2 text-xs">
                    {janela.mesInicio && janela.mesFim && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Mês {janela.mesInicio}
                          {janela.mesFim !== janela.mesInicio && ` - ${janela.mesFim}`}
                        </span>
                      </div>
                    )}
                    {janela.regiao && (
                      <div className="text-gray-600">
                        📍 {janela.regiao}
                      </div>
                    )}
                    {janela.observacoes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800">
                        💡 {janela.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Timeline */}
      <main className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {diasDoMes.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum dia no mês selecionado</p>
            </div>
          ) : (
            <div className="divide-y">
              {diasDoMes.map(dia => {
                const dateKey = format(dia, 'yyyy-MM-dd');
                const operacoesDoDia = operacoesPorDia[dateKey] || [];
                const isToday = isSameDay(dia, new Date());
                const isCurrentMonth = isSameMonth(dia, currentDate);

                return (
                  <div
                    key={dateKey}
                    className={`p-4 ${isToday ? 'bg-blue-50' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Column */}
                      <div className="flex-shrink-0 w-20 text-center">
                        <div className={`text-xs font-medium uppercase ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                          {format(dia, 'EEE', { locale: pt })}
                        </div>
                        <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {format(dia, 'd')}
                        </div>
                      </div>

                      {/* Operations Column */}
                      <div className="flex-1">
                        {operacoesDoDia.length === 0 ? (
                          <p className="text-sm text-gray-400 py-2">Sem operações</p>
                        ) : (
                          <div className="space-y-2">
                            {operacoesDoDia.map(operacao => (
                              <Link
                                key={operacao.id}
                                href={`/operacoes/${operacao.id}`}
                                className={`block p-3 rounded-lg border-l-4 hover:shadow-md transition ${TIPO_COLORS[operacao.tipo] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-xl">{TIPO_ICONS[operacao.tipo] || '📋'}</span>
                                    <div className="flex-1">
                                      <p className="font-medium">{operacao.tipo}</p>
                                      {operacao.descricao && (
                                        <p className="text-sm opacity-75">{operacao.descricao}</p>
                                      )}
                                      {operacao.parcela && (
                                        <p className="text-xs opacity-60 mt-1">
                                          📍 {operacao.parcela.nome}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {operacao.custoTotal && operacao.custoTotal > 0 && (
                                    <div className="text-right ml-4">
                                      <p className="text-sm font-semibold">{operacao.custoTotal.toFixed(2)}€</p>
                                    </div>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
