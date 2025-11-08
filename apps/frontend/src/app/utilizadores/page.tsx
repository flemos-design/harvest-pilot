'use client';

import { useUtilizadores, useDeleteUtilizador } from '@/hooks/use-utilizadores';
import { Loader2, Users, Plus, Shield, Trash2, Mail } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAPEL_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  GESTOR: 'bg-blue-100 text-blue-800',
  PLANEADOR: 'bg-green-100 text-green-800',
  OPERADOR: 'bg-gray-100 text-gray-800',
};

export default function UtilizadoresPage() {
  const { data: utilizadores, isLoading, error } = useUtilizadores();
  const deleteUtilizador = useDeleteUtilizador();

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tens a certeza que queres eliminar o utilizador "${nome}"?`)) {
      try {
        await deleteUtilizador.mutateAsync(id);
      } catch (error) {
        alert('Erro ao eliminar utilizador');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">{(error as Error).message}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Utilizadores</h1>
              <p className="text-gray-600 mt-1">Gestão de utilizadores e permissões</p>
            </div>
            <Link
              href="/utilizadores/novo"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Novo Utilizador
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!utilizadores || utilizadores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum utilizador</h3>
            <p className="text-gray-600 mb-6">Adiciona utilizadores à plataforma</p>
            <Link
              href="/utilizadores/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Criar Utilizador
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organização</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atividade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {utilizadores.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nome}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${PAPEL_COLORS[user.papel]}`}>
                        <Shield className="w-3 h-3" />
                        {user.papel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.organizacao?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user._count?.operacoes || 0} operações
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(user.id, user.nome)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
