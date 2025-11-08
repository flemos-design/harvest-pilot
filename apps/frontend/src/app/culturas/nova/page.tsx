'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCultura } from '@/hooks/use-culturas';
import { useParcelas } from '@/hooks/use-parcelas';
import { Loader2, Save, X, Sprout } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const culturaSchema = z.object({
  especie: z.string().min(2, 'Espécie deve ter pelo menos 2 caracteres'),
  variedade: z.string().optional(),
  finalidade: z.enum(['FRUTO', 'MADEIRA']),
  parcelaId: z.string().min(1, 'Parcela é obrigatória'),
});

type CulturaFormData = z.infer<typeof culturaSchema>;

const ESPECIES_FRUTO = [
  'Castanheiro',
  'Nogueira',
  'Avelã',
  'Cerejeira',
  'Macieira',
  'Pereira',
  'Amendoeira',
  'Figueira',
];

const ESPECIES_MADEIRA = [
  'Carvalho',
  'Castanheiro',
  'Pinheiro',
  'Eucalipto',
  'Cerejeira',
  'Choupo',
  'Freixo',
  'Nogueira',
];

export default function NovaCulturaPage() {
  const router = useRouter();
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas();
  const createCultura = useCreateCultura();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CulturaFormData>({
    resolver: zodResolver(culturaSchema),
    defaultValues: {
      finalidade: 'FRUTO',
    },
  });

  const finalidadeSelecionada = watch('finalidade');
  const especiesDisponiveis = finalidadeSelecionada === 'FRUTO' ? ESPECIES_FRUTO : ESPECIES_MADEIRA;

  const onSubmit = async (data: CulturaFormData) => {
    try {
      await createCultura.mutateAsync(data);
      router.push('/culturas');
    } catch (error) {
      console.error('Erro ao criar cultura:', error);
      alert('Erro ao criar cultura. Verifica os dados e tenta novamente.');
    }
  };

  if (isLoadingParcelas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Cultura</h1>
              <p className="text-gray-600 mt-1">Criar nova cultura agrícola</p>
            </div>
            <Link
              href="/culturas"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Finalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Finalidade da Cultura *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-green-600 has-[:checked]:bg-green-50">
                  <input
                    type="radio"
                    {...register('finalidade')}
                    value="FRUTO"
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <Sprout className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Fruto</p>
                      <p className="text-xs text-gray-500">Produção de frutos</p>
                    </div>
                  </div>
                </label>
                <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
                  <input
                    type="radio"
                    {...register('finalidade')}
                    value="MADEIRA"
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <Sprout className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">Madeira</p>
                      <p className="text-xs text-gray-500">Produção madeireira</p>
                    </div>
                  </div>
                </label>
              </div>
              {errors.finalidade && (
                <p className="mt-1 text-sm text-red-600">{errors.finalidade.message}</p>
              )}
            </div>

            {/* Espécie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espécie *
              </label>
              <select
                {...register('especie')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona a espécie</option>
                {especiesDisponiveis.map((especie) => (
                  <option key={especie} value={especie}>
                    {especie}
                  </option>
                ))}
                <option value="Outra">Outra</option>
              </select>
              {errors.especie && (
                <p className="mt-1 text-sm text-red-600">{errors.especie.message}</p>
              )}
            </div>

            {/* Variedade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variedade
              </label>
              <input
                type="text"
                {...register('variedade')}
                placeholder="Ex: Longal, Judia, Boa Portuguesa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Opcional: Especifica a variedade da espécie</p>
              {errors.variedade && (
                <p className="mt-1 text-sm text-red-600">{errors.variedade.message}</p>
              )}
            </div>

            {/* Parcela */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcela *
              </label>
              <select
                {...register('parcelaId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleciona a parcela</option>
                {parcelas?.map((parcela) => (
                  <option key={parcela.id} value={parcela.id}>
                    {parcela.nome} ({parcela.area} ha)
                    {parcela.propriedade && ` - ${parcela.propriedade.nome}`}
                  </option>
                ))}
              </select>
              {errors.parcelaId && (
                <p className="mt-1 text-sm text-red-600">{errors.parcelaId.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Seleciona a parcela onde a cultura será plantada
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Sprout className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Gestão de Culturas</p>
                  <p className="text-green-700">
                    Após criar a cultura, poderás gerir os ciclos de produção, acompanhar operações e
                    registar toda a informação relacionada com esta cultura.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Criar Cultura
                  </>
                )}
              </button>
              <Link
                href="/culturas"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium inline-flex items-center justify-center"
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
