'use client';

import { useCultura, useDeleteCultura } from '@/hooks/use-culturas';
import { useCreateCiclo, useDeleteCiclo, useUpdateCiclo } from '@/hooks/use-ciclos';
import { Loader2, Sprout, TreeDeciduous, Axe, ArrowLeft, Edit, Trash2, Calendar, MapPin, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const CICLO_STATUS_COLORS = {
  ATIVO: 'bg-green-100 text-green-800',
  CONCLUIDO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export default function CulturaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNovoCiclo, setShowNovoCiclo] = useState(false);
  const [cicloFormData, setCicloFormData] = useState({
    epoca: '',
    dataInicio: '',
    dataFim: '',
    estado: 'ATIVO' as 'ATIVO' | 'CONCLUIDO' | 'CANCELADO',
  });

  const { data: cultura, isLoading, error } = useCultura(id);
  const deleteCultura = useDeleteCultura();
  const createCiclo = useCreateCiclo();
  const deleteCiclo = useDeleteCiclo();
  const updateCiclo = useUpdateCiclo();

  const handleDelete = async () => {
    const confirmacao = confirm(
      `Tens a certeza que queres eliminar a cultura "${cultura?.especie}"?\n\n` +
      'Esta ação não pode ser revertida e irá remover todos os dados associados.'
    );

    if (!confirmacao) return;

    try {
      setIsDeleting(true);
      await deleteCultura.mutateAsync(id);
      router.push('/culturas');
    } catch (error) {
      console.error('Erro ao eliminar cultura:', error);
      alert('Erro ao eliminar cultura. Tenta novamente.');
      setIsDeleting(false);
    }
  };

  const handleCreateCiclo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cicloFormData.epoca || !cicloFormData.dataInicio) {
      alert('Por favor preenche todos os campos obrigatórios.');
      return;
    }

    try {
      await createCiclo.mutateAsync({
        ...cicloFormData,
        culturaId: id,
        dataFim: cicloFormData.dataFim || undefined,
      });

      // Reset form and close
      setCicloFormData({
        epoca: '',
        dataInicio: '',
        dataFim: '',
        estado: 'ATIVO',
      });
      setShowNovoCiclo(false);
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      alert('Erro ao criar ciclo. Tenta novamente.');
    }
  };

  const handleDeleteCiclo = async (cicloId: string, epoca: string) => {
    const confirmacao = confirm(
      `Tens a certeza que queres eliminar o ciclo "${epoca}"?\n\n` +
      'Esta ação não pode ser revertida.'
    );

    if (!confirmacao) return;

    try {
      await deleteCiclo.mutateAsync(cicloId);
    } catch (error) {
      console.error('Erro ao eliminar ciclo:', error);
      alert('Erro ao eliminar ciclo. Tenta novamente.');
    }
  };

  const handleUpdateCicloEstado = async (cicloId: string, novoEstado: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO') => {
    try {
      await updateCiclo.mutateAsync({
        id: cicloId,
        data: { estado: novoEstado },
      });
    } catch (error) {
      console.error('Erro ao atualizar estado do ciclo:', error);
      alert('Erro ao atualizar estado do ciclo. Tenta novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !cultura) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar cultura</h2>
          <p className="text-gray-600">{error ? (error as Error).message : 'Cultura não encontrada'}</p>
          <Link href="/culturas" className="mt-4 inline-block text-green-600 hover:text-green-700">
            ← Voltar para culturas
          </Link>
        </div>
      </div>
    );
  }

  const ciclosAtivos = cultura.ciclos?.filter(c => c.estado === 'ATIVO').length || 0;
  const ciclosConcluidos = cultura.ciclos?.filter(c => c.estado === 'CONCLUIDO').length || 0;
  const totalCiclos = cultura.ciclos?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/culturas"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                {cultura.finalidade === 'FRUTO' ? (
                  <TreeDeciduous className="w-10 h-10 text-green-600" />
                ) : (
                  <Axe className="w-10 h-10 text-amber-600" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{cultura.especie}</h1>
                  {cultura.variedade && (
                    <p className="text-gray-600 mt-1">{cultura.variedade}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A eliminar...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sprout className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600 font-medium">Finalidade</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{cultura.finalidade}</p>
            <p className="text-xs text-gray-500 mt-1">
              {cultura.finalidade === 'FRUTO' ? 'Produção de frutos' : 'Produção madeireira'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Ciclos Ativos</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ciclosAtivos}</p>
            <p className="text-xs text-gray-500 mt-1">{totalCiclos} total</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-gray-600" />
              <p className="text-sm text-gray-600 font-medium">Ciclos Concluídos</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ciclosConcluidos}</p>
            <p className="text-xs text-gray-500 mt-1">
              Criada em {format(new Date(cultura.createdAt), 'dd MMM yyyy', { locale: pt })}
            </p>
          </div>
        </div>

        {/* Detalhes e Ciclos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Detalhes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Espécie</dt>
                <dd className="mt-1 text-lg text-gray-900">{cultura.especie}</dd>
              </div>
              {cultura.variedade && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Variedade</dt>
                  <dd className="mt-1 text-lg text-gray-900">{cultura.variedade}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-600">Finalidade</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      cultura.finalidade === 'FRUTO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cultura.finalidade === 'FRUTO' ? (
                      <TreeDeciduous className="w-4 h-4 mr-2" />
                    ) : (
                      <Axe className="w-4 h-4 mr-2" />
                    )}
                    {cultura.finalidade}
                  </span>
                </dd>
              </div>
              <div className="pt-4 border-t">
                <dt className="text-sm font-medium text-gray-600">Criada em</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(cultura.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: pt,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Última atualização</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(cultura.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: pt,
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Ciclos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ciclos</h2>
              <div className="flex items-center gap-3">
                {totalCiclos > 0 && (
                  <span className="text-sm text-gray-500">{totalCiclos} {totalCiclos === 1 ? 'ciclo' : 'ciclos'}</span>
                )}
                <button
                  onClick={() => setShowNovoCiclo(!showNovoCiclo)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 text-sm"
                >
                  {showNovoCiclo ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Novo Ciclo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formulário Novo Ciclo */}
            {showNovoCiclo && (
              <form onSubmit={handleCreateCiclo} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Criar Novo Ciclo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Época *
                    </label>
                    <input
                      type="text"
                      value={cicloFormData.epoca}
                      onChange={(e) => setCicloFormData({ ...cicloFormData, epoca: e.target.value })}
                      placeholder="Ex: 2024/2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={cicloFormData.estado}
                      onChange={(e) => setCicloFormData({ ...cicloFormData, estado: e.target.value as 'ATIVO' | 'CONCLUIDO' | 'CANCELADO' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="ATIVO">ATIVO</option>
                      <option value="CONCLUIDO">CONCLUÍDO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Início *
                    </label>
                    <input
                      type="date"
                      value={cicloFormData.dataInicio}
                      onChange={(e) => setCicloFormData({ ...cicloFormData, dataInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={cicloFormData.dataFim}
                      onChange={(e) => setCicloFormData({ ...cicloFormData, dataFim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowNovoCiclo(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createCiclo.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {createCiclo.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        A criar...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Ciclo
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {!cultura.ciclos || cultura.ciclos.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum ciclo registado</p>
                <p className="text-sm text-gray-500 mt-1">
                  Clica em "Novo Ciclo" para criar o primeiro ciclo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cultura.ciclos.map((ciclo) => (
                  <div key={ciclo.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-gray-900">{ciclo.epoca}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CICLO_STATUS_COLORS[ciclo.estado]}`}>
                            {ciclo.estado}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Início: {format(new Date(ciclo.dataInicio), 'dd/MM/yyyy', { locale: pt })}</p>
                          {ciclo.dataFim && (
                            <p>Fim: {format(new Date(ciclo.dataFim), 'dd/MM/yyyy', { locale: pt })}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ciclo.estado === 'ATIVO' && (
                          <button
                            onClick={() => handleUpdateCicloEstado(ciclo.id, 'CONCLUIDO')}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
                            title="Marcar como concluído"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCiclo(ciclo.id, ciclo.epoca)}
                          disabled={deleteCiclo.isPending}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Eliminar ciclo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
