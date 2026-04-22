'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateParcela } from '@/hooks/use-parcelas';
import { usePropriedades } from '@/hooks/use-propriedades';
import { Loader2, Save, X, MapPin, Upload, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPreview } from '@/components/MapPreview';
import { MapEditor } from '@/components/MapEditor';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { LoadingState } from '@/components/ui/LoadingState';

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
  'Franco-arenoso', 'Franco-argiloso', 'Arenoso', 'Argiloso', 'Calcário', 'Granítico', 'Xistoso',
];

export default function NovaParcelaPage() {
  const router = useRouter();
  const { data: propriedades, isLoading: isLoadingPropriedades } = usePropriedades();
  const createParcela = useCreateParcela();
  const [uploadedGeometry, setUploadedGeometry] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'geojson' && ext !== 'json' && ext !== 'kml') {
      alert('Formato não suportado. Use GeoJSON ou KML.');
      return;
    }
    try {
      const text = await file.text();
      if (ext === 'kml') { alert('KML em breve. Use GeoJSON.'); return; }
      const geojson = JSON.parse(text);
      let geometry;
      if (geojson.type === 'FeatureCollection' && geojson.features?.[0]) geometry = geojson.features[0].geometry;
      else if (geojson.type === 'Feature') geometry = geojson.geometry;
      else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') geometry = geojson;
      else throw new Error('Tipo não suportado');

      if (geometry.type === 'Polygon' && geometry.coordinates?.[0]?.[0]) {
        const coords = geometry.coordinates[0];
        const lats = coords.map((c: number[]) => c[1]);
        const lngs = coords.map((c: number[]) => c[0]);
        setValue('latitude', (Math.min(...lats) + Math.max(...lats)) / 2);
        setValue('longitude', (Math.min(...lngs) + Math.max(...lngs)) / 2);
      }
      setUploadedGeometry(geometry);
      setUploadedFileName(file.name);
    } catch {
      alert('Erro ao ler ficheiro. Verifica se é um GeoJSON válido.');
    }
  };

  const handleGeometryChange = (geometry: any, area: number) => {
    setDrawnGeometry(geometry);
    if (area > 0) setValue('area', parseFloat(area.toFixed(4)));
  };

  const onSubmit = async (data: ParcelaFormData) => {
    let geometria: any;
    if (drawnGeometry) geometria = drawnGeometry;
    else if (uploadedGeometry) geometria = uploadedGeometry;
    else if (data.latitude && data.longitude) {
      const offset = 0.001;
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
      geometria = { type: 'Polygon', coordinates: [[[-6.7500, 41.7900], [-6.7490, 41.7900], [-6.7490, 41.7890], [-6.7500, 41.7890], [-6.7500, 41.7900]]] };
    }

    try {
      await createParcela.mutateAsync({
        nome: data.nome, area: data.area, altitude: data.altitude,
        tipoSolo: data.tipoSolo, propriedadeId: data.propriedadeId, geometria,
      });
      router.push('/parcelas');
    } catch {
      alert('Erro ao criar parcela. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingPropriedades) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Novo Terreno" subtitle="Criar novo terreno agrícola" />
        <div className="container mx-auto px-4 py-8">
          <LoadingState fullPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Novo Terreno"
        subtitle="Criar novo terreno agrícola"
        actions={
          <Link href="/parcelas">
            <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
          <Card>
            <div className="space-y-5">
              <FormInput
                label="Nome do Talhão *"
                placeholder="Ex: Talhão Norte - Castanheiro"
                error={errors.nome?.message}
                {...register('nome')}
              />

              <FormSelect
                label="Propriedade *"
                error={errors.propriedadeId?.message}
                {...register('propriedadeId')}
              >
                <option value="">Seleciona a propriedade</option>
                {propriedades?.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </FormSelect>

              <FormInput
                label="Área (hectares) *"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 2.5"
                error={errors.area?.message}
                helperText="1 hectare = 10.000 m²"
                {...register('area', { valueAsNumber: true })}
              />

              <FormInput
                label="Altitude (metros)"
                type="number"
                placeholder="Ex: 900"
                {...register('altitude', { valueAsNumber: true })}
              />

              <FormSelect
                label="Tipo de Solo"
                {...register('tipoSolo')}
              >
                <option value="">Seleciona o tipo de solo</option>
                {TIPO_SOLO_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </FormSelect>
            </div>
          </Card>

          {/* Map Editor */}
          <Card>
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Desenhar Geometria do Terreno
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Desenhe o polígono que representa o terreno. A área é calculada automaticamente.
            </p>
            <MapEditor
              initialGeometry={uploadedGeometry || undefined}
              onGeometryChange={handleGeometryChange}
              height="500px"
              center={latitude && longitude ? [longitude, latitude] : undefined}
            />
          </Card>

          {/* File Upload */}
          <Card>
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Importar Geometria (GeoJSON/KML)
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-emerald-500 transition">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {uploadedFileName || 'Escolher ficheiro GeoJSON/KML...'}
                  </span>
                </div>
                <input type="file" accept=".geojson,.json,.kml" onChange={handleFileUpload} className="hidden" />
              </label>
              {uploadedFileName && (
                <button
                  type="button"
                  onClick={() => { setUploadedGeometry(null); setUploadedFileName(''); }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {uploadedFileName && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-800 dark:text-emerald-300">
                  Geometria carregada: <strong>{uploadedFileName}</strong>
                </span>
              </div>
            )}
          </Card>

          {/* Info */}
          <Card variant="colored" color="blue">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Sobre a Geometria do Talhão</p>
                <p className="text-blue-700 dark:text-blue-400">
                  {drawnGeometry ? 'Geometria desenhada no mapa será usada.' :
                   uploadedFileName ? 'Geometria importada do ficheiro será usada.' :
                   'Desenhe a geometria no mapa ou importe um ficheiro GeoJSON/KML.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} icon={<Save className="w-5 h-5" />}>
              {isSubmitting ? 'A guardar...' : 'Criar Talhão'}
            </Button>
            <Link href="/parcelas" className="shrink-0">
              <Button variant="secondary" size="lg">Cancelar</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
