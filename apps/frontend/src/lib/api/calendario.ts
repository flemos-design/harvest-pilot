import { apiClient } from './client';
import type { CalendarioRegra, CreateCalendarioRegraDto, CalendarioStats } from '@/types';

export const calendarioApi = {
  getAll: async (params?: {
    cultura?: string;
    tipoOperacao?: string;
    regiao?: string;
    mes?: number;
  }) => {
    const { data } = await apiClient.get<CalendarioRegra[]>('/calendario', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<CalendarioRegra>(`/calendario/${id}`);
    return data;
  },

  getByCultura: async (cultura: string) => {
    const { data } = await apiClient.get<CalendarioRegra[]>(`/calendario/cultura/${cultura}`);
    return data;
  },

  getByTipoOperacao: async (tipoOperacao: string) => {
    const { data } = await apiClient.get<CalendarioRegra[]>(`/calendario/tipo-operacao/${tipoOperacao}`);
    return data;
  },

  getByRegiao: async (regiao: string) => {
    const { data } = await apiClient.get<CalendarioRegra[]>(`/calendario/regiao/${regiao}`);
    return data;
  },

  getByMes: async (mes: number) => {
    const { data } = await apiClient.get<CalendarioRegra[]>(`/calendario/mes/${mes}`);
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<CalendarioStats>('/calendario/stats');
    return data;
  },

  create: async (regra: CreateCalendarioRegraDto) => {
    const { data } = await apiClient.post<CalendarioRegra>('/calendario', regra);
    return data;
  },

  update: async (id: string, regra: Partial<CreateCalendarioRegraDto>) => {
    const { data } = await apiClient.patch<CalendarioRegra>(`/calendario/${id}`, regra);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/calendario/${id}`);
  },
};
