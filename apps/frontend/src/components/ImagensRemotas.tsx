'use client';

import { useLatestImagemRemota, useImagensRemotas } from '@/hooks/use-imagens-remotas';
import { Satellite, Cloud, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ImagensRemotasProps {
  parcelaId: string;
}

export function ImagensRemotas({ parcelaId }: ImagensRemotasProps) {
  const { data: latestImage, isLoading: isLoadingLatest } = useLatestImagemRemota(parcelaId);
  const { data: recentImages, isLoading: isLoadingRecent } = useImagensRemotas(parcelaId);

  if (isLoadingLatest && isLoadingRecent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Satellite className="w-5 h-5 text-blue-600" />
          Imagens de Satélite
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!latestImage && !recentImages?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Satellite className="w-5 h-5 text-blue-600" />
          Imagens de Satélite
        </h2>
        <div className="text-center py-8 text-gray-400">
          <Satellite className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma imagem de satélite disponível</p>
        </div>
      </div>
    );
  }

  const getIndexColor = (value: number | null | undefined, type: 'ndvi' | 'ndre' | 'evi') => {
    if (value === null || value === undefined) return 'text-gray-400';

    // NDVI, NDRE, EVI geralmente variam de -1 a 1, mas valores saudáveis são > 0.3
    if (value > 0.6) return 'text-green-600';
    if (value > 0.3) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatIndexValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(3);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Satellite className="w-5 h-5 text-blue-600" />
        Imagens de Satélite
      </h2>

      {latestImage && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">Última Captura</h3>
              <span className="text-xs text-blue-700">
                {format(new Date(latestImage.data), "d 'de' MMMM, yyyy", { locale: pt })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600 mb-1">NDVI</p>
                <p className={`text-2xl font-bold ${getIndexColor(latestImage.ndvi, 'ndvi')}`}>
                  {formatIndexValue(latestImage.ndvi)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Vigor vegetativo</p>
              </div>

              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600 mb-1">NDRE</p>
                <p className={`text-2xl font-bold ${getIndexColor(latestImage.ndre, 'ndre')}`}>
                  {formatIndexValue(latestImage.ndre)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clorofila</p>
              </div>

              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600 mb-1">EVI</p>
                <p className={`text-2xl font-bold ${getIndexColor(latestImage.evi, 'evi')}`}>
                  {formatIndexValue(latestImage.evi)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Vegetação melhorada</p>
              </div>

              <div className="bg-white rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-3 h-3 text-gray-600" />
                  <p className="text-xs text-gray-600">Nuvens</p>
                </div>
                <p className="text-2xl font-bold text-gray-700">
                  {latestImage.nuvens !== null && latestImage.nuvens !== undefined
                    ? `${latestImage.nuvens.toFixed(1)}%`
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Cobertura</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700">
                Fonte: {latestImage.fonte || 'SENTINEL'}
              </span>
              {latestImage.urlImagem && (
                <a
                  href={latestImage.urlImagem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ver imagem
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {recentImages && recentImages.length > 1 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Capturas Recentes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentImages.slice(0, 5).map((image) => (
              <div
                key={image.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {format(new Date(image.data), "dd/MM/yyyy", { locale: pt })}
                    </span>
                    <div className="flex gap-2 text-xs">
                      {image.ndvi !== null && image.ndvi !== undefined && (
                        <span className={getIndexColor(image.ndvi, 'ndvi')}>
                          NDVI: {formatIndexValue(image.ndvi)}
                        </span>
                      )}
                      {image.nuvens !== null && image.nuvens !== undefined && (
                        <span className="text-gray-600">
                          <Cloud className="w-3 h-3 inline mr-1" />
                          {image.nuvens.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
