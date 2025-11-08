import { apiClient } from './client';
import type { Tarefa, CreateTarefaDto, TarefaStats, EstadoTarefa, PrioridadeTarefa, TipoTarefa } from '@/types';

export const tarefasApi = {
  getAll: async (filters?: {
    estado?: EstadoTarefa;
    prioridade?: PrioridadeTarefa;
    tipo?: TipoTarefa;
    responsavelId?: string;
  }) => {
    const { data } = await apiClient.get<Tarefa[]>('/tarefas', { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Tarefa>(`/tarefas/${id}`);
    return data;
  },

  getUpcoming: async (days: number = 7) => {
    const { data } = await apiClient.get<Tarefa[]>('/tarefas/upcoming', { params: { days } });
    return data;
  },

  getOverdue: async () => {
    const { data } = await apiClient.get<Tarefa[]>('/tarefas/overdue');
    return data;
  },

  getTodayTasks: async () => {
    const { data } = await apiClient.get<Tarefa[]>('/tarefas/today');
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get<TarefaStats>('/tarefas/stats');
    return data;
  },

  getByEstado: async (estado: EstadoTarefa) => {
    const { data } = await apiClient.get<Tarefa[]>(`/tarefas/estado/${estado}`);
    return data;
  },

  getByPrioridade: async (prioridade: PrioridadeTarefa) => {
    const { data } = await apiClient.get<Tarefa[]>(`/tarefas/prioridade/${prioridade}`);
    return data;
  },

  getByResponsavel: async (responsavelId: string) => {
    const { data } = await apiClient.get<Tarefa[]>(`/tarefas/responsavel/${responsavelId}`);
    return data;
  },

  create: async (tarefa: CreateTarefaDto) => {
    const { data } = await apiClient.post<Tarefa>('/tarefas', tarefa);
    return data;
  },

  update: async (id: string, tarefa: Partial<CreateTarefaDto>) => {
    const { data } = await apiClient.patch<Tarefa>(`/tarefas/${id}`, tarefa);
    return data;
  },

  updateEstado: async (id: string, estado: EstadoTarefa) => {
    const { data } = await apiClient.patch<Tarefa>(`/tarefas/${id}/estado`, { estado });
    return data;
  },

  markConcluida: async (id: string) => {
    const { data } = await apiClient.patch<Tarefa>(`/tarefas/${id}/concluir`, {});
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tarefas/${id}`);
  },
};
