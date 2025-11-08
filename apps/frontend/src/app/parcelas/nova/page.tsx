'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateParcela } from '@/hooks/use-parcelas';
import { usePropriedades } from '@/hooks/use-propriedades';
import { Loader2, Save, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPreview } from '@/components/MapPreview';

const parcelaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  area: z.number().min(0.01, 'Área deve ser maior que 0'),
  altitude: z.number().optional(),
  tipoSolo: z.string().optional(),
  propriedadeId: z.string().min(1, 'Propriedade é obrigatória'),
  // Coordenadas simples para criar um polígono básico
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

export default function NovaParcelaPage() {
  const router = useRouter();
  const { data: propriedades, isLoading: isLoadingPropriedades } = usePropriedades();
  const createParcela = useCreateParcela();
  const [useGPS, setUseGPS] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
  });

  // Watch coordinates for real-time map preview
  const latitude = watch('latitude');
  const longitude = watch('longitude');

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
      // Criar um polígono simples se temos coordenadas GPS
      let geometria: any = {
        type: 'Polygon',
        coordinates: [[
          [-6.7500, 41.7900], // Default para Espinhosela se não tiver GPS
          [-6.7490, 41.7900],
          [-6.7490, 41.7890],
          [-6.7500, 41.7890],
          [-6.7500, 41.7900],
        ]],
      };

      // Se temos GPS, criar polígono ao redor do ponto
      if (data.latitude && data.longitude) {
        const offset = 0.001; // ~100m
        geometria = {
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

      const parcelaData = {
        nome: data.nome,
        area: data.area,
        altitude: data.altitude,
        tipoSolo: data.tipoSolo,
        propriedadeId: data.propriedadeId,
        geometria: geometria,
      };

      await createParcela.mutateAsync(parcelaData);
      router.push('/parcelas');
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      alert('Erro ao criar parcela. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingPropriedades) {
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
              <h1 className="text-3xl font-bold text-gray-900">Novo Terreno</h1>
              <p className="text-gray-600 mt-1">Criar novo terreno agrícola</p>
            </div>
            <Link
              href="/parcelas"
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
                Nome da Parcela *
              </label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: Parcela Norte - Castanheiro"
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

            {/* GPS Location */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Localização GPS (Centro da Parcela)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: Use para criar automaticamente a geometria do terreno
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

            {/* Map Preview */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Preview da Localização
              </h3>
              <MapPreview
                latitude={latitude}
                longitude={longitude}
                height="350px"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Sobre a Geometria da Parcela</p>
                  <p className="text-blue-700">
                    Por enquanto, a geometria é criada automaticamente como um polígono simples.
                    Em breve poderás desenhar o terreno no mapa ou importar ficheiros GeoJSON/KML.
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
                    Criar Parcela
                  </>
                )}
              </button>
              <Link
                href="/parcelas"
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
