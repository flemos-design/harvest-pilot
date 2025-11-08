'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrganizacao } from '@/hooks/use-organizacoes';
import { Loader2, Save, X, Building2, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const organizacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
});

type OrganizacaoFormData = z.infer<typeof organizacaoSchema>;

export default function NovaOrganizacaoPage() {
  const router = useRouter();
  const createOrganizacao = useCreateOrganizacao();
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizacaoFormData>({
    resolver: zodResolver(organizacaoSchema),
  });

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    if (autoSlug) {
      const slug = nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  };

  const onSubmit = async (data: OrganizacaoFormData) => {
    try {
      await createOrganizacao.mutateAsync(data);
      router.push('/organizacoes');
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      alert('Erro ao criar organização. Verifica os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Organização</h1>
              <p className="text-gray-600 mt-1">Criar uma nova organização no sistema</p>
            </div>
            <Link
              href="/organizacoes"
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
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informações da Organização</h2>
                <p className="text-sm text-gray-600">Preenche os dados básicos</p>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Organização *
              </label>
              <input
                type="text"
                {...register('nome')}
                onChange={(e) => {
                  register('nome').onChange(e);
                  handleNomeChange(e);
                }}
                placeholder="Ex: Quinta do Vale Verde"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) *
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  {...register('slug')}
                  placeholder="quinta-do-vale-verde"
                  onChange={(e) => {
                    register('slug').onChange(e);
                    setAutoSlug(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setAutoSlug(true)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Auto
                </button>
              </div>
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Usado na URL: /organizacoes/slug/...
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Sobre o Slug</p>
                  <ul className="space-y-1 text-xs">
                    <li>• O slug é gerado automaticamente a partir do nome</li>
                    <li>• Deve conter apenas letras minúsculas, números e hífens</li>
                    <li>• É usado como identificador único na URL</li>
                    <li>• Podes editar manualmente se preferires</li>
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
                    Criar Organização
                  </>
                )}
              </button>
              <Link
                href="/organizacoes"
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
