'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit3, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useInsumo } from '@/hooks/use-insumos';

const categoryLabels: Record<string, string> = {
  FERTILIZANTE: 'Fertilizante',
  FITOFARMACO: 'Fitofármaco',
  SEMENTE: 'Semente',
  OUTRO: 'Outro',
};

export default function InsumoDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: insumo, isLoading, error } = useInsumo(id);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  }

  if (error || !insumo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Insumo não encontrado</h1>
          <Link href="/insumos" className="text-green-600 hover:underline">Voltar aos insumos</Link>
        </div>
      </div>
    );
  }

  const lowStock = insumo.stockMinimo !== null && insumo.stock <= insumo.stockMinimo;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/insumos" aria-label="Voltar" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{insumo.nome}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{categoryLabels[insumo.categoria] || insumo.categoria}</p>
            </div>
          </div>
          <Link href={`/insumos/${id}/editar`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"><Edit3 className="w-4 h-4" />Editar</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3"><Package className="w-5 h-5 text-green-600" /><div><p className="text-sm text-gray-500">Stock atual</p><p className="text-xl font-semibold">{insumo.stock} {insumo.unidade}</p></div></div>
            <div><p className="text-sm text-gray-500">Stock mínimo</p><p className="text-xl font-semibold">{insumo.stockMinimo ?? '—'} {insumo.stockMinimo !== null ? insumo.unidade : ''}</p></div>
            <div><p className="text-sm text-gray-500">Custo unitário</p><p className="text-xl font-semibold">{insumo.custoUnit != null ? `${insumo.custoUnit.toFixed(2)} €` : '—'}</p></div>
            <div><p className="text-sm text-gray-500">Lote</p><p className="text-xl font-semibold">{insumo.lote || '—'}</p></div>
            <div><p className="text-sm text-gray-500">Validade</p><p className="text-xl font-semibold">{insumo.validade ? new Date(insumo.validade).toLocaleDateString('pt-PT') : '—'}</p></div>
            <div><p className="text-sm text-gray-500">Unidade</p><p className="text-xl font-semibold">{insumo.unidade}</p></div>
          </div>
          {lowStock && <div className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800"><AlertTriangle className="w-5 h-5" />Stock abaixo do mínimo definido.</div>}
        </div>
      </main>
    </div>
  );
}
