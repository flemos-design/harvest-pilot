'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Check, X, Edit2, Trash2, FileUp } from 'lucide-react';
import { usePropriedades } from '@/hooks/use-propriedades';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { parseKmz, validateKmzFile, type ParsedParcela } from '@/lib/kmz-parser';

export default function ImportarParcelasPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [propriedadeId, setPropriedadeId] = useState('');
  const [parcelas, setParcelas] = useState<ParsedParcela[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [parseError, setParseError] = useState('');

  const { data: propriedades, isLoading: loadingProps } = usePropriedades();

  // Parse KMZ mutation
  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!propriedadeId) {
        throw new Error('Selecione uma propriedade primeiro');
      }
      return parseKmz(file, propriedadeId);
    },
    onSuccess: (data) => {
      setParcelas(data);
      setParseError('');
      setError('');
    },
    onError: (error: Error) => {
      setParseError(error.message);
      setParcelas([]);
    },
  });

  // Bulk create mutation
  const createMutation = useMutation({
    mutationFn: async (parcelas: ParsedParcela[]) => {
      const response = await apiClient.post('/parcelas/bulk', parcelas);
      return response.data;
    },
    onSuccess: () => {
      router.push('/parcelas');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao criar terrenos');
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateKmzFile(selectedFile);
    if (validationError) {
      setParseError(validationError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setParseError('');
  };

  const handleParse = () => {
    if (!file) {
      setParseError('Selecione um ficheiro primeiro');
      return;
    }
    if (!propriedadeId) {
      setParseError('Selecione uma propriedade primeiro');
      return;
    }
    parseMutation.mutate(file);
  };

  const handleEditParcela = (index: number, field: keyof ParsedParcela, value: any) => {
    const newParcelas = [...parcelas];
    newParcelas[index] = { ...newParcelas[index], [field]: value };
    setParcelas(newParcelas);
  };

  const handleRemoveParcela = (index: number) => {
    setParcelas(parcelas.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (parcelas.length === 0) {
      setError('Não há terrenos para importar');
      return;
    }
    createMutation.mutate(parcelas);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Importar Terrenos (KMZ)</h1>
          <p className="text-gray-600 mt-1">
            Faça upload de um ficheiro .kmz ou .kml com múltiplos terrenos
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Step 1: Upload File */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Passo 1: Selecionar Ficheiro e Propriedade
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Propriedade Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propriedade *
              </label>
              <select
                value={propriedadeId}
                onChange={(e) => setPropriedadeId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loadingProps || parcelas.length > 0}
              >
                <option value="">Selecione uma propriedade</option>
                {propriedades?.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ficheiro KMZ/KML *
              </label>
              <input
                type="file"
                accept=".kmz,.kml"
                onChange={handleFileChange}
                disabled={!propriedadeId || parcelas.length > 0}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Ficheiro: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {parseError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              {parseError}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleParse}
              disabled={!file || !propriedadeId || parseMutation.isPending || parcelas.length > 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {parseMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Processar Ficheiro
                </>
              )}
            </button>

            {parcelas.length > 0 && (
              <button
                onClick={() => {
                  setParcelas([]);
                  setFile(null);
                  setPropriedadeId('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Preview & Edit */}
        {parcelas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Passo 2: Rever e Editar ({parcelas.length} terrenos)
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Área (ha)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Altitude (m)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo de Solo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parcelas.map((parcela, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editingIndex === index ? (
                          <input
                            type="text"
                            value={parcela.nome}
                            onChange={(e) => handleEditParcela(index, 'nome', e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{parcela.nome}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingIndex === index ? (
                          <input
                            type="number"
                            step="0.0001"
                            value={parcela.area}
                            onChange={(e) =>
                              handleEditParcela(index, 'area', parseFloat(e.target.value))
                            }
                            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{parcela.area.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingIndex === index ? (
                          <input
                            type="number"
                            value={parcela.altitude || ''}
                            onChange={(e) =>
                              handleEditParcela(
                                index,
                                'altitude',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="Opcional"
                            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {parcela.altitude?.toFixed(0) || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingIndex === index ? (
                          <input
                            type="text"
                            value={parcela.tipoSolo || ''}
                            onChange={(e) => handleEditParcela(index, 'tipoSolo', e.target.value)}
                            placeholder="Opcional"
                            className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{parcela.tipoSolo || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editingIndex === index ? (
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Concluir edição"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingIndex(index)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveParcela(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Submit */}
        {parcelas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Passo 3: Confirmar Importação
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Está prestes a criar <strong>{parcelas.length} terrenos</strong>. Após a importação,
              poderá editar cada terreno individualmente para adicionar mais detalhes (culturas,
              ciclos, etc.).
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A importar...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Importar {parcelas.length} Terrenos
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/parcelas')}
                disabled={createMutation.isPending}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
