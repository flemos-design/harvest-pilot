'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateParcela } from '@/hooks/use-parcelas';
import { usePropriedades } from '@/hooks/use-propriedades';
import { Loader2, Save, X, MapPin, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPreview } from '@/components/MapPreview';
import { MapEditor } from '@/components/MapEditor';

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
  const [uploadedGeometry, setUploadedGeometry] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'geojson' && fileExtension !== 'json' && fileExtension !== 'kml') {
      alert('Formato de ficheiro não suportado. Use GeoJSON (.geojson, .json) ou KML (.kml)');
      return;
    }

    try {
      const text = await file.text();

      if (fileExtension === 'kml') {
        alert('Suporte para KML será adicionado em breve. Por favor use GeoJSON.');
        return;
      }

      const geojson = JSON.parse(text);

      // Validar estrutura básica do GeoJSON
      if (!geojson.type) {
        throw new Error('Ficheiro GeoJSON inválido');
      }

      // Extrair geometria
      let geometry;
      if (geojson.type === 'FeatureCollection' && geojson.features?.[0]) {
        geometry = geojson.features[0].geometry;
      } else if (geojson.type === 'Feature') {
        geometry = geojson.geometry;
      } else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
        geometry = geojson;
      } else {
        throw new Error('Tipo de geometria não suportado. Use Polygon ou MultiPolygon.');
      }

      // Calcular centro aproximado para preview
      if (geometry.type === 'Polygon' && geometry.coordinates?.[0]?.[0]) {
        const coords = geometry.coordinates[0];
        const lats = coords.map((c: number[]) => c[1]);
        const lngs = coords.map((c: number[]) => c[0]);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        setValue('latitude', centerLat);
        setValue('longitude', centerLng);
        setUseGPS(true);
      }

      setUploadedGeometry(geometry);
      setUploadedFileName(file.name);

      alert(`Ficheiro "${file.name}" carregado com sucesso!`);
    } catch (error) {
      console.error('Erro ao ler ficheiro:', error);
      alert('Erro ao ler ficheiro. Verifica se é um GeoJSON válido.');
    }
  };

  const handleGeometryChange = (geometry: any, area: number) => {
    setDrawnGeometry(geometry);
    setCalculatedArea(area);
    // Auto-fill area if drawn
    if (area > 0) {
      setValue('area', parseFloat(area.toFixed(4)));
    }
  };

  const onSubmit = async (data: ParcelaFormData) => {
    try {
      // Prioridade: 1) Geometria desenhada, 2) Geometria importada, 3) GPS, 4) Default
      let geometria: any;

      if (drawnGeometry) {
        // Usar geometria desenhada no mapa
        geometria = drawnGeometry;
      } else if (uploadedGeometry) {
        // Usar geometria do ficheiro importado
        geometria = uploadedGeometry;
      } else if (data.latitude && data.longitude) {
        // Criar polígono ao redor do ponto GPS
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
      } else {
        // Default para Espinhosela se não tiver GPS nem ficheiro
        geometria = {
          type: 'Polygon',
          coordinates: [[
            [-6.7500, 41.7900],
            [-6.7490, 41.7900],
            [-6.7490, 41.7890],
            [-6.7500, 41.7890],
            [-6.7500, 41.7900],
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

            {/* Map Editor - Draw Geometry */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desenhar Geometria do Terreno
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Desenhe o polígono que representa o terreno. A área é calculada automaticamente.
              </p>
              <MapEditor
                initialGeometry={uploadedGeometry || undefined}
                onGeometryChange={handleGeometryChange}
                height="500px"
                center={latitude && longitude ? [longitude, latitude] : undefined}
              />
            </div>

            {/* File Upload */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importar Geometria (GeoJSON/KML)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Alternativamente, importe um ficheiro GeoJSON ou KML com a geometria (será carregado no editor acima)
              </p>

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadedFileName || 'Escolher ficheiro GeoJSON/KML...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".geojson,.json,.kml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedGeometry(null);
                      setUploadedFileName('');
                    }}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {uploadedFileName && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Geometria carregada: <strong>{uploadedFileName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* GPS Location */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Localização GPS (Centro da Parcela)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedFileName
                      ? 'Centro calculado automaticamente do ficheiro importado'
                      : 'Opcional: Use para criar automaticamente a geometria do terreno'}
                  </p>
                </div>
                {!uploadedFileName && (
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
                )}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Sobre a Geometria da Parcela</p>
                  <p className="text-blue-700">
                    {drawnGeometry
                      ? 'Geometria desenhada no mapa será usada.'
                      : uploadedFileName
                      ? 'Geometria importada do ficheiro será usada.'
                      : useGPS
                      ? 'Polígono será criado ao redor do ponto GPS.'
                      : 'Desenhe a geometria no mapa, importe um ficheiro GeoJSON/KML, ou use GPS para localização.'}
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
