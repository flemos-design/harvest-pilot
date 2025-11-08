import { apiClient } from './client';
import type { Operacao, CreateOperacaoDto, OperacoesResumo } from '@/types';

export const operacoesApi = {
  getAll: async (params?: {
    parcelaId?: string;
    tipo?: string;
    operadorId?: string;
  }) => {
    const { data } = await apiClient.get<Operacao[]>('/operacoes', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Operacao>(`/operacoes/${id}`);
    return data;
  },

  getResumo: async (params?: {
    parcelaId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    const { data } = await apiClient.get<OperacoesResumo>('/operacoes/resumo', {
      params,
    });
    return data;
  },

  create: async (operacao: CreateOperacaoDto) => {
    const { data } = await apiClient.post<Operacao>('/operacoes', operacao);
    return data;
  },

  update: async (id: string, operacao: Partial<CreateOperacaoDto>) => {
    const { data } = await apiClient.patch<Operacao>(`/operacoes/${id}`, operacao);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/operacoes/${id}`);
  },
};
