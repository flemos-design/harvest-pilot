'use client';

import { useCiclos, useDeleteCiclo } from '@/hooks/use-ciclos';
import { Loader2, RefreshCw, Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const ESTADO_COLORS: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  CONCLUIDO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export default function CiclosPage() {
  const { data: ciclos, isLoading, error } = useCiclos();
  const deleteCiclo = useDeleteCiclo();

  const handleDelete = async (id: string, epoca: string) => {
    if (confirm(`Tens a certeza que queres eliminar o ciclo "${epoca}"?`)) {
      try {
        await deleteCiclo.mutateAsync(id);
      } catch (error) {
        alert('Erro ao eliminar ciclo');
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ciclos de Cultivo</h1>
              <p className="text-gray-600 mt-1">Gestão de ciclos produtivos</p>
            </div>
            <Link
              href="/ciclos/novo"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Novo Ciclo
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!ciclos || ciclos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum ciclo</h3>
            <p className="text-gray-600 mb-6">Regista ciclos de cultivo</p>
            <Link
              href="/ciclos/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Ciclo
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ciclos.map((ciclo) => (
              <div key={ciclo.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-900">{ciclo.epoca}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[ciclo.estado]}`}>
                      {ciclo.estado}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {format(new Date(ciclo.dataInicio), "d 'de' MMM yyyy", { locale: pt })}</span>
                  </div>
                  {ciclo.dataFim && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Fim: {format(new Date(ciclo.dataFim), "d 'de' MMM yyyy", { locale: pt })}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDelete(ciclo.id, ciclo.epoca)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
