'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOperacao, useUpdateOperacao } from '@/hooks/use-operacoes';
import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const operacaoSchema = z.object({
  tipo: z.enum(['PLANTACAO', 'REGA', 'ADUBACAO', 'TRATAMENTO', 'COLHEITA', 'INSPECAO', 'PODA', 'DESBASTE']),
  data: z.string().min(1, 'Data é obrigatória'),
  descricao: z.string().optional(),
  parcelaId: z.string().min(1, 'Talhão é obrigatório'),
  operadorId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notas: z.string().optional(),
  custoTotal: z.number().min(0).optional(),
});

type OperacaoFormData = z.infer<typeof operacaoSchema>;

const TIPO_OPTIONS = [
  { value: 'PLANTACAO', label: 'Plantação 🌱' },
  { value: 'REGA', label: 'Rega 💧' },
  { value: 'ADUBACAO', label: 'Adubação 🌿' },
  { value: 'TRATAMENTO', label: 'Tratamento 🧪' },
  { value: 'COLHEITA', label: 'Colheita 🌾' },
  { value: 'INSPECAO', label: 'Inspeção 🔍' },
  { value: 'PODA', label: 'Poda ✂️' },
  { value: 'DESBASTE', label: 'Desbaste 🪓' },
];

export default function EditarOperacaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: operacao, isLoading: isLoadingOperacao, error: operacaoError } = useOperacao(id);
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();
  const updateOperacao = useUpdateOperacao();
  const [useGPS, setUseGPS] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OperacaoFormData>({
    resolver: zodResolver(operacaoSchema),
  });

  // Pre-populate form when operacao data is loaded
  useEffect(() => {
    if (operacao) {
      // Format date for input[type="date"]
      const dateStr = new Date(operacao.data).toISOString().split('T')[0];

      reset({
        tipo: operacao.tipo as any,
        data: dateStr,
        descricao: operacao.descricao || undefined,
        parcelaId: operacao.parcelaId,
        operadorId: operacao.operadorId || undefined,
        notas: operacao.notas || undefined,
        custoTotal: operacao.custoTotal || undefined,
      });

      // Show GPS if operacao had coordinates
      if (operacao.latitude && operacao.longitude) {
        setUseGPS(true);
        setValue('latitude', operacao.latitude);
        setValue('longitude', operacao.longitude);
      }
    }
  }, [operacao, reset, setValue]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada neste navegador');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
        setUseGPS(true);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('Erro ao obter localização. Verifica as permissões do navegador.');
        setGettingLocation(false);
      }
    );
  };

  const onSubmit = async (data: OperacaoFormData) => {
    try {
      const updateData: any = {
        tipo: data.tipo,
        data: new Date(data.data).toISOString(),
        descricao: data.descricao,
        parcelaId: data.parcelaId,
        operadorId: data.operadorId,
        notas: data.notas,
        custoTotal: data.custoTotal,
      };

      // Include GPS if available
      if (useGPS) {
        updateData.latitude = data.latitude;
        updateData.longitude = data.longitude;
      }

      await updateOperacao.mutateAsync({ id, data: updateData });
      router.push(`/operacoes/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar operação:', error);
      alert('Erro ao atualizar operação. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingOperacao || isLoadingParcelas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (operacaoError || !operacao) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar operação</h2>
          <p className="text-gray-600">{operacaoError ? (operacaoError as Error).message : 'Operação não encontrada'}</p>
          <Link href="/operacoes" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar para operações
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Operação</h1>
              <p className="text-gray-600 mt-1">{operacao.tipo}</p>
            </div>
            <Link
              href={`/operacoes/${id}`}
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
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Operação *
              </label>
              <select
                {...register('tipo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona o tipo</option>
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

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                {...register('data')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.data && (
                <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
              )}
            </div>

            {/* Talhão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talhão *
              </label>
              <select
                {...register('parcelaId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona o talhão</option>
                {parcelas?.map((parcela) => (
                  <option key={parcela.id} value={parcela.id}>
                    {parcela.nome} ({parcela.area} ha)
                  </option>
                ))}
              </select>
              {errors.parcelaId && (
                <p className="mt-1 text-sm text-red-600">{errors.parcelaId.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                {...register('descricao')}
                placeholder="Breve descrição da operação"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* GPS Location */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Atualizar Localização GPS
                  </label>
                  {operacao.latitude && operacao.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Localização atual: {operacao.latitude.toFixed(5)}, {operacao.longitude.toFixed(5)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 inline animate-spin mr-1" />
                      A obter...
                    </>
                  ) : (
                    '📍 Usar GPS Atual'
                  )}
                </button>
              </div>

              {useGPS && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register('latitude', { valueAsNumber: true })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register('longitude', { valueAsNumber: true })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo Total (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('custoTotal', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                {...register('notas')}
                rows={4}
                placeholder="Observações adicionais..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
                href={`/operacoes/${id}`}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium inline-flex items-center justify-center"
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
