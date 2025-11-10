'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOperacao } from '@/hooks/use-operacoes';
import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhotoUpload } from '@/components/upload/PhotoUpload';
import type { UploadedImage } from '@/types/upload';

const operacaoSchema = z.object({
  tipo: z.enum(['PLANTACAO', 'REGA', 'ADUBACAO', 'TRATAMENTO', 'COLHEITA', 'INSPECAO', 'PODA', 'DESBASTE']),
  data: z.string().min(1, 'Data é obrigatória'),
  descricao: z.string().optional(),
  parcelaId: z.string().min(1, 'Parcela é obrigatória'),
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

export default function NovaOperacaoPage() {
  const router = useRouter();
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();
  const createOperacao = useCreateOperacao();
  const [useGPS, setUseGPS] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OperacaoFormData>({
    resolver: zodResolver(operacaoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  });

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
      // Convert data to ISO format for API
      const operacaoData = {
        ...data,
        data: new Date(data.data).toISOString(),
        latitude: useGPS ? data.latitude : undefined,
        longitude: useGPS ? data.longitude : undefined,
        fotos: uploadedPhotos.map((photo) => photo.url), // Add photo URLs
      };

      await createOperacao.mutateAsync(operacaoData as any);
      router.push('/operacoes');
    } catch (error) {
      console.error('Erro ao criar operação:', error);
      alert('Erro ao criar operação. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingParcelas) {
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
              <h1 className="text-3xl font-bold text-gray-900">Nova Operação</h1>
              <p className="text-gray-600 mt-1">Registar operação de campo</p>
            </div>
            <Link
              href="/operacoes"
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

            {/* Parcela */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcela *
              </label>
              <select
                {...register('parcelaId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona o terreno</option>
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
                <label className="block text-sm font-medium text-gray-700">
                  Localização GPS
                </label>
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

            {/* Fotos */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Fotografias
              </label>
              <PhotoUpload
                folder="operacoes"
                multiple={true}
                maxFiles={10}
                onUploadComplete={(images) => {
                  if (Array.isArray(images)) {
                    setUploadedPhotos((prev) => [...prev, ...images]);
                  } else {
                    setUploadedPhotos((prev) => [...prev, images]);
                  }
                }}
                onError={(error) => {
                  console.error('Erro ao fazer upload:', error);
                  alert('Erro ao fazer upload das fotos. Tenta novamente.');
                }}
              />
              {uploadedPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadedPhotos.length} foto(s) carregada(s)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.key} className="relative aspect-square">
                        <img
                          src={photo.thumbnail}
                          alt="Preview"
                          className="h-full w-full rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedPhotos((prev) =>
                              prev.filter((p) => p.key !== photo.key)
                            );
                          }}
                          className="absolute right-1 top-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    Guardar Operação
                  </>
                )}
              </button>
              <Link
                href="/operacoes"
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
