'use client';

import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, MapPin, TrendingUp, Upload } from 'lucide-react';
import Link from 'next/link';
import { MapThumbnail } from '@/components/MapThumbnail';

export default function ParcelasPage() {
  const { data: parcelas, isLoading, error } = useParcelas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar terrenos</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Certifica-te que o backend está a correr em http://localhost:3001
          </p>
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
              <h1 className="text-3xl font-bold text-gray-900">Terrenos</h1>
              <p className="text-gray-600 mt-1">Gestão de terrenos agrícolas</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/parcelas/nova"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                + Novo Terreno
              </Link>
              <Link
                href="/parcelas/importar"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar KMZ
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                ← Voltar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Terrenos</p>
                <p className="text-2xl font-bold">{parcelas?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Área Total</p>
                <p className="text-2xl font-bold">
                  {parcelas?.reduce((sum, p) => sum + p.area, 0).toFixed(2)} ha
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Com Culturas</p>
                <p className="text-2xl font-bold">
                  {parcelas?.filter((p) => p.culturas && p.culturas.length > 0).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parcelas List */}
        {!parcelas || parcelas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum terreno encontrada
            </h3>
            <p className="text-gray-500">
              Cria a tua primeiro terreno para começar a gerir a tua exploração agrícola.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcelas.map((parcela) => (
              <Link
                key={parcela.id}
                href={`/parcelas/${parcela.id}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition cursor-pointer block overflow-hidden"
              >
                {/* Map Thumbnail */}
                <MapThumbnail geometry={parcela.geometria} height="180px" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{parcela.nome}</h3>
                      {parcela.propriedade && (
                        <p className="text-sm text-gray-500">{parcela.propriedade.nome}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {parcela.area} ha
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {parcela.altitude && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{parcela.altitude}m altitude</span>
                      </div>
                    )}
                    {parcela.tipoSolo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{parcela.tipoSolo}</span>
                      </div>
                    )}
                  </div>

                  {parcela.culturas && parcela.culturas.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">Culturas:</p>
                      <div className="flex flex-wrap gap-2">
                        {parcela.culturas.map((cultura) => (
                          <span
                            key={cultura.id}
                            className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded"
                          >
                            {cultura.especie}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parcela._count && (
                    <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
                      <span>{parcela._count.operacoes} operações</span>
                      <span>{parcela._count.imagensRemotas} imagens</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
