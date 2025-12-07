'use client';

import { usePropriedades, useDeletePropriedade } from '@/hooks/use-propriedades';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Loader2, Building, Plus, MapPin, Edit, Trash2, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState } from 'react';

export default function PropriedadesPage() {
  const [organizacaoFilter, setOrganizacaoFilter] = useState<string>('');

  const { data: propriedades, isLoading, error } = usePropriedades(organizacaoFilter || undefined);
  const { data: organizacoes } = useOrganizacoes();
  const deletePropriedade = useDeletePropriedade();

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tens a certeza que queres eliminar a propriedade "${nome}"?`)) {
      try {
        await deletePropriedade.mutateAsync(id);
      } catch (error) {
        alert('Erro ao eliminar propriedade');
      }
    }
  };

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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar propriedades</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">Propriedades</h1>
              <p className="text-gray-600 mt-1">Gestão de propriedades e localidades</p>
            </div>
            <Link
              href="/propriedades/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova Propriedade
            </Link>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={organizacaoFilter}
              onChange={(e) => setOrganizacaoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas as organizações</option>
              {organizacoes?.map((org) => (
                <option key={org.id} value={org.id}>{org.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Propriedades List */}
      <main className="container mx-auto px-4 py-8">
        {!propriedades || propriedades.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma propriedade</h3>
            <p className="text-gray-600 mb-6">
              {organizacaoFilter
                ? 'Nenhuma propriedade encontrada para esta organização'
                : 'Começa por criar a tua primeira propriedade'}
            </p>
            <Link
              href="/propriedades/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Propriedade
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propriedades.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">{prop.nome}</h3>
                      </div>
                      {prop.descricao && (
                        <p className="text-sm text-gray-600 mb-3">{prop.descricao}</p>
                      )}
                      {prop.organizacao && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {prop.organizacao.nome}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Talhões/Terrenos</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {prop._count?.parcelas || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-4">
                    Criada em {format(new Date(prop.createdAt), "d 'de' MMM yyyy", { locale: pt })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/propriedades/${prop.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </Link>
                    <Link
                      href={`/propriedades/${prop.id}/editar`}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm inline-flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(prop.id, prop.nome)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
