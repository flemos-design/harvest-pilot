'use client';

import { useOperacoes, useDeleteOperacao } from '@/hooks/use-operacoes';
import { Loader2, Calendar, MapPin, User, DollarSign, ArrowLeft, Edit, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhotoGallery } from '@/components/upload/PhotoGallery';
import type { UploadedImage } from '@/types/upload';

const TIPO_ICONS: Record<string, string> = {
  PLANTACAO: '🌱',
  REGA: '💧',
  ADUBACAO: '🌿',
  TRATAMENTO: '🧪',
  COLHEITA: '🌾',
  INSPECAO: '🔍',
  PODA: '✂️',
  DESBASTE: '🪓',
};

const TIPO_COLORS: Record<string, string> = {
  PLANTACAO: 'bg-green-100 text-green-800',
  REGA: 'bg-blue-100 text-blue-800',
  ADUBACAO: 'bg-lime-100 text-lime-800',
  TRATAMENTO: 'bg-purple-100 text-purple-800',
  COLHEITA: 'bg-amber-100 text-amber-800',
  INSPECAO: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  PODA: 'bg-orange-100 text-orange-800',
  DESBASTE: 'bg-red-100 text-red-800',
};

export default function OperacaoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: operacoes, isLoading } = useOperacoes();
  const operacao = operacoes?.find(op => op.id === id);
  const deleteOperacao = useDeleteOperacao();

  const handleDelete = async () => {
    const confirmacao = confirm(
      `Tens a certeza que queres eliminar esta operação de ${operacao?.tipo}?\n\n` +
      'Esta ação não pode ser revertida.'
    );

    if (!confirmacao) return;

    try {
      setIsDeleting(true);
      await deleteOperacao.mutateAsync(id);
      router.push('/operacoes');
    } catch (error) {
      console.error('Erro ao eliminar operação:', error);
      alert('Erro ao eliminar operação. Tenta novamente.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!operacao) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Operação não encontrada</h2>
          <Link href="/operacoes" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar para operações
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/operacoes"
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{TIPO_ICONS[operacao.tipo] || '📋'}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{operacao.tipo}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded ${TIPO_COLORS[operacao.tipo] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {operacao.tipo}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {format(new Date(operacao.data), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/operacoes/${id}/editar`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A eliminar...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            {operacao.descricao && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Descrição</h2>
                <p className="text-gray-700 dark:text-gray-300">{operacao.descricao}</p>
              </div>
            )}

            {/* Detalhes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(operacao.data), "d 'de' MMMM, yyyy 'às' HH:mm", { locale: pt })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo de Operação</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{operacao.tipo}</p>
                </div>
                {operacao.operador && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Operador</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{operacao.operador.nome}</p>
                  </div>
                )}
                {operacao.custoTotal && operacao.custoTotal > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Custo Total</p>
                    <p className="font-medium text-green-600 text-lg">{operacao.custoTotal.toFixed(2)}€</p>
                  </div>
                )}
              </div>
            </div>

            {/* Talhão */}
            {operacao.parcela && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Terreno</h2>
                <Link
                  href={`/parcelas/${operacao.parcela.id}`}
                  className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{operacao.parcela.nome}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{operacao.parcela.area} hectares</p>
                    </div>
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                </Link>
              </div>
            )}

            {/* Localização GPS */}
            {operacao.latitude && operacao.longitude && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Localização GPS</h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Coordenadas registadas no momento da operação:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Latitude</p>
                          <p className="font-mono text-sm font-medium">{operacao.latitude.toFixed(6)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Longitude</p>
                          <p className="font-mono text-sm font-medium">{operacao.longitude.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {operacao.notas && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Notas</h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-gray-300">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{operacao.notas}</p>
                </div>
              </div>
            )}

            {/* Fotos */}
            {operacao.fotos && operacao.fotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Fotografias</h2>
                <PhotoGallery
                  images={operacao.fotos.map((url, idx) => ({
                    key: `foto-${idx}`,
                    url: url,
                    thumbnail: url,
                  }))}
                  readOnly={true}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Data</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {format(new Date(operacao.data), "dd/MM/yyyy", { locale: pt })}
                    </p>
                  </div>
                </div>

                {operacao.operador && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Operador</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{operacao.operador.nome}</p>
                    </div>
                  </div>
                )}

                {operacao.custoTotal && operacao.custoTotal > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Custo</p>
                      <p className="text-sm font-medium text-green-600">{operacao.custoTotal.toFixed(2)}€</p>
                    </div>
                  </div>
                )}

                {operacao.latitude && operacao.longitude && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">GPS</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Localização registada</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insumos */}
            {operacao.insumos && Object.keys(operacao.insumos as object).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Insumos Utilizados</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    {JSON.stringify(operacao.insumos, null, 2)}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <div>
                <span className="font-medium">Criado:</span>{' '}
                {format(new Date(operacao.createdAt), "dd/MM/yyyy HH:mm", { locale: pt })}
              </div>
              <div>
                <span className="font-medium">Atualizado:</span>{' '}
                {format(new Date(operacao.updatedAt), "dd/MM/yyyy HH:mm", { locale: pt })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                {operacao.parcela && (
                  <Link
                    href={`/parcelas/${operacao.parcela.id}`}
                    className="block w-full bg-white dark:bg-gray-800/20 hover:bg-white dark:bg-gray-800/30 backdrop-blur rounded-lg p-3 transition text-center"
                  >
                    🗺️ Ver Talhão
                  </Link>
                )}
                <Link
                  href="/operacoes/nova"
                  className="block w-full bg-white dark:bg-gray-800/20 hover:bg-white dark:bg-gray-800/30 backdrop-blur rounded-lg p-3 transition text-center"
                >
                  📝 Nova Operação
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
