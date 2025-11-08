import { apiClient } from './client';
import type {
  Utilizador,
  CreateUtilizadorDto,
  UpdateUtilizadorDto,
  LoginDto,
  ChangePasswordDto,
  UtilizadorStats,
} from '@/types';

export const utilizadoresApi = {
  getAll: async (organizacaoId?: string) => {
    const params = organizacaoId ? { organizacaoId } : undefined;
    const { data } = await apiClient.get<Utilizador[]>('/utilizadores', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Utilizador>(`/utilizadores/${id}`);
    return data;
  },

  getByEmail: async (email: string) => {
    const { data } = await apiClient.get<Utilizador>(`/utilizadores/email/${email}`);
    return data;
  },

  getStats: async (organizacaoId?: string) => {
    const params = organizacaoId ? { organizacaoId } : undefined;
    const { data } = await apiClient.get<UtilizadorStats>('/utilizadores/stats', { params });
    return data;
  },

  create: async (utilizador: CreateUtilizadorDto) => {
    const { data } = await apiClient.post<Utilizador>('/utilizadores', utilizador);
    return data;
  },

  update: async (id: string, utilizador: UpdateUtilizadorDto) => {
    const { data } = await apiClient.patch<Utilizador>(`/utilizadores/${id}`, utilizador);
    return data;
  },

  changePassword: async (id: string, passwords: ChangePasswordDto) => {
    const { data } = await apiClient.patch<{ message: string }>(
      `/utilizadores/${id}/password`,
      passwords
    );
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/utilizadores/${id}`);
  },

  login: async (credentials: LoginDto) => {
    const { data } = await apiClient.post<Utilizador>('/utilizadores/login', credentials);
    return data;
  },
};
