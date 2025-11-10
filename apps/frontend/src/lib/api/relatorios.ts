import { apiClient } from './client';

export const relatoriosApi = {
  /**
   * Download PDF report of operations within a date range
   */
  downloadOperacoesPDF: async (dataInicio: Date, dataFim: Date): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/relatorios/operacoes/pdf', {
      params: {
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
      },
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Download Caderno de Campo PDF for a parcela
   */
  downloadCadernoCampoPDF: async (
    parcelaId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<Blob> => {
    const params: any = { parcelaId };
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();

    const { data } = await apiClient.get<Blob>('/relatorios/caderno-campo/pdf', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
