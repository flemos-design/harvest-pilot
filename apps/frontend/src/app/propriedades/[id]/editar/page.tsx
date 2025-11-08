'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePropriedade, useUpdatePropriedade } from '@/hooks/use-propriedades';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Loader2, Save, X, Building } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const propriedadeSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  organizacaoId: z.string().min(1, 'Organização é obrigatória'),
});

type PropriedadeFormData = z.infer<typeof propriedadeSchema>;

export default function EditarPropriedadePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: propriedade, isLoading, error } = usePropriedade(id);
  const updatePropriedade = useUpdatePropriedade();
  const { data: organizacoes, isLoading: loadingOrgs } = useOrganizacoes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropriedadeFormData>({
    resolver: zodResolver(propriedadeSchema),
  });

  useEffect(() => {
    if (propriedade) {
      reset({
        nome: propriedade.nome,
        descricao: propriedade.descricao || '',
        organizacaoId: propriedade.organizacaoId,
      });
    }
  }, [propriedade, reset]);

  const onSubmit = async (data: PropriedadeFormData) => {
    try {
      await updatePropriedade.mutateAsync({ id, data: data as any });
      router.push(`/propriedades/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error);
      alert('Erro ao atualizar propriedade. Verifica os dados.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !propriedade) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">Propriedade não encontrada</p>
          <Link href="/propriedades" className="mt-4 inline-block text-green-600">← Voltar</Link>
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Propriedade</h1>
              <p className="text-gray-600 mt-1">{propriedade.nome}</p>
            </div>
            <Link
              href={`/propriedades/${id}`}
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
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Atualizar Informações</h2>
                <p className="text-sm text-gray-600">Edita os dados da propriedade</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organização *</label>
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
                    <option key={org.id} value={org.id}>{org.nome}</option>
                  ))}
                </select>
              )}
              {errors.organizacaoId && (
                <p className="mt-1 text-sm text-red-600">{errors.organizacaoId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Propriedade *</label>
              <input
                type="text"
                {...register('nome')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
              )}
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
                    Guardar Alterações
                  </>
                )}
              </button>
              <Link
                href={`/propriedades/${id}`}
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
