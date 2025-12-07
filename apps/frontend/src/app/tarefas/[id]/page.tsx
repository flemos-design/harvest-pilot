'use client';

import { useTarefa, useMarkTarefaConcluida, useUpdateTarefaEstado, useDeleteTarefa } from '@/hooks/use-tarefas';
import { Loader2, ArrowLeft, Edit, Trash2, CheckCircle2, Clock, Circle, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { EstadoTarefa } from '@/types';

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
  CANCELADA: 'bg-gray-100 text-gray-800 border-gray-300',
};

const ESTADO_ICONS: Record<EstadoTarefa, any> = {
  PLANEADA: Circle,
  EM_CURSO: Clock,
  CONCLUIDA: CheckCircle2,
  CANCELADA: XCircle,
};

const PRIORIDADE_COLORS: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700',
};

export default function TarefaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingEstado, setIsUpdatingEstado] = useState(false);

  const { data: tarefa, isLoading, error } = useTarefa(id);
  const markConcluida = useMarkTarefaConcluida();
  const updateEstado = useUpdateTarefaEstado();
  const deleteTarefa = useDeleteTarefa();

  const handleMarkConcluida = async () => {
    try {
      setIsUpdatingEstado(true);
      await markConcluida.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error);
      alert('Erro ao marcar tarefa como concluída');
    } finally {
      setIsUpdatingEstado(false);
    }
  };

  const handleEstadoChange = async (novoEstado: EstadoTarefa) => {
    try {
      setIsUpdatingEstado(true);
      await updateEstado.mutateAsync({ id, estado: novoEstado });
    } catch (error) {
      console.error('Erro ao atualizar estado:', error);
      alert('Erro ao atualizar estado da tarefa');
    } finally {
      setIsUpdatingEstado(false);
    }
  };

  const handleDelete = async () => {
    const confirmacao = confirm(
      `Tens a certeza que queres eliminar a tarefa "${tarefa?.titulo}"?\n\nEsta ação não pode ser revertida.`
    );

    if (!confirmacao) return;

    try {
      setIsDeleting(true);
      await deleteTarefa.mutateAsync(id);
      router.push('/tarefas');
    } catch (error) {
      console.error('Erro ao eliminar tarefa:', error);
      alert('Erro ao eliminar tarefa. Tenta novamente.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !tarefa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar tarefa</h2>
          <p className="text-gray-600">{error ? (error as Error).message : 'Tarefa não encontrada'}</p>
          <Link href="/tarefas" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar para tarefas
          </Link>
        </div>
      </div>
    );
  }

  const EstadoIcon = ESTADO_ICONS[tarefa.estado];
  const isAtrasada =
    tarefa.estado !== 'CONCLUIDA' &&
    tarefa.estado !== 'CANCELADA' &&
    new Date(tarefa.dataInicio) < new Date();
  const podeEditar = tarefa.estado !== 'CONCLUIDA' && tarefa.estado !== 'CANCELADA';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tarefas" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{TIPO_ICONS[tarefa.tipo] || '📋'}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{tarefa.titulo}</h1>
                  <p className="text-gray-600 mt-1">Detalhes da tarefa</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {podeEditar && (
                <>
                  <Link
                    href={`/tarefas/${id}/editar`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={handleMarkConcluida}
                    disabled={isUpdatingEstado}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Concluir
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A eliminar...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Alert se atrasada */}
        {isAtrasada && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Tarefa Atrasada</p>
                <p className="text-sm text-red-700">
                  Esta tarefa deveria ter começado em{' '}
                  {format(new Date(tarefa.dataInicio), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição</h2>
              {tarefa.descricao ? (
                <p className="text-gray-700 whitespace-pre-wrap">{tarefa.descricao}</p>
              ) : (
                <p className="text-gray-400 italic">Sem descrição</p>
              )}
            </div>

            {/* Informações */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <span>{TIPO_ICONS[tarefa.tipo]}</span>
                    {tarefa.tipo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prioridade</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${PRIORIDADE_COLORS[tarefa.prioridade]}`}>
                    {tarefa.prioridade}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Início Planeado</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {format(new Date(tarefa.dataInicio), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                  </p>
                </div>
                {tarefa.dataFim && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fim Planeado</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {format(new Date(tarefa.dataFim), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                    </p>
                  </div>
                )}
                {tarefa.dataConclusao && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Data de Conclusão</p>
                    <p className="font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {format(new Date(tarefa.dataConclusao), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Janela Meteo (se disponível) */}
            {tarefa.janelaMeteo && Object.keys(tarefa.janelaMeteo).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Condições Meteorológicas</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {tarefa.janelaMeteo.score && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avaliação Geral</p>
                      <p className="text-2xl font-bold text-green-600">{tarefa.janelaMeteo.score}%</p>
                    </div>
                  )}
                  {tarefa.janelaMeteo.temp && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Temperatura</p>
                      <p className="font-medium text-gray-900">{tarefa.janelaMeteo.temp}°C</p>
                    </div>
                  )}
                  {tarefa.janelaMeteo.chuva !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Probabilidade de Chuva</p>
                      <p className="font-medium text-gray-900">{tarefa.janelaMeteo.chuva}%</p>
                    </div>
                  )}
                  {tarefa.janelaMeteo.vento && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Vento</p>
                      <p className="font-medium text-gray-900">{tarefa.janelaMeteo.vento} km/h</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estado</h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border-2 ${ESTADO_COLORS[tarefa.estado]}`}>
                  <div className="flex items-center gap-2">
                    <EstadoIcon className="w-5 h-5" />
                    <span className="font-semibold">{tarefa.estado.replace('_', ' ')}</span>
                  </div>
                </div>

                {podeEditar && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Alterar estado:</p>
                    {tarefa.estado !== 'EM_CURSO' && (
                      <button
                        onClick={() => handleEstadoChange('EM_CURSO')}
                        disabled={isUpdatingEstado}
                        className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50"
                      >
                        Iniciar Tarefa
                      </button>
                    )}
                    {tarefa.estado !== 'CONCLUIDA' && (
                      <button
                        onClick={() => handleEstadoChange('CONCLUIDA')}
                        disabled={isUpdatingEstado}
                        className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Marcar como Concluída
                      </button>
                    )}
                    <button
                      onClick={() => handleEstadoChange('CANCELADA')}
                      disabled={isUpdatingEstado}
                      className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
                    >
                      Cancelar Tarefa
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/tarefas"
                  className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition text-center"
                >
                  📋 Ver Todas as Tarefas
                </Link>
                <Link
                  href="/tarefas/nova"
                  className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition text-center"
                >
                  ➕ Nova Tarefa
                </Link>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              <p className="mb-1">
                <span className="font-medium">Criada:</span>{' '}
                {format(new Date(tarefa.createdAt), "d MMM, yyyy 'às' HH:mm", { locale: pt })}
              </p>
              <p>
                <span className="font-medium">Atualizada:</span>{' '}
                {format(new Date(tarefa.updatedAt), "d MMM, yyyy 'às' HH:mm", { locale: pt })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
