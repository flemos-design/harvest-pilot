'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTarefa, useUpdateTarefa } from '@/hooks/use-tarefas';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const tarefaSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['PLANTACAO', 'COLHEITA', 'TRATAMENTO', 'REGA', 'ADUBACAO', 'PODA', 'INSPECAO', 'OUTRO']),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']),
  estado: z.enum(['PLANEADA', 'EM_CURSO', 'CONCLUIDA', 'CANCELADA']),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().optional(),
});

type TarefaFormData = z.infer<typeof tarefaSchema>;

const TIPO_OPTIONS = [
  { value: 'PLANTACAO', label: 'Plantação 🌱' },
  { value: 'COLHEITA', label: 'Colheita 🌾' },
  { value: 'TRATAMENTO', label: 'Tratamento 🧪' },
  { value: 'REGA', label: 'Rega 💧' },
  { value: 'ADUBACAO', label: 'Adubação 🌿' },
  { value: 'PODA', label: 'Poda ✂️' },
  { value: 'INSPECAO', label: 'Inspeção 🔍' },
  { value: 'OUTRO', label: 'Outro 📋' },
];

const PRIORIDADE_OPTIONS = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

const ESTADO_OPTIONS = [
  { value: 'PLANEADA', label: 'Planeada' },
  { value: 'EM_CURSO', label: 'Em Curso' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export default function EditarTarefaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: tarefa, isLoading: isLoadingTarefa, error } = useTarefa(id);
  const updateTarefa = useUpdateTarefa();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
  });

  const dataInicio = watch('dataInicio');

  // Populate form when tarefa data loads
  useEffect(() => {
    if (tarefa) {
      reset({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        tipo: tarefa.tipo,
        prioridade: tarefa.prioridade,
        estado: tarefa.estado,
        dataInicio: new Date(tarefa.dataInicio).toISOString().slice(0, 16),
        dataFim: tarefa.dataFim ? new Date(tarefa.dataFim).toISOString().slice(0, 16) : '',
      });
    }
  }, [tarefa, reset]);

  const onSubmit = async (data: TarefaFormData) => {
    try {
      // Convert dates to ISO format for API
      const tarefaData = {
        ...data,
        dataInicio: new Date(data.dataInicio).toISOString(),
        dataFim: data.dataFim ? new Date(data.dataFim).toISOString() : undefined,
      };

      await updateTarefa.mutateAsync({ id, data: tarefaData as any });
      router.push(`/tarefas/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingTarefa) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Tarefa</h1>
              <p className="text-gray-600 mt-1">{tarefa.titulo}</p>
            </div>
            <Link
              href={`/tarefas/${id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Tarefa *
              </label>
              <input
                type="text"
                {...register('titulo')}
                placeholder="Ex: Poda de Cerejeiras"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                placeholder="Detalhes sobre a tarefa..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tarefa *
              </label>
              <select
                {...register('tipo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {TIPO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>

            {/* Prioridade e Estado */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade *
                </label>
                <select
                  {...register('prioridade')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {PRIORIDADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.prioridade && (
                  <p className="mt-1 text-sm text-red-600">{errors.prioridade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  {...register('estado')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {ESTADO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>
            </div>

            {/* Datas */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Início *
                </label>
                <input
                  type="datetime-local"
                  {...register('dataInicio')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.dataInicio && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataInicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Fim (opcional)
                </label>
                <input
                  type="datetime-local"
                  {...register('dataFim')}
                  min={dataInicio}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.dataFim && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataFim.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Alterações
                  </>
                )}
              </button>

              <Link
                href={`/tarefas/${id}`}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
