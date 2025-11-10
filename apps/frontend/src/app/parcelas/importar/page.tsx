'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Check, X, Edit2, Trash2, FileUp, ChevronDown, ChevronUp, Info, HelpCircle, FolderTree, MapPin } from 'lucide-react';
import { useOrganizacoes } from '@/hooks/use-organizacoes';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { parseGeoFile, validateKmzFile, type ParsedPropriedade, type ParsedTerreno } from '@/lib/kmz-parser';

export default function ImportarParcelasPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [propriedades, setPropriedades] = useState<ParsedPropriedade[]>([]);
  const [expandedProps, setExpandedProps] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [parseError, setParseError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  const { data: organizacoes } = useOrganizacoes();
  const orgId = organizacoes?.[0]?.id || '';

  // Check if user has seen welcome modal before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('kmz-import-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('kmz-import-welcome-seen', 'true');
    setShowWelcome(false);
  };

  // Parse file mutation (auto-detects KMZ/KML/GeoJSON)
  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!orgId) {
        throw new Error('Nenhuma organização encontrada');
      }
      return parseGeoFile(file, orgId);
    },
    onSuccess: (data) => {
      setPropriedades(data.propriedades);
      // Expand all properties by default
      setExpandedProps(new Set(data.propriedades.map((_, i) => i)));
      setParseError('');
      setError('');
    },
    onError: (error: Error) => {
      setParseError(error.message);
      setPropriedades([]);
    },
  });

  // Bulk import mutation
  const importMutation = useMutation({
    mutationFn: async (data: { organizacaoId: string; propriedades: ParsedPropriedade[] }) => {
      const response = await apiClient.post('/propriedades/bulk-import', data);
      return response.data;
    },
    onSuccess: () => {
      router.push('/parcelas');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao importar');
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
    if (!orgId) {
      setParseError('Nenhuma organização encontrada. Crie uma organização primeiro.');
      return;
    }
    parseMutation.mutate(file);
  };

  const handleEditPropriedade = (propIndex: number, field: keyof ParsedPropriedade, value: any) => {
    const newProps = [...propriedades];
    newProps[propIndex] = { ...newProps[propIndex], [field]: value };
    setPropriedades(newProps);
  };

  const handleEditTerreno = (propIndex: number, terrenoIndex: number, field: keyof ParsedTerreno, value: any) => {
    const newProps = [...propriedades];
    const newTerrenos = [...newProps[propIndex].terrenos];
    newTerrenos[terrenoIndex] = { ...newTerrenos[terrenoIndex], [field]: value };
    newProps[propIndex] = { ...newProps[propIndex], terrenos: newTerrenos };
    setPropriedades(newProps);
  };

  const handleRemoveTerreno = (propIndex: number, terrenoIndex: number) => {
    const newProps = [...propriedades];
    newProps[propIndex].terrenos = newProps[propIndex].terrenos.filter((_, i) => i !== terrenoIndex);

    // Remove propriedade se não tiver terrenos
    if (newProps[propIndex].terrenos.length === 0) {
      newProps.splice(propIndex, 1);
    }

    setPropriedades(newProps);
  };

  const handleRemovePropriedade = (propIndex: number) => {
    setPropriedades(propriedades.filter((_, i) => i !== propIndex));
  };

  const togglePropriedade = (propIndex: number) => {
    const newExpanded = new Set(expandedProps);
    if (newExpanded.has(propIndex)) {
      newExpanded.delete(propIndex);
    } else {
      newExpanded.add(propIndex);
    }
    setExpandedProps(newExpanded);
  };

  const handleSubmit = () => {
    if (propriedades.length === 0) {
      setError('Não há propriedades para importar');
      return;
    }
    importMutation.mutate({
      organizacaoId: orgId,
      propriedades,
    });
  };

  const totalTerrenos = propriedades.reduce((sum, p) => sum + p.terrenos.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Como funciona a Importação KMZ
                </h2>
                <p className="text-gray-600">
                  Importe todos os seus terrenos de uma só vez a partir de um ficheiro do Google Maps ou Google Earth
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Faça upload do ficheiro</h3>
                  <p className="text-sm text-gray-600">
                    Formatos suportados: KMZ/KML (Google Maps/Earth) ou GeoJSON
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">O sistema extrai automaticamente</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Propriedades e terrenos são detetados pela estrutura do ficheiro:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm font-mono">
                    <div className="flex items-center gap-2 text-blue-600">
                      <FolderTree className="w-4 h-4" />
                      <span>Pasta/Folder</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">Propriedade</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 ml-6 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>Marcadores com áreas</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">Terrenos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reveja e edite (opcional)</h3>
                  <p className="text-sm text-gray-600">
                    Pode alterar nomes, áreas, ou remover itens antes de importar
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Importe tudo de uma vez</h3>
                  <p className="text-sm text-gray-600">
                    Um clique e todas as propriedades e terrenos são criados automaticamente
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Dica:</p>
                  <p>
                    Se o seu ficheiro KML não tiver pastas/folders, todos os terrenos serão agrupados
                    numa propriedade chamada "Propriedade Principal" que pode renomear.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseWelcome}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Entendi, começar
              </button>
              <button
                onClick={handleCloseWelcome}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Não mostrar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Importar Terrenos</h1>
              <p className="text-gray-600 mt-1">
                Importe terrenos de KMZ, KML ou GeoJSON
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Como funciona?</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Step 1: Upload File */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-xl font-semibold">Selecionar Ficheiro</h2>
              <p className="text-sm text-gray-600">Escolha o ficheiro KMZ ou KML exportado</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ficheiro Geográfico *
            </label>
            <input
              type="file"
              accept=".kmz,.kml,.json,.geojson"
              onChange={handleFileChange}
              disabled={propriedades.length > 0}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                ✓ Ficheiro: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
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
              disabled={!file || parseMutation.isPending || propriedades.length > 0}
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

            {propriedades.length > 0 && (
              <button
                onClick={() => {
                  setPropriedades([]);
                  setFile(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpar e recomeçar
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Preview & Edit */}
        {propriedades.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Rever e Editar
                </h2>
                <p className="text-sm text-gray-600">
                  {propriedades.length} propriedade(s) e {totalTerrenos} terreno(s) encontrados
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-900">
              <Info className="w-4 h-4 inline mr-2" />
              Pode editar nomes, áreas ou remover itens. As alterações são opcionais.
            </div>

            <div className="space-y-4">
              {propriedades.map((prop, propIndex) => (
                <div key={propIndex} className="border rounded-lg">
                  {/* Propriedade Header */}
                  <div className="bg-gray-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => togglePropriedade(propIndex)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedProps.has(propIndex) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <FolderTree className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={prop.nome}
                          onChange={(e) => handleEditPropriedade(propIndex, 'nome', e.target.value)}
                          className="font-medium text-lg px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-md"
                          placeholder="Nome da propriedade"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {prop.terrenos.length} terreno(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePropriedade(propIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remover propriedade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Terrenos */}
                  {expandedProps.has(propIndex) && (
                    <div className="p-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Nome do Terreno
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Área (ha)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Altitude (m)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Tipo de Solo
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {prop.terrenos.map((terreno, terrenoIndex) => (
                            <tr key={terrenoIndex} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                  <input
                                    type="text"
                                    value={terreno.nome}
                                    onChange={(e) =>
                                      handleEditTerreno(propIndex, terrenoIndex, 'nome', e.target.value)
                                    }
                                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  step="0.0001"
                                  value={terreno.area}
                                  onChange={(e) =>
                                    handleEditTerreno(propIndex, terrenoIndex, 'area', parseFloat(e.target.value))
                                  }
                                  className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={terreno.altitude || ''}
                                  onChange={(e) =>
                                    handleEditTerreno(
                                      propIndex,
                                      terrenoIndex,
                                      'altitude',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="Opcional"
                                  className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={terreno.tipoSolo || ''}
                                  onChange={(e) =>
                                    handleEditTerreno(propIndex, terrenoIndex, 'tipoSolo', e.target.value)
                                  }
                                  placeholder="Opcional"
                                  className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleRemoveTerreno(propIndex, terrenoIndex)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Remover terreno"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Submit */}
        {propriedades.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-xl font-semibold">Confirmar Importação</h2>
                <p className="text-sm text-gray-600">Criar todas as propriedades e terrenos</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-medium mb-2">Pronto para importar:</p>
                  <ul className="space-y-1">
                    <li>✓ <strong>{propriedades.length}</strong> propriedade(s)</li>
                    <li>✓ <strong>{totalTerrenos}</strong> terreno(s)</li>
                    <li>✓ Todas as geometrias e áreas calculadas</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    Após a importação, poderá editar cada item individualmente e adicionar mais detalhes
                    (culturas, ciclos, operações, etc.)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={importMutation.isPending}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A importar...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Importar {propriedades.length} Propriedade(s) e {totalTerrenos} Terreno(s)
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/parcelas')}
                disabled={importMutation.isPending}
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
