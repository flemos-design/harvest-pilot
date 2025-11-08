'use client';

import {
  useInsumos,
  useInsumosStats,
  useLowStockInsumos,
  useExpiringSoonInsumos,
  useAdjustStock,
  useDeleteInsumo,
} from '@/hooks/use-insumos';
import { Loader2, Package, TrendingDown, AlertTriangle, Plus, Filter, DollarSign, Box } from 'lucide-react';
import Link from 'next/link';
import { format, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

const CATEGORIA_ICONS: Record<string, string> = {
  FERTILIZANTE: '🌿',
  FITOFARMACO: '🧪',
  SEMENTE: '🌱',
  OUTRO: '📦',
};

const CATEGORIA_COLORS: Record<string, string> = {
  FERTILIZANTE: 'bg-green-100 text-green-800',
  FITOFARMACO: 'bg-purple-100 text-purple-800',
  SEMENTE: 'bg-yellow-100 text-yellow-800',
  OUTRO: 'bg-gray-100 text-gray-800',
};

export default function InsumosPage() {
  const [filterCategoria, setFilterCategoria] = useState<string>('TODOS');
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [showExpiringAlert, setShowExpiringAlert] = useState(false);

  const { data: insumos, isLoading, error } = useInsumos(
    filterCategoria !== 'TODOS' ? filterCategoria : undefined
  );
  const { data: stats } = useInsumosStats();
  const { data: lowStock } = useLowStockInsumos();
  const { data: expiringSoon } = useExpiringSoonInsumos(30);
  const adjustStock = useAdjustStock();
  const deleteInsumo = useDeleteInsumo();

  const handleAdjustStock = async (id: string, nome: string) => {
    const quantidadeStr = prompt(`Ajustar stock de "${nome}":\n\nIntroduz a quantidade (positiva para adicionar, negativa para remover):`);
    if (!quantidadeStr) return;

    const quantidade = parseFloat(quantidadeStr);
    if (isNaN(quantidade)) {
      alert('Quantidade inválida');
      return;
    }

    try {
      await adjustStock.mutateAsync({ id, quantidade });
    } catch (error) {
      console.error('Erro ao ajustar stock:', error);
      alert('Erro ao ajustar stock');
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    const confirmacao = confirm(`Tens a certeza que queres eliminar "${nome}"?`);
    if (!confirmacao) return;

    try {
      await deleteInsumo.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao eliminar insumo:', error);
      alert('Erro ao eliminar insumo');
    }
  };

  const getStockStatus = (insumo: any) => {
    if (!insumo.stockMinimo) return null;
    if (insumo.stock === 0) return 'empty';
    if (insumo.stock <= insumo.stockMinimo) return 'low';
    return 'ok';
  };

  const getValidadeStatus = (validade?: string) => {
    if (!validade) return null;
    const dias = differenceInDays(new Date(validade), new Date());
    if (dias < 0) return 'expired';
    if (dias <= 30) return 'expiring';
    return 'ok';
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar insumos</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const alertsCount = (lowStock?.length || 0) + (expiringSoon?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insumos</h1>
              <p className="text-gray-600 mt-1">Gestão de inventário e stock</p>
            </div>
            <Link
              href="/insumos/novo"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Novo Insumo
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Insumos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor em Stock</p>
                    <p className="text-2xl font-bold text-green-600">{stats.valorTotal?.toFixed(2) || 0}€</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock Baixo</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStock?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">A Expirar (30d)</p>
                    <p className="text-2xl font-bold text-red-600">{expiringSoon?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Alerts */}
      {alertsCount > 0 && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Alertas de Inventário</h3>
                <div className="mt-2 space-y-2">
                  {(lowStock?.length || 0) > 0 && (
                    <button
                      onClick={() => setShowStockAlert(!showStockAlert)}
                      className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                    >
                      {lowStock?.length} insumo(s) com stock baixo
                    </button>
                  )}
                  {(expiringSoon?.length || 0) > 0 && (
                    <button
                      onClick={() => setShowExpiringAlert(!showExpiringAlert)}
                      className="text-sm text-yellow-800 hover:text-yellow-900 underline ml-4"
                    >
                      {expiringSoon?.length} insumo(s) a expirar em 30 dias
                    </button>
                  )}
                </div>

                {showStockAlert && lowStock && lowStock.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-sm mb-2">Stock Baixo:</h4>
                    <ul className="space-y-1 text-sm">
                      {lowStock.map((insumo: any) => (
                        <li key={insumo.id} className="flex justify-between">
                          <Link href={`/insumos/${insumo.id}`} className="text-blue-600 hover:underline">
                            {insumo.nome}
                          </Link>
                          <span className="text-red-600 font-medium">
                            {insumo.stock} {insumo.unidade} (mín: {insumo.stockMinimo})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showExpiringAlert && expiringSoon && expiringSoon.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-sm mb-2">A Expirar:</h4>
                    <ul className="space-y-1 text-sm">
                      {expiringSoon.map((insumo: any) => (
                        <li key={insumo.id} className="flex justify-between">
                          <Link href={`/insumos/${insumo.id}`} className="text-blue-600 hover:underline">
                            {insumo.nome}
                          </Link>
                          <span className="text-red-600 font-medium">
                            {format(new Date(insumo.validade), "d 'de' MMM, yyyy", { locale: ptBR })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategoria('TODOS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterCategoria === 'TODOS'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {Object.keys(CATEGORIA_ICONS).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategoria(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterCategoria === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {CATEGORIA_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Insumos List */}
      <main className="container mx-auto px-4 pb-8">
        {!insumos || insumos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum insumo encontrado</p>
            <Link
              href="/insumos/novo"
              className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              + Criar primeiro insumo
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insumos.map((insumo: any) => {
              const stockStatus = getStockStatus(insumo);
              const validadeStatus = getValidadeStatus(insumo.validade);

              return (
                <div
                  key={insumo.id}
                  className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition ${
                    stockStatus === 'empty' || validadeStatus === 'expired'
                      ? 'border-red-300'
                      : stockStatus === 'low' || validadeStatus === 'expiring'
                      ? 'border-yellow-300'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{CATEGORIA_ICONS[insumo.categoria] || '📦'}</span>
                      <div>
                        <Link
                          href={`/insumos/${insumo.id}`}
                          className="font-semibold text-gray-900 hover:text-green-600"
                        >
                          {insumo.nome}
                        </Link>
                        <span className={`block text-xs px-2 py-0.5 rounded-full mt-1 w-fit ${CATEGORIA_COLORS[insumo.categoria]}`}>
                          {insumo.categoria}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Stock Atual:</span>
                      <span className={`text-lg font-bold ${
                        stockStatus === 'empty' ? 'text-red-600' :
                        stockStatus === 'low' ? 'text-orange-600' :
                        'text-gray-900'
                      }`}>
                        {insumo.stock} {insumo.unidade}
                      </span>
                    </div>
                    {insumo.stockMinimo && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Mínimo:</span>
                        <span>{insumo.stockMinimo} {insumo.unidade}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-sm">
                    {insumo.custoUnit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custo Unit.:</span>
                        <span className="font-medium">{insumo.custoUnit.toFixed(2)}€/{insumo.unidade}</span>
                      </div>
                    )}
                    {insumo.validade && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Validade:</span>
                        <span className={`font-medium ${
                          validadeStatus === 'expired' ? 'text-red-600' :
                          validadeStatus === 'expiring' ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {format(new Date(insumo.validade), 'd MMM yyyy', { locale: ptBR })}
                          {validadeStatus === 'expired' && ' (Expirado!)'}
                          {validadeStatus === 'expiring' && ' (⚠️)'}
                        </span>
                      </div>
                    )}
                    {insumo.lote && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lote:</span>
                        <span className="font-medium text-gray-700">{insumo.lote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                    <Link
                      href={`/insumos/${insumo.id}/editar`}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleAdjustStock(insumo.id, insumo.nome)}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Ajustar Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
