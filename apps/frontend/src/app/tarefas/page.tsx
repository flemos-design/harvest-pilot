'use client';

import { useTarefas, useTarefasStats, useUpdateTarefaEstado, useDeleteTarefa } from '@/hooks/use-tarefas';
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle, Plus, Filter, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { EstadoTarefa, PrioridadeTarefa, TipoTarefa } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { FormSelect } from '@/components/ui/FormSelect';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱', COLHEITA: '🌾', TRATAMENTO: '🧪', REGA: '💧',
  ADUBACAO: '🌿', PODA: '✂️', INSPECAO: '🔍', OUTRO: '📋',
};

const ESTADO_CONFIG: Record<EstadoTarefa, { icon: React.ReactNode; variant: 'blue' | 'amber' | 'green' | 'gray' }> = {
  PLANEADA: { icon: <Circle className="w-3 h-3" />, variant: 'blue' },
  EM_CURSO: { icon: <Clock className="w-3 h-3" />, variant: 'amber' },
  CONCLUIDA: { icon: <CheckCircle2 className="w-3 h-3" />, variant: 'green' },
  CANCELADA: { icon: <XCircle className="w-3 h-3" />, variant: 'gray' },
};

const PRIORIDADE_VARIANTS: Record<PrioridadeTarefa, string> = {
  BAIXA: 'slate',
  MEDIA: 'blue',
  ALTA: 'orange',
  URGENTE: 'red',
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
    } catch {
      alert('Erro ao atualizar estado da tarefa');
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tens a certeza que queres eliminar a tarefa "${titulo}"?`)) return;
    try {
      await deleteTarefa.mutateAsync(id);
    } catch {
      alert('Erro ao eliminar tarefa');
    }
  };

  const sortedTarefas = useMemo(() => {
    return [...(tarefas || [])].sort((a, b) => {
      const prioridadeOrder = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
      const prioDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      if (prioDiff !== 0) return prioDiff;
      return new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime();
    });
  }, [tarefas]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Tarefas" subtitle="Planeamento e gestão de atividades agrícolas" />
        <div className="container mx-auto px-4 py-8">
          <LoadingState fullPage />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Tarefas" subtitle="Planeamento e gestão de atividades agrícolas" />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar tarefas</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Tarefas"
        subtitle="Planeamento e gestão de atividades agrícolas"
        actions={
          <Link href="/tarefas/nova">
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Nova Tarefa
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="colored" color="blue">
              <p className="text-sm text-blue-600 font-medium">Planeadas</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {stats.porEstado.find((e: any) => e.estado === 'PLANEADA')?.count || 0}
              </p>
            </Card>
            <Card variant="colored" color="amber">
              <p className="text-sm text-amber-600 font-medium">Em Curso</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                {stats.porEstado.find((e: any) => e.estado === 'EM_CURSO')?.count || 0}
              </p>
            </Card>
            <Card variant="colored" color="green">
              <p className="text-sm text-emerald-600 font-medium">Concluídas</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                {stats.porEstado.find((e: any) => e.estado === 'CONCLUIDA')?.count || 0}
              </p>
            </Card>
            <Card variant="colored" color="red">
              <p className="text-sm text-red-600 font-medium">Atrasadas</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-300">{stats.atrasadasCount || 0}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filtros</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FormSelect
              label="Estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as EstadoTarefa | 'TODAS')}
            >
              <option value="TODAS">Todas</option>
              <option value="PLANEADA">Planeadas</option>
              <option value="EM_CURSO">Em Curso</option>
              <option value="CONCLUIDA">Concluídas</option>
              <option value="CANCELADA">Canceladas</option>
            </FormSelect>
            <FormSelect
              label="Prioridade"
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value as PrioridadeTarefa | 'TODAS')}
            >
              <option value="TODAS">Todas</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </FormSelect>
            <FormSelect
              label="Tipo"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as TipoTarefa | 'TODOS')}
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
            </FormSelect>
          </div>
        </Card>

        {/* Tarefas List */}
        {sortedTarefas.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="w-16 h-16" />}
            title="Nenhuma tarefa encontrada"
            description="Cria a tua primeira tarefa para começar a planear as atividades agrícolas."
            action={{ label: 'Nova Tarefa', href: '/tarefas/nova' }}
          />
        ) : (
          <div className="space-y-4">
            {sortedTarefas.map((tarefa) => {
              const estadoConfig = ESTADO_CONFIG[tarefa.estado];
              const isAtrasada =
                tarefa.estado !== 'CONCLUIDA' &&
                tarefa.estado !== 'CANCELADA' &&
                new Date(tarefa.dataInicio) < new Date();

              return (
                <Card key={tarefa.id} className={`border-l-4 ${isAtrasada ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <span className="text-3xl shrink-0">{TIPO_ICONS[tarefa.tipo] || '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/tarefas/${tarefa.id}`}
                          className="text-xl font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition"
                        >
                          {tarefa.titulo}
                        </Link>

                        {tarefa.descricao && (
                          <p className="text-slate-600 dark:text-slate-400 mb-3">{tarefa.descricao}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant={estadoConfig.variant} size="sm" className="inline-flex items-center gap-1">
                            {estadoConfig.icon}
                            {tarefa.estado.replace('_', ' ')}
                          </Badge>
                          <Badge variant={PRIORIDADE_VARIANTS[tarefa.prioridade] as any} size="sm">
                            {tarefa.prioridade}
                          </Badge>
                          <Badge variant="slate" size="sm">{tarefa.tipo}</Badge>
                          {isAtrasada && <Badge variant="red" size="sm">⚠️ Atrasada</Badge>}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>
                            <span className="font-medium">Início:</span>{' '}
                            {format(new Date(tarefa.dataInicio), "d MMM 'às' HH:mm", { locale: pt })}
                          </div>
                          {tarefa.dataFim && (
                            <div>
                              <span className="font-medium">Fim:</span>{' '}
                              {format(new Date(tarefa.dataFim), "d MMM 'às' HH:mm", { locale: pt })}
                            </div>
                          )}
                          {tarefa.dataConclusao && (
                            <div className="text-emerald-600">
                              <span className="font-medium">Concluída:</span>{' '}
                              {format(new Date(tarefa.dataConclusao), "d MMM 'às' HH:mm", { locale: pt })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/tarefas/${tarefa.id}`}>
                        <Button variant="secondary" size="sm">Ver</Button>
                      </Link>
                      {tarefa.estado !== 'CONCLUIDA' && tarefa.estado !== 'CANCELADA' && (
                        <>
                          <Link href={`/tarefas/${tarefa.id}/editar`}>
                            <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />}>Editar</Button>
                          </Link>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEstadoChange(tarefa.id, 'CONCLUIDA')}
                          >
                            ✓ Concluir
                          </Button>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3 h-3" />}
                        onClick={() => handleDelete(tarefa.id, tarefa.titulo)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
