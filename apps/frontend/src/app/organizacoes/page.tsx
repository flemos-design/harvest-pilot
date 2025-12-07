'use client';

import { useOrganizacoes, useOrganizacoesStats, useDeleteOrganizacao } from '@/hooks/use-organizacoes';
import { Loader2, Building2, Plus, Users, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function OrganizacoesPage() {
  const { data: organizacoes, isLoading, error } = useOrganizacoes();
  const { data: stats } = useOrganizacoesStats();
  const deleteOrganizacao = useDeleteOrganizacao();

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tens a certeza que queres eliminar a organização "${nome}"?`)) {
      try {
        await deleteOrganizacao.mutateAsync(id);
      } catch (error) {
        alert('Erro ao eliminar organização');
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar organizações</h2>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organizações</h1>
              <p className="text-gray-600 mt-1">Gestão de organizações e propriedades</p>
            </div>
            <Link
              href="/organizacoes/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova Organização
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Organizações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Propriedades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPropriedades}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Utilizadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUtilizadores}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Média Propriedades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgPropriedadesPorOrganizacao.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organizações List */}
      <main className="container mx-auto px-4 pb-8">
        {!organizacoes || organizacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma organização</h3>
            <p className="text-gray-600 mb-6">Começa por criar a tua primeira organização</p>
            <Link
              href="/organizacoes/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Organização
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizacoes.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">{org.nome}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs">/{org.slug}</code>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Propriedades</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {org._count?.propriedades || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Utilizadores</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {org._count?.utilizadores || 0}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-4">
                    Criada em {format(new Date(org.createdAt), "d 'de' MMM yyyy", { locale: pt })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/organizacoes/${org.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </Link>
                    <Link
                      href={`/organizacoes/${org.id}/editar`}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm inline-flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(org.id, org.nome)}
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
