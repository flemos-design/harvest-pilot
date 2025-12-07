'use client';

import { usePropriedade, useDeletePropriedade } from '@/hooks/use-propriedades';
import { Loader2, Building, Edit, Trash2, ArrowLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function PropriedadeDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: propriedade, isLoading, error } = usePropriedade(id);
  const deletePropriedade = useDeletePropriedade();

  const handleDelete = async () => {
    if (!propriedade) return;

    if (confirm(`Tens a certeza que queres eliminar a propriedade "${propriedade.nome}"?`)) {
      try {
        await deletePropriedade.mutateAsync(id);
        router.push('/propriedades');
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

  if (error || !propriedade) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">Propriedade não encontrada</p>
          <Link href="/propriedades" className="mt-4 inline-block text-green-600">← Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/propriedades" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 text-blue-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{propriedade.nome}</h1>
                </div>
                {propriedade.organizacao && (
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {propriedade.organizacao.nome}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/propriedades/${id}/editar`}
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
                  <span className="font-medium text-gray-900">{propriedade.nome}</span>
                </div>
                {propriedade.descricao && (
                  <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-1">Descrição</span>
                    <p className="text-gray-900">{propriedade.descricao}</p>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Organização</span>
                  <span className="font-medium text-gray-900">
                    {propriedade.organizacao?.nome || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Talhões/Terrenos</span>
                  <span className="font-medium text-gray-900">{propriedade._count?.parcelas || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{propriedade._count?.parcelas || 0}</p>
                  <p className="text-xs text-gray-600">Talhões/Terrenos</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href={`/propriedades/${id}/editar`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar Propriedade
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
                  <p className="text-gray-600 mb-1">Criada</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(propriedade.createdAt), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Atualizada</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(propriedade.updatedAt), "d/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
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
