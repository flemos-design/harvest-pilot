'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInsumo, useUpdateInsumo } from '@/hooks/use-insumos';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const insumoSchema = z.object({
  nome: z.string().min(3),
  categoria: z.enum(['FERTILIZANTE', 'FITOFARMACO', 'SEMENTE', 'OUTRO']),
  unidade: z.string().min(1),
  stock: z.number().min(0).optional(),
  stockMinimo: z.number().min(0).optional(),
  custoUnit: z.number().min(0).optional(),
  validade: z.string().optional(),
  lote: z.string().optional(),
});

type InsumoFormData = z.infer<typeof insumoSchema>;

export default function EditarInsumoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: insumo, isLoading, error } = useInsumo(id);
  const updateInsumo = useUpdateInsumo();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
  });

  useEffect(() => {
    if (insumo) {
      reset({
        nome: insumo.nome,
        categoria: insumo.categoria,
        unidade: insumo.unidade,
        stock: insumo.stock,
        stockMinimo: insumo.stockMinimo,
        custoUnit: insumo.custoUnit,
        validade: insumo.validade ? new Date(insumo.validade).toISOString().split('T')[0] : '',
        lote: insumo.lote || '',
      });
    }
  }, [insumo, reset]);

  const onSubmit = async (data: InsumoFormData) => {
    try {
      await updateInsumo.mutateAsync({ id, data: data as any });
      router.push(`/insumos`);
    } catch (error) {
      alert('Erro ao atualizar insumo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !insumo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">Insumo não encontrado</p>
          <Link href="/insumos" className="mt-4 inline-block text-green-600">← Voltar</Link>
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Insumo</h1>
              <p className="text-gray-600 mt-1">{insumo.nome}</p>
            </div>
            <Link href="/insumos" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input
                type="text"
                {...register('nome')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  {...register('categoria')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="FERTILIZANTE">🌿 Fertilizante</option>
                  <option value="FITOFARMACO">🧪 Fitofármaco</option>
                  <option value="SEMENTE">🌱 Semente</option>
                  <option value="OUTRO">📦 Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unidade *</label>
                <input
                  type="text"
                  {...register('unidade')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stockMinimo', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custo Unitário (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('custoUnit', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                <input
                  type="date"
                  {...register('validade')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lote</label>
                <input
                  type="text"
                  {...register('lote')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar
                  </>
                )}
              </button>
              <Link href="/insumos" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 font-medium">
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
