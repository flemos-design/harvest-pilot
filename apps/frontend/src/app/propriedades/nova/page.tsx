'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePropriedade } from '@/hooks/use-propriedades';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Loader2, Save, X, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const propriedadeSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  organizacaoId: z.string().min(1, 'Organização é obrigatória'),
});

type PropriedadeFormData = z.infer<typeof propriedadeSchema>;

export default function NovaPropriedadePage() {
  const router = useRouter();
  const createPropriedade = useCreatePropriedade();
  const { data: organizacoes, isLoading: loadingOrgs } = useOrganizacoes();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropriedadeFormData>({
    resolver: zodResolver(propriedadeSchema),
  });

  const onSubmit = async (data: PropriedadeFormData) => {
    try {
      await createPropriedade.mutateAsync(data as any);
      router.push('/propriedades');
    } catch (error) {
      console.error('Erro ao criar propriedade:', error);
      alert('Erro ao criar propriedade. Verifica os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Propriedade</h1>
              <p className="text-gray-600 mt-1">Adicionar nova propriedade/localidade</p>
            </div>
            <Link
              href="/propriedades"
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
            {/* Icon Header */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informações da Propriedade</h2>
                <p className="text-sm text-gray-600">Preenche os dados básicos</p>
              </div>
            </div>

            {/* Organização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organização *
              </label>
              {loadingOrgs ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A carregar organizações...</span>
                </div>
              ) : (
                <select
                  {...register('organizacaoId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleciona a organização</option>
                  {organizacoes?.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.nome}
                    </option>
                  ))}
                </select>
              )}
              {errors.organizacaoId && (
                <p className="mt-1 text-sm text-red-600">{errors.organizacaoId.message}</p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Propriedade *
              </label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: Quinta da Vista Alegre"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                rows={3}
                placeholder="Descrição opcional da propriedade..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
              )}
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
                    Criar Propriedade
                  </>
                )}
              </button>
              <Link
                href="/propriedades"
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
