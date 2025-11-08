import { apiClient } from './client';
import type { Insumo, CreateInsumoDto } from '@/types';

export const insumosApi = {
  getAll: async (categoria?: string) => {
    const params = categoria ? { categoria } : {};
    const { data } = await apiClient.get<Insumo[]>('/insumos', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Insumo>(`/insumos/${id}`);
    return data;
  },

  getLowStock: async () => {
    const { data } = await apiClient.get<Insumo[]>('/insumos/low-stock');
    return data;
  },

  getExpiringSoon: async (days: number = 30) => {
    const { data } = await apiClient.get<Insumo[]>('/insumos/expiring-soon', { params: { days } });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/insumos/stats');
    return data;
  },

  create: async (insumo: CreateInsumoDto) => {
    const { data } = await apiClient.post<Insumo>('/insumos', insumo);
    return data;
  },

  update: async (id: string, insumo: Partial<CreateInsumoDto>) => {
    const { data } = await apiClient.patch<Insumo>(`/insumos/${id}`, insumo);
    return data;
  },

  adjustStock: async (id: string, quantidade: number) => {
    const { data } = await apiClient.patch<Insumo>(`/insumos/${id}/adjust-stock`, { quantidade });
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/insumos/${id}`);
  },
};
