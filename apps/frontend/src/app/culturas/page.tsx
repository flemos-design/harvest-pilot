'use client';

import { useCulturas, useCulturaStats } from '@/hooks/use-culturas';
import { Loader2, Sprout, TreeDeciduous, Axe } from 'lucide-react';
import Link from 'next/link';

export default function CulturasPage() {
  const { data: culturas, isLoading, error } = useCulturas();
  const { data: stats } = useCulturaStats();

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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar culturas</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">Culturas</h1>
              <p className="text-gray-600 mt-1">Presets específicos para a região de Espinhosela - Castanheiro & Cerejeira</p>
            </div>
            <Link
              href="/culturas/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Nova Cultura
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Sprout className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Culturas</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <TreeDeciduous className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Para Fruto</p>
                <p className="text-2xl font-bold">
                  {stats?.porFinalidade.find((f) => f.finalidade === 'FRUTO')?._count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Axe className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Para Madeira</p>
                <p className="text-2xl font-bold">
                  {stats?.porFinalidade.find((f) => f.finalidade === 'MADEIRA')?._count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Culturas List */}
        {!culturas || culturas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma cultura encontrada
            </h3>
            <p className="text-gray-500">
              Cria a tua primeira cultura para começar a gerir as tuas plantações.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturas.map((cultura) => (
              <Link
                key={cultura.id}
                href={`/culturas/${cultura.id}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition cursor-pointer block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {cultura.finalidade === 'FRUTO' ? (
                        <TreeDeciduous className="w-8 h-8 text-green-600" />
                      ) : (
                        <Axe className="w-8 h-8 text-amber-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cultura.especie}</h3>
                        {cultura.variedade && (
                          <p className="text-sm text-gray-500">{cultura.variedade}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        cultura.finalidade === 'FRUTO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cultura.finalidade}
                    </span>
                  </div>

                  {cultura.ciclos && cultura.ciclos.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        {cultura.ciclos.length} {cultura.ciclos.length === 1 ? 'ciclo' : 'ciclos'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cultura.ciclos.slice(0, 3).map((ciclo) => (
                          <span
                            key={ciclo.id}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {ciclo.epoca}
                          </span>
                        ))}
                        {cultura.ciclos.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                            +{cultura.ciclos.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    <p>
                      Criada em {new Date(cultura.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
