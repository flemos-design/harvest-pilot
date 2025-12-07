'use client';

import { useOperacoes } from '@/hooks/use-operacoes';
import { Loader2, ClipboardList, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

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
  INSPECAO: 'bg-gray-100 text-gray-800',
  PODA: 'bg-orange-100 text-orange-800',
  DESBASTE: 'bg-red-100 text-red-800',
};

export default function OperacoesPage() {
  const { data: operacoes, isLoading, error } = useOperacoes();

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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar operações</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const totalOperacoes = operacoes?.length || 0;
  const custoTotal = operacoes?.reduce((sum, op) => sum + (op.custoTotal || 0), 0) || 0;
  const ultimaSemana = operacoes?.filter(op => {
    const diff = Date.now() - new Date(op.data).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operações de Campo</h1>
              <p className="text-gray-600 mt-1">Registo offline de operações com GPS e fotos</p>
            </div>
            <Link
              href="/operacoes/nova"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Nova Operação
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
              <ClipboardList className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Operações</p>
                <p className="text-2xl font-bold">{totalOperacoes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Última Semana</p>
                <p className="text-2xl font-bold">{ultimaSemana}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold">{custoTotal.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operações List */}
        {!operacoes || operacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma operação registada
            </h3>
            <p className="text-gray-500">
              Começa a registar as tuas operações de campo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {operacoes.map((operacao) => (
              <Link
                key={operacao.id}
                href={`/operacoes/${operacao.id}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition cursor-pointer block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">
                        {TIPO_ICONS[operacao.tipo] || '📋'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {operacao.tipo.replace('_', ' ')}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${TIPO_COLORS[operacao.tipo] || 'bg-gray-100 text-gray-800'}`}>
                            {operacao.tipo}
                          </span>
                        </div>

                        {operacao.descricao && (
                          <p className="text-gray-700 mb-2">{operacao.descricao}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(operacao.data), "d 'de' MMMM, yyyy", { locale: pt })}
                            </span>
                          </div>

                          {operacao.parcela && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Talhão:</span>
                              <span>{operacao.parcela.nome}</span>
                            </div>
                          )}

                          {operacao.operador && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Por:</span>
                              <span>{operacao.operador.nome}</span>
                            </div>
                          )}
                        </div>

                        {operacao.notas && (
                          <p className="mt-3 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
                            {operacao.notas}
                          </p>
                        )}

                        {operacao.latitude && operacao.longitude && (
                          <div className="mt-2 text-xs text-gray-500">
                            📍 GPS: {operacao.latitude.toFixed(5)}, {operacao.longitude.toFixed(5)}
                          </div>
                        )}
                      </div>
                    </div>

                    {operacao.custoTotal && operacao.custoTotal > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Custo</div>
                        <div className="text-xl font-bold text-green-600">
                          {operacao.custoTotal.toFixed(2)}€
                        </div>
                      </div>
                    )}
                  </div>

                  {operacao.fotos && operacao.fotos.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        {operacao.fotos.map((foto, idx) => (
                          <div key={idx} className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            📷
                          </div>
                        ))}
                      </div>
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
