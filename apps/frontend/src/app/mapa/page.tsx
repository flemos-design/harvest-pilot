'use client';

import { Map } from '@/components/Map';
import { useParcelas } from '@/hooks/use-parcelas';
import { MapPin, Loader2, Layers, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MapaPage() {
  const { data: parcelas, isLoading } = useParcelas();
  const [showLegend, setShowLegend] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">A carregar mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-green-600" />
                Mapa de Terrenos
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize e gerencie todos os seus terrenos com suporte GeoJSON, KML e Shapefile
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition inline-flex items-center gap-2 text-sm font-medium"
              >
                <Layers className="w-4 h-4" />
                {showLegend ? 'Ocultar Legenda' : 'Mostrar Legenda'}
              </button>

              <Link
                href="/parcelas/nova"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 text-sm font-medium"
              >
                <MapPin className="w-4 h-4" />
                Novo Terreno
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Terrenos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcelas?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Área Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcelas?.reduce((sum, p) => sum + p.area, 0).toFixed(2) || 0} ha
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Área Média</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcelas && parcelas.length > 0
                    ? (parcelas.reduce((sum, p) => sum + p.area, 0) / parcelas.length).toFixed(2)
                    : 0}{' '}
                  ha
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Com Geometria</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcelas?.filter(p => p.geometria).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Map */}
          <div className="flex-1">
            <Map height="calc(100vh - 320px)" showControls={true} centerOnParcelas={true} />
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="w-80 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-green-600" />
                  Legenda
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 bg-opacity-40 border-2 border-green-600 rounded"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Terrenos</p>
                      <p className="text-xs text-gray-500">Áreas cultivadas</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Interação</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Clica numo terreno para ver informação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Usa os controlos para zoom e navegação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Arrasta o mapa para mover</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Terrenos List */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Terrenos ({parcelas?.length || 0})
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {parcelas && parcelas.length > 0 ? (
                    parcelas.map(parcela => (
                      <Link
                        key={parcela.id}
                        href={`/parcelas/${parcela.id}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <p className="font-medium text-gray-900 text-sm">{parcela.nome}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-600">{parcela.area} ha</p>
                          {parcela.cultura && (
                            <p className="text-xs text-gray-500">{parcela.cultura}</p>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Sem terrenos registados</p>
                      <Link
                        href="/parcelas/nova"
                        className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block"
                      >
                        Criar primeiro terreno
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ZoomIn className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Dica</h4>
              <p className="text-sm text-blue-700 mt-1">
                Ao criar ou editar terrenos, podes fornecer coordenadas GPS para visualizá-los no mapa.
                As geometrias são geradas automaticamente com base nas coordenadas centrais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
