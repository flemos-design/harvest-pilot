'use client';

import { useTarefas, useTarefasStats, useUpdateTarefaEstado, useDeleteTarefa } from '@/hooks/use-tarefas';
import { Loader2, CheckCircle2, Circle, Clock, XCircle, AlertCircle, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { EstadoTarefa, PrioridadeTarefa, TipoTarefa } from '@/types';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱',
  COLHEITA: '🌾',
  TRATAMENTO: '🧪',
  REGA: '💧',
  ADUBACAO: '🌿',
  PODA: '✂️',
  INSPECAO: '🔍',
  OUTRO: '📋',
};

const ESTADO_COLORS: Record<EstadoTarefa, string> = {
  PLANEADA: 'bg-blue-100 text-blue-800 border-blue-300',
  EM_CURSO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONCLUIDA: 'bg-green-100 text-green-800 border-green-300',
  CANCELADA: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300',
};

const PRIORIDADE_COLORS: Record<PrioridadeTarefa, string> = {
  BAIXA: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700',
};

const ESTADO_ICONS: Record<EstadoTarefa, any> = {
  PLANEADA: Circle,
  EM_CURSO: Clock,
  CONCLUIDA: CheckCircle2,
  CANCELADA: XCircle,
};

export default function TarefasPage() {
  const [filterEstado, setFilterEstado] = useState<EstadoTarefa | 'TODAS'>('TODAS');
  const [filterPrioridade, setFilterPrioridade] = useState<PrioridadeTarefa | 'TODAS'>('TODAS');
  const [filterTipo, setFilterTipo] = useState<TipoTarefa | 'TODOS'>('TODOS');

  const filters = {
    ...(filterEstado !== 'TODAS' && { estado: filterEstado }),
    ...(filterPrioridade !== 'TODAS' && { prioridade: filterPrioridade }),
    ...(filterTipo !== 'TODOS' && { tipo: filterTipo }),
  };

  const { data: tarefas, isLoading, error } = useTarefas(filters);
  const { data: stats } = useTarefasStats();
  const updateEstado = useUpdateTarefaEstado();
  const deleteTarefa = useDeleteTarefa();

  const handleEstadoChange = async (id: string, novoEstado: EstadoTarefa) => {
    try {
      await updateEstado.mutateAsync({ id, estado: novoEstado });
    } catch (error) {
      console.error('Erro ao atualizar estado:', error);
      alert('Erro ao atualizar estado da tarefa');
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    const confirmacao = confirm(`Tens a certeza que queres eliminar a tarefa "${titulo}"?`);
    if (!confirmacao) return;

    try {
      await deleteTarefa.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao eliminar tarefa:', error);
      alert('Erro ao eliminar tarefa');
    }
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar tarefas</h2>
          <p className="text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
        </div>
      </div>
    );
  }

  const sortedTarefas = useMemo(() => {
    return [...(tarefas || [])].sort((a, b) => {
      // Prioridade: Urgente > Alta > Média > Baixa
      const prioridadeOrder = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
      const prioDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      if (prioDiff !== 0) return prioDiff;

      // Por data de início
      return new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime();
    });
  }, [tarefas]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tarefas</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Planeamento e gestão de atividades agrícolas</p>
            </div>
            <Link
              href="/tarefas/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Planeadas</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.porEstado.find(e => e.estado === 'PLANEADA')?.count || 0}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-600 font-medium">Em Curso</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.porEstado.find(e => e.estado === 'EM_CURSO')?.count || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-600 font-medium">Concluídas</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.porEstado.find(e => e.estado === 'CONCLUIDA')?.count || 0}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600 font-medium">Atrasadas</p>
                <p className="text-2xl font-bold text-red-900">{stats.atrasadasCount || 0}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtros</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as EstadoTarefa | 'TODAS')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="TODAS">Todas</option>
                <option value="PLANEADA">Planeadas</option>
                <option value="EM_CURSO">Em Curso</option>
                <option value="CONCLUIDA">Concluídas</option>
                <option value="CANCELADA">Canceladas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Prioridade</label>
              <select
                value={filterPrioridade}
                onChange={(e) => setFilterPrioridade(e.target.value as PrioridadeTarefa | 'TODAS')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="TODAS">Todas</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as TipoTarefa | 'TODOS')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="TODOS">Todos</option>
                <option value="PLANTACAO">🌱 Plantação</option>
                <option value="COLHEITA">🌾 Colheita</option>
                <option value="TRATAMENTO">🧪 Tratamento</option>
                <option value="REGA">💧 Rega</option>
                <option value="ADUBACAO">🌿 Adubação</option>
                <option value="PODA">✂️ Poda</option>
                <option value="INSPECAO">🔍 Inspeção</option>
                <option value="OUTRO">📋 Outro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tarefas List */}
      <main className="container mx-auto px-4 pb-8">
        {sortedTarefas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma tarefa encontrada</p>
            <Link
              href="/tarefas/nova"
              className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              + Criar primeira tarefa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTarefas.map((tarefa) => {
              const EstadoIcon = ESTADO_ICONS[tarefa.estado];
              const isAtrasada =
                tarefa.estado !== 'CONCLUIDA' &&
                tarefa.estado !== 'CANCELADA' &&
                new Date(tarefa.dataInicio) < new Date();

              return (
                <div
                  key={tarefa.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition ${
                    isAtrasada ? 'border-red-500' : 'border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <span className="text-3xl">{TIPO_ICONS[tarefa.tipo] || '📋'}</span>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <Link
                            href={`/tarefas/${tarefa.id}`}
                            className="text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600"
                          >
                            {tarefa.titulo}
                          </Link>
                        </div>

                        {tarefa.descricao && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{tarefa.descricao}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {/* Estado */}
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1 ${
                              ESTADO_COLORS[tarefa.estado]
                            }`}
                          >
                            <EstadoIcon className="w-3 h-3" />
                            {tarefa.estado.replace('_', ' ')}
                          </span>

                          {/* Prioridade */}
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              PRIORIDADE_COLORS[tarefa.prioridade]
                            }`}
                          >
                            {tarefa.prioridade}
                          </span>

                          {/* Tipo */}
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {tarefa.tipo}
                          </span>

                          {isAtrasada && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              ⚠️ Atrasada
                            </span>
                          )}
                        </div>

                        {/* Datas */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Início:</span>{' '}
                            {format(new Date(tarefa.dataInicio), "d MMM 'às' HH:mm", {
                              locale: pt,
                            })}
                          </div>
                          {tarefa.dataFim && (
                            <div>
                              <span className="font-medium">Fim:</span>{' '}
                              {format(new Date(tarefa.dataFim), "d MMM 'às' HH:mm", {
                                locale: pt,
                              })}
                            </div>
                          )}
                          {tarefa.dataConclusao && (
                            <div className="text-green-600">
                              <span className="font-medium">Concluída:</span>{' '}
                              {format(new Date(tarefa.dataConclusao), "d MMM 'às' HH:mm", {
                                locale: pt,
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Link
                        href={`/tarefas/${tarefa.id}`}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
                      >
                        Ver
                      </Link>
                      {tarefa.estado !== 'CONCLUIDA' && tarefa.estado !== 'CANCELADA' && (
                        <>
                          <Link
                            href={`/tarefas/${tarefa.id}/editar`}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition text-center"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleEstadoChange(tarefa.id, 'CONCLUIDA')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            ✓ Concluir
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(tarefa.id, tarefa.titulo)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
