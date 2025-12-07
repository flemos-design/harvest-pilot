'use client';

import { useParcela, useDeleteParcela } from '@/hooks/use-parcelas';
import { useOperacoes } from '@/hooks/use-operacoes';
import { Loader2, MapPin, TrendingUp, Calendar, ArrowLeft, Edit, Sprout, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapSingle } from '@/components/MapSingle';
import { ImagensRemotas } from '@/components/ImagensRemotas';
import { Meteorologia } from '@/components/Meteorologia';
import { parcelaToKmlBlob, parcelaToKmzBlob, sanitizeFileName } from '@/lib/export-geo';

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

export default function ParcelaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [exporting, setExporting] = useState<'kml' | 'kmz' | null>(null);

  const { data: parcela, isLoading: isLoadingParcela, error: parcelaError } = useParcela(id);
  const { data: todasOperacoes, isLoading: isLoadingOperacoes } = useOperacoes();
  const deleteParcela = useDeleteParcela();

  const handleDelete = async () => {
    const confirmacao = confirm(
      `Tens a certeza que queres eliminar o terreno "${parcela?.nome}"?\n\n` +
      'Esta ação não pode ser revertida e irá remover todos os dados associados.'
    );

    if (!confirmacao) return;

    try {
      setIsDeleting(true);
      await deleteParcela.mutateAsync(id);
      router.push('/parcelas');
    } catch (error) {
      console.error('Erro ao eliminar talhão:', error);
      alert('Erro ao eliminar talhão. Tenta novamente.');
      setIsDeleting(false);
    }
  };

  if (isLoadingParcela || isLoadingOperacoes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (parcelaError || !parcela) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar talhão</h2>
          <p className="text-gray-600">{parcelaError ? (parcelaError as Error).message : 'Talhão não encontrado'}</p>
          <Link href="/parcelas" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar aos talhões
          </Link>
        </div>
      </div>
    );
  }

  // Filtrar operações deste talhão
  const operacoesParcela = todasOperacoes?.filter(op => op.parcelaId === id) || [];
  const totalOperacoes = operacoesParcela.length;
  const custoTotal = operacoesParcela.reduce((sum, op) => sum + (op.custoTotal || 0), 0);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportKml = async () => {
    try {
      setExporting('kml');
      const blob = parcelaToKmlBlob(parcela);
      downloadBlob(blob, `${sanitizeFileName(parcela.nome)}.kml`);
    } catch (error) {
      console.error('Erro ao exportar KML', error);
      alert('Erro ao exportar KML. Tenta novamente.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportKmz = async () => {
    try {
      setExporting('kmz');
      const blob = await parcelaToKmzBlob(parcela);
      downloadBlob(blob, `${sanitizeFileName(parcela.nome)}.kmz`);
    } catch (error) {
      console.error('Erro ao exportar KMZ', error);
      alert('Erro ao exportar KMZ. Tenta novamente.');
    } finally {
      setExporting(null);
    }
  };

  // Operações recentes (últimas 10)
  const operacoesRecentes = operacoesParcela
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10);

  // Estatísticas por tipo
  const operacoesPorTipo = operacoesParcela.reduce((acc, op) => {
    acc[op.tipo] = (acc[op.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/parcelas"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{parcela.nome}</h1>
                <p className="text-gray-600 mt-1">Detalhes do terreno</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleExportKml}
                  disabled={exporting !== null}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {exporting === 'kml' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A gerar KML...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar KML
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportKmz}
                  disabled={exporting !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {exporting === 'kmz' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A gerar KMZ...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar KMZ
                    </>
                  )}
                </button>
              </div>
              <Link
                href={`/parcelas/${id}/editar`}
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
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Área</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{parcela.area} ha</p>
            <p className="text-xs text-gray-500 mt-1">{(parcela.area * 10000).toFixed(0)} m²</p>
          </div>

          {parcela.altitude && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Altitude</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{parcela.altitude}m</p>
              <p className="text-xs text-gray-500 mt-1">Nível do mar</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <p className="text-sm text-gray-600 font-medium">Operações</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalOperacoes}</p>
            <p className="text-xs text-gray-500 mt-1">Registos de campo</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sprout className="w-6 h-6 text-amber-600" />
              <p className="text-sm text-gray-600 font-medium">Custo Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{custoTotal.toFixed(2)}€</p>
            <p className="text-xs text-gray-500 mt-1">Todas as operações</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalhes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Propriedade</p>
                  <p className="font-medium text-gray-900">
                    {parcela.propriedade?.nome || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Solo</p>
                  <p className="font-medium text-gray-900">
                    {parcela.tipoSolo || 'Não especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Criada em</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(parcela.createdAt), "d 'de' MMMM, yyyy", { locale: pt })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Última atualização</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(parcela.updatedAt), "d 'de' MMMM, yyyy", { locale: pt })}
                  </p>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Localização
              </h2>
              <MapSingle
                geometry={parcela.geometria}
                parcelName={parcela.nome}
                height="400px"
                showControls={true}
              />
            </div>

            {/* Culturas */}
            {parcela.culturas && parcela.culturas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Culturas</h2>
                <div className="space-y-4">
                  {parcela.culturas.map((cultura) => (
                    <div key={cultura.id} className="border rounded-lg p-4 bg-amber-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{cultura.especie}</h3>
                          {cultura.variedade && (
                            <p className="text-sm text-gray-600 mt-1">Variedade: {cultura.variedade}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                              {cultura.finalidade}
                            </span>
                            {cultura.ciclos && cultura.ciclos.length > 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {cultura.ciclos.length} ciclo(s)
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

            {/* Imagens Remotas / Satélite */}
            <ImagensRemotas parcelaId={id} />

            {/* Meteorologia */}
            <Meteorologia parcelaId={id} />

            {/* Operações Recentes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Operações Recentes</h2>
                <Link
                  href={`/operacoes/nova?parcelaId=${id}`}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Nova Operação
                </Link>
              </div>

              {operacoesRecentes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma operação registada nesto terreno</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {operacoesRecentes.map((operacao) => (
                    <div key={operacao.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{TIPO_ICONS[operacao.tipo] || '📋'}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{operacao.tipo}</p>
                            {operacao.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{operacao.descricao}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>
                                {format(new Date(operacao.data), "d MMM, yyyy", { locale: pt })}
                              </span>
                              {operacao.operador && (
                                <span>Por: {operacao.operador.nome}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {operacao.custoTotal && operacao.custoTotal > 0 && (
                          <span className="text-sm font-medium text-green-600">
                            {operacao.custoTotal.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Estatísticas por Tipo */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Operações por Tipo</h2>
              {Object.keys(operacoesPorTipo).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(operacoesPorTipo)
                    .sort(([, a], [, b]) => b - a)
                    .map(([tipo, count]) => (
                      <div key={tipo} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{TIPO_ICONS[tipo] || '📋'}</span>
                          <span className="text-sm text-gray-700">{tipo}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Geometria Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Geometria</p>
                  <p className="text-blue-800 text-xs">
                    {parcela.geometria ? 'Polígono GeoJSON configurado' : 'Sem geometria definida'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href={`/operacoes/nova?parcelaId=${id}`}
                  className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition text-center"
                >
                  📝 Registar Operação
                </Link>
                <Link
                  href="/operacoes"
                  className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition text-center"
                >
                  📋 Ver Todas Operações
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
