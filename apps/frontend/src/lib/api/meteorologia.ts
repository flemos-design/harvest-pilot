import { apiClient } from './client';
import type { MeteoParcela, CreateMeteoParcelaDto, MeteoStats } from '@/types';

export const meteorologiaApi = {
  getAll: async (parcelaId?: string, fonte?: string) => {
    const params: any = {};
    if (parcelaId) params.parcelaId = parcelaId;
    if (fonte) params.fonte = fonte;

    const { data } = await apiClient.get<MeteoParcela[]>('/meteorologia', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<MeteoParcela>(`/meteorologia/${id}`);
    return data;
  },

  getLatestByParcela: async (parcelaId: string) => {
    const { data } = await apiClient.get<MeteoParcela>(`/meteorologia/latest/${parcelaId}`);
    return data;
  },

  getForecast: async (parcelaId: string, days: number = 7) => {
    const { data } = await apiClient.get<MeteoParcela[]>(
      `/meteorologia/forecast/${parcelaId}`,
      { params: { days } }
    );
    return data;
  },

  getHistorico: async (parcelaId: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const { data } = await apiClient.get<MeteoParcela[]>(
      `/meteorologia/historico/${parcelaId}`,
      { params }
    );
    return data;
  },

  getStats: async (parcelaId: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const { data } = await apiClient.get<MeteoStats>(
      `/meteorologia/stats/${parcelaId}`,
      { params }
    );
    return data;
  },

  create: async (meteo: CreateMeteoParcelaDto) => {
    const { data } = await apiClient.post<MeteoParcela>('/meteorologia', meteo);
    return data;
  },

  update: async (id: string, meteo: Partial<CreateMeteoParcelaDto>) => {
    const { data } = await apiClient.patch<MeteoParcela>(`/meteorologia/${id}`, meteo);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/meteorologia/${id}`);
  },
};
