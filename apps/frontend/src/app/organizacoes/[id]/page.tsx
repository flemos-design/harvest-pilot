'use client';

import { useOrganizacao, useDeleteOrganizacao } from '@/hooks/use-organizacoes';
import { Loader2, Building2, Edit, Trash2, ArrowLeft, MapPin, Users, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function OrganizacaoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: organizacao, isLoading, error } = useOrganizacao(id);
  const deleteOrganizacao = useDeleteOrganizacao();

  const handleDelete = async () => {
    if (!organizacao) return;

    if (confirm(`Tens a certeza que queres eliminar a organização "${organizacao.nome}"?\n\nEsta ação não pode ser revertida.`)) {
      try {
        await deleteOrganizacao.mutateAsync(id);
        router.push('/organizacoes');
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

  if (error || !organizacao) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">Organização não encontrada</p>
          <Link href="/organizacoes" className="mt-4 inline-block text-green-600">← Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/organizacoes"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-green-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{organizacao.nome}</h1>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">/{organizacao.slug}</code>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/organizacoes/${id}/editar`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Gerais</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Nome</span>
                  <span className="font-medium text-gray-900">{organizacao.nome}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Slug</span>
                  <code className="font-mono text-sm px-2 py-1 bg-gray-100 rounded">{organizacao.slug}</code>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Propriedades</span>
                  <span className="font-medium text-gray-900">{organizacao._count?.propriedades || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Utilizadores</span>
                  <span className="font-medium text-gray-900">{organizacao._count?.utilizadores || 0}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Criada em</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(organizacao.createdAt), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                  </span>
                </div>
              </div>
            </div>

            {/* Propriedades */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Propriedades
                </h2>
                <span className="text-sm text-gray-600">
                  {organizacao.propriedades?.length || 0} propriedade(s)
                </span>
              </div>

              {!organizacao.propriedades || organizacao.propriedades.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma propriedade associada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {organizacao.propriedades.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{prop.nome}</h3>
                          {prop.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{prop.descricao}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Criada em {format(new Date(prop.createdAt), "d 'de' MMM yyyy", { locale: pt })}
                          </p>
                        </div>
                        <Link
                          href={`/propriedades/${prop.id}`}
                          className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{organizacao._count?.propriedades || 0}</p>
                    <p className="text-xs text-gray-600">Propriedades</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{organizacao._count?.utilizadores || 0}</p>
                    <p className="text-xs text-gray-600">Utilizadores</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href={`/organizacoes/${id}/editar`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar Organização
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informação do Sistema</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">ID</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block font-mono break-all">
                    {organizacao.id}
                  </code>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Criada</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(organizacao.createdAt), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Atualizada</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(organizacao.updatedAt), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
