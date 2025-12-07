'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParcela, useUpdateParcela } from '@/hooks/use-parcelas';
import { usePropriedades } from '@/hooks/use-propriedades';
import { Loader2, Save, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapSingle } from '@/components/MapSingle';

const parcelaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  area: z.number().min(0.01, 'Área deve ser maior que 0'),
  altitude: z.number().optional(),
  tipoSolo: z.string().optional(),
  propriedadeId: z.string().min(1, 'Propriedade é obrigatória'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ParcelaFormData = z.infer<typeof parcelaSchema>;

const TIPO_SOLO_OPTIONS = [
  'Franco-arenoso',
  'Franco-argiloso',
  'Arenoso',
  'Argiloso',
  'Calcário',
  'Granítico',
  'Xistoso',
];

export default function EditarParcelaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: parcela, isLoading: isLoadingParcela, error: parcelaError } = useParcela(id);
  const { data: propriedades, isLoading: isLoadingPropriedades } = usePropriedades();
  const updateParcela = useUpdateParcela();
  const [useGPS, setUseGPS] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
  });

  // Pre-populate form when parcela data is loaded
  useEffect(() => {
    if (parcela) {
      reset({
        nome: parcela.nome,
        area: parcela.area,
        altitude: parcela.altitude || undefined,
        tipoSolo: parcela.tipoSolo || undefined,
        propriedadeId: parcela.propriedadeId,
      });
    }
  }, [parcela, reset]);

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

  const onSubmit = async (data: ParcelaFormData) => {
    try {
      const updateData: any = {
        nome: data.nome,
        area: data.area,
        altitude: data.altitude,
        tipoSolo: data.tipoSolo,
        propriedadeId: data.propriedadeId,
      };

      // Se temos GPS, atualizar geometria
      if (data.latitude && data.longitude) {
        const offset = 0.001; // ~100m
        updateData.geometria = {
          type: 'Polygon',
          coordinates: [[
            [data.longitude - offset, data.latitude + offset],
            [data.longitude + offset, data.latitude + offset],
            [data.longitude + offset, data.latitude - offset],
            [data.longitude - offset, data.latitude - offset],
            [data.longitude - offset, data.latitude + offset],
          ]],
        };
      }

      await updateParcela.mutateAsync({ id, data: updateData });
      router.push(`/parcelas/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar talhão:', error);
      alert('Erro ao atualizar talhão. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingParcela || isLoadingPropriedades) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (parcelaError || !parcela) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar talhão</h2>
          <p className="text-gray-600">{parcelaError ? (parcelaError as Error).message : 'Talhão não encontrado'}</p>
          <Link href="/parcelas" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar aos talhões
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Terreno</h1>
              <p className="text-gray-600 mt-1">{parcela.nome}</p>
            </div>
            <Link
              href={`/parcelas/${id}`}
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
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Talhão *
              </label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: Talhão Norte - Castanheiro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Propriedade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propriedade *
              </label>
              <select
                {...register('propriedadeId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona a propriedade</option>
                {propriedades?.map((propriedade) => (
                  <option key={propriedade.id} value={propriedade.id}>
                    {propriedade.nome}
                  </option>
                ))}
              </select>
              {errors.propriedadeId && (
                <p className="mt-1 text-sm text-red-600">{errors.propriedadeId.message}</p>
              )}
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área (hectares) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('area', { valueAsNumber: true })}
                placeholder="Ex: 2.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">1 hectare = 10.000 m²</p>
            </div>

            {/* Altitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altitude (metros)
              </label>
              <input
                type="number"
                step="1"
                {...register('altitude', { valueAsNumber: true })}
                placeholder="Ex: 900"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Tipo de Solo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Solo
              </label>
              <select
                {...register('tipoSolo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona o tipo de solo</option>
                {TIPO_SOLO_OPTIONS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Preview */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Localização Atual
              </h3>
              <MapSingle
                geometry={parcela.geometria}
                parcelName={parcela.nome}
                height="300px"
                showControls={false}
              />
            </div>

            {/* GPS Location */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Atualizar Localização GPS
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: Atualiza o centro do terreno e regenera a geometria
                  </p>
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
                    <>
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Usar GPS
                    </>
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

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Sobre Geometria</p>
                  <p className="text-amber-700">
                    A geometria existente será mantida a não ser que captures uma nova localização GPS.
                    Em breve poderás desenhar o terreno no mapa.
                  </p>
                </div>
              </div>
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
                href={`/parcelas/${id}`}
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
