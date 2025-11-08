'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInsumo } from '@/hooks/use-insumos';
import { Loader2, Save, X, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const insumoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  categoria: z.enum(['FERTILIZANTE', 'FITOFARMACO', 'SEMENTE', 'OUTRO']),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  stock: z.number().min(0, 'Stock deve ser positivo').optional(),
  stockMinimo: z.number().min(0).optional(),
  custoUnit: z.number().min(0).optional(),
  validade: z.string().optional(),
  lote: z.string().optional(),
});

type InsumoFormData = z.infer<typeof insumoSchema>;

export default function NovoInsumoPage() {
  const router = useRouter();
  const createInsumo = useCreateInsumo();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      stock: 0,
    },
  });

  const onSubmit = async (data: InsumoFormData) => {
    try {
      await createInsumo.mutateAsync(data as any);
      router.push('/insumos');
    } catch (error) {
      console.error('Erro ao criar insumo:', error);
      alert('Erro ao criar insumo. Verifica os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Insumo</h1>
              <p className="text-gray-600 mt-1">Adicionar produto ao inventário</p>
            </div>
            <Link
              href="/insumos"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: Adubo NPK 15-15-15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Categoria e Unidade */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  {...register('categoria')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleciona</option>
                  <option value="FERTILIZANTE">🌿 Fertilizante</option>
                  <option value="FITOFARMACO">🧪 Fitofármaco</option>
                  <option value="SEMENTE">🌱 Semente</option>
                  <option value="OUTRO">📦 Outro</option>
                </select>
                {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unidade *</label>
                <input
                  type="text"
                  {...register('unidade')}
                  placeholder="kg, L, un, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors.unidade && <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>}
              </div>
            </div>

            {/* Stock */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo (alerta)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stockMinimo', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors.stockMinimo && <p className="mt-1 text-sm text-red-600">{errors.stockMinimo.message}</p>}
              </div>
            </div>

            {/* Custo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custo Unitário (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('custoUnit', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              {errors.custoUnit && <p className="mt-1 text-sm text-red-600">{errors.custoUnit.message}</p>}
            </div>

            {/* Validade e Lote */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Validade</label>
                <input
                  type="date"
                  {...register('validade')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors.validade && <p className="mt-1 text-sm text-red-600">{errors.validade.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nº Lote</label>
                <input
                  type="text"
                  {...register('lote')}
                  placeholder="LOT2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors.lote && <p className="mt-1 text-sm text-red-600">{errors.lote.message}</p>}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Dicas</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Define um stock mínimo para receber alertas automáticos</li>
                    <li>• O sistema alerta produtos a expirar nos próximos 30 dias</li>
                    <li>• Podes ajustar o stock a qualquer momento na listagem</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A criar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Criar Insumo
                  </>
                )}
              </button>
              <Link
                href="/insumos"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
