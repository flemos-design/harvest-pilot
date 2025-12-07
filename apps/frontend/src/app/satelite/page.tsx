'use client';

import { useImagensRemotas } from '@/hooks/use-imagens-remotas';
import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, Satellite, Cloud, TrendingUp, Filter, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function SateliteGaleriaPage() {
  const [parcelaFilter, setParcelaFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'data' | 'ndvi' | 'nuvens'>('data');

  const { data: todasImagens, isLoading, error } = useImagensRemotas();
  const { data: parcelas } = useParcelas();

  const imagensFiltradas = useMemo(() => {
    if (!todasImagens) return [];

    let filtered = todasImagens;

    if (parcelaFilter) {
      filtered = filtered.filter((img: any) => img.parcelaId === parcelaFilter);
    }

    // Ordenação
    return [...filtered].sort((a: any, b: any) => {
      if (sortBy === 'data') {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      } else if (sortBy === 'ndvi') {
        return (b.ndvi || 0) - (a.ndvi || 0);
      } else if (sortBy === 'nuvens') {
        return (a.nuvens || 0) - (b.nuvens || 0);
      }
      return 0;
    });
  }, [todasImagens, parcelaFilter, sortBy]);

  const stats = useMemo(() => {
    if (!todasImagens) return { total: 0, parcelas: 0, mediaQualidade: 0 };

    const parcelasUnicas = new Set(todasImagens.map((img: any) => img.parcelaId)).size;
    const imagensComQualidade = todasImagens.filter((img: any) => img.nuvens !== null && img.nuvens !== undefined);
    const mediaQualidade = imagensComQualidade.length > 0
      ? imagensComQualidade.reduce((sum: number, img: any) => sum + (100 - (img.nuvens || 0)), 0) / imagensComQualidade.length
      : 0;

    return {
      total: todasImagens.length,
      parcelas: parcelasUnicas,
      mediaQualidade: Math.round(mediaQualidade),
    };
  }, [todasImagens]);

  const getIndexColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'text-gray-400';
    if (value > 0.6) return 'text-green-600';
    if (value > 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCloudColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'text-gray-400';
    if (value < 20) return 'text-green-600';
    if (value < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Satellite className="w-8 h-8 text-blue-600" />
                Galeria de Satélite
              </h1>
              <p className="text-gray-600 mt-1">Visualização de imagens remotas de todos os terrenos</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={parcelaFilter}
                onChange={(e) => setParcelaFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os terrenos</option>
                {parcelas?.map((parcela: any) => (
                  <option key={parcela.id} value={parcela.id}>
                    {parcela.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="data">Data (mais recente)</option>
                <option value="ndvi">NDVI (maior)</option>
                <option value="nuvens">Qualidade (menos nuvens)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Imagens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terrenos Cobertos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.parcelas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Qualidade Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mediaQualidade}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <main className="container mx-auto px-4 pb-8">
        {!imagensFiltradas || imagensFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Satellite className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma imagem disponível</h3>
            <p className="text-gray-600">
              {parcelaFilter
                ? 'Nenhuma imagem encontrada para este terreno'
                : 'Ainda não há imagens de satélite no sistema'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {imagensFiltradas.map((imagem: any) => (
              <div
                key={imagem.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition overflow-hidden"
              >
                {/* Image Preview */}
                {imagem.urlImagem ? (
                  <div className="relative h-48 bg-gray-900">
                    <img
                      src={imagem.urlImagem}
                      alt={`Imagem de ${format(new Date(imagem.data), "d/MM/yyyy")}`}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(imagem.data), "d/MM/yy")}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <Satellite className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Parcela */}
                  <div className="mb-3">
                    <Link
                      href={`/parcelas/${imagem.parcelaId}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      {imagem.parcela?.nome || 'Terreno'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(imagem.data), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </p>
                  </div>

                  {/* Indices */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">NDVI</span>
                      </div>
                      <p className={`text-lg font-bold ${getIndexColor(imagem.ndvi)}`}>
                        {imagem.ndvi !== null && imagem.ndvi !== undefined ? imagem.ndvi.toFixed(2) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">NDRE</span>
                      </div>
                      <p className={`text-lg font-bold ${getIndexColor(imagem.ndre)}`}>
                        {imagem.ndre !== null && imagem.ndre !== undefined ? imagem.ndre.toFixed(2) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">EVI</span>
                      </div>
                      <p className={`text-lg font-bold ${getIndexColor(imagem.evi)}`}>
                        {imagem.evi !== null && imagem.evi !== undefined ? imagem.evi.toFixed(2) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Cloud className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">Nuvens</span>
                      </div>
                      <p className={`text-lg font-bold ${getCloudColor(imagem.nuvens)}`}>
                        {imagem.nuvens !== null && imagem.nuvens !== undefined ? `${imagem.nuvens}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  {imagem.fonte && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Fonte: <span className="font-medium text-gray-700">{imagem.fonte}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
