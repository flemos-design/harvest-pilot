import { apiClient } from './client';
import type { Parcela, CreateParcelaDto, ParcelaStats } from '@/types';

export const parcelasApi = {
  getAll: async (propriedadeId?: string) => {
    const params = propriedadeId ? { propriedadeId } : {};
    const { data } = await apiClient.get<Parcela[]>('/parcelas', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Parcela>(`/parcelas/${id}`);
    return data;
  },

  getStats: async (id: string) => {
    const { data } = await apiClient.get<ParcelaStats>(`/parcelas/${id}/stats`);
    return data;
  },

  create: async (parcela: CreateParcelaDto) => {
    const { data } = await apiClient.post<Parcela>('/parcelas', parcela);
    return data;
  },

  update: async (id: string, parcela: Partial<CreateParcelaDto>) => {
    const { data } = await apiClient.patch<Parcela>(`/parcelas/${id}`, parcela);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/parcelas/${id}`);
  },
};
