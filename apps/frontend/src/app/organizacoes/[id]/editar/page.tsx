'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganizacao, useUpdateOrganizacao } from '@/hooks/use-organizacoes';
import { Loader2, Save, X, Building2, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const organizacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
});

type OrganizacaoFormData = z.infer<typeof organizacaoSchema>;

export default function EditarOrganizacaoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: organizacao, isLoading, error } = useOrganizacao(id);
  const updateOrganizacao = useUpdateOrganizacao();
  const [autoSlug, setAutoSlug] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizacaoFormData>({
    resolver: zodResolver(organizacaoSchema),
  });

  useEffect(() => {
    if (organizacao) {
      reset({
        nome: organizacao.nome,
        slug: organizacao.slug,
      });
    }
  }, [organizacao, reset]);

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
      await updateOrganizacao.mutateAsync({ id, data });
      router.push(`/organizacoes/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      alert('Erro ao atualizar organização. Verifica os dados.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !organizacao) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">Organização não encontrada</p>
          <Link href="/organizacoes" className="mt-4 inline-block text-green-600">← Voltar</Link>
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Organização</h1>
              <p className="text-gray-600 mt-1">{organizacao.nome}</p>
            </div>
            <Link
              href={`/organizacoes/${id}`}
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
                <p className="text-sm text-gray-600">Atualiza os dados</p>
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

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Atenção</p>
                  <p className="text-xs">
                    Alterar o slug pode afetar links existentes. Esta organização tem{' '}
                    <strong>{organizacao._count?.propriedades || 0} propriedade(s)</strong> e{' '}
                    <strong>{organizacao._count?.utilizadores || 0} utilizador(es)</strong> associados.
                  </p>
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
                href={`/organizacoes/${id}`}
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
