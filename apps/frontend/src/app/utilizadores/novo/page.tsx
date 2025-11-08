'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUtilizador } from '@/hooks/use-utilizadores';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { Loader2, Save, X, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const utilizadorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
  papel: z.enum(['ADMIN', 'GESTOR', 'PLANEADOR', 'OPERADOR']),
  organizacaoId: z.string().min(1, 'Organização é obrigatória'),
});

type UtilizadorFormData = z.infer<typeof utilizadorSchema>;

export default function NovoUtilizadorPage() {
  const router = useRouter();
  const createUtilizador = useCreateUtilizador();
  const { data: organizacoes, isLoading: loadingOrgs } = useOrganizacoes();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UtilizadorFormData>({
    resolver: zodResolver(utilizadorSchema),
    defaultValues: { papel: 'OPERADOR' },
  });

  const onSubmit = async (data: UtilizadorFormData) => {
    try {
      await createUtilizador.mutateAsync(data as any);
      router.push('/utilizadores');
    } catch (error) {
      alert('Erro ao criar utilizador');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Utilizador</h1>
              <p className="text-gray-600 mt-1">Adicionar novo utilizador ao sistema</p>
            </div>
            <Link href="/utilizadores" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-flex items-center gap-2">
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
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informações do Utilizador</h2>
                <p className="text-sm text-gray-600">Preenche os dados básicos</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input type="text" {...register('nome')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" {...register('email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input type="password" {...register('password')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Papel *</label>
              <select {...register('papel')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="OPERADOR">Operador</option>
                <option value="PLANEADOR">Planeador</option>
                <option value="GESTOR">Gestor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {errors.papel && <p className="mt-1 text-sm text-red-600">{errors.papel.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organização *</label>
              {loadingOrgs ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A carregar...</span>
                </div>
              ) : (
                <select {...register('organizacaoId')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Seleciona a organização</option>
                  {organizacoes?.map((org) => (
                    <option key={org.id} value={org.id}>{org.nome}</option>
                  ))}
                </select>
              )}
              {errors.organizacaoId && <p className="mt-1 text-sm text-red-600">{errors.organizacaoId.message}</p>}
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
                    Criar Utilizador
                  </>
                )}
              </button>
              <Link href="/utilizadores" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 font-medium">
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
