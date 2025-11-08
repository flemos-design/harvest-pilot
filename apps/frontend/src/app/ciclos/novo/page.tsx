'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCiclo } from '@/hooks/use-ciclos';
import { useCulturas } from '@/hooks/use-culturas';
import { Loader2, Save, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const cicloSchema = z.object({
  epoca: z.string().min(3, 'Época deve ter pelo menos 3 caracteres'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().optional(),
  estado: z.enum(['ATIVO', 'CONCLUIDO', 'CANCELADO']),
  culturaId: z.string().min(1, 'Cultura é obrigatória'),
});

type CicloFormData = z.infer<typeof cicloSchema>;

export default function NovoCicloPage() {
  const router = useRouter();
  const createCiclo = useCreateCiclo();
  const { data: culturas, isLoading: loadingCulturas } = useCulturas();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CicloFormData>({
    resolver: zodResolver(cicloSchema),
    defaultValues: { estado: 'ATIVO' },
  });

  const onSubmit = async (data: CicloFormData) => {
    try {
      await createCiclo.mutateAsync(data as any);
      router.push('/ciclos');
    } catch (error) {
      alert('Erro ao criar ciclo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Ciclo</h1>
              <p className="text-gray-600 mt-1">Registar novo ciclo de cultivo</p>
            </div>
            <Link href="/ciclos" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-3 bg-green-100 rounded-lg">
                <RefreshCw className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informações do Ciclo</h2>
                <p className="text-sm text-gray-600">Preenche os dados</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Época *</label>
              <input type="text" {...register('epoca')} placeholder="Ex: Primavera 2024" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              {errors.epoca && <p className="mt-1 text-sm text-red-600">{errors.epoca.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cultura *</label>
              {loadingCulturas ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A carregar...</span>
                </div>
              ) : (
                <select {...register('culturaId')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Seleciona a cultura</option>
                  {culturas?.map((cult) => (
                    <option key={cult.id} value={cult.id}>{cult.especie} {cult.variedade && `- ${cult.variedade}`}</option>
                  ))}
                </select>
              )}
              {errors.culturaId && <p className="mt-1 text-sm text-red-600">{errors.culturaId.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início *</label>
                <input type="date" {...register('dataInicio')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                {errors.dataInicio && <p className="mt-1 text-sm text-red-600">{errors.dataInicio.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input type="date" {...register('dataFim')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
              <select {...register('estado')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="ATIVO">Ativo</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
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
                    A criar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Criar Ciclo
                  </>
                )}
              </button>
              <Link href="/ciclos" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 font-medium">
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
