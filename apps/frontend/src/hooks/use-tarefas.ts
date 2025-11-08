import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tarefasApi } from '@/lib/api';
import type { CreateTarefaDto, EstadoTarefa, PrioridadeTarefa, TipoTarefa } from '@/types';

export function useTarefas(filters?: {
  estado?: EstadoTarefa;
  prioridade?: PrioridadeTarefa;
  tipo?: TipoTarefa;
  responsavelId?: string;
}) {
  return useQuery({
    queryKey: ['tarefas', filters],
    queryFn: () => tarefasApi.getAll(filters),
  });
}

export function useTarefa(id: string) {
  return useQuery({
    queryKey: ['tarefas', id],
    queryFn: () => tarefasApi.getById(id),
    enabled: !!id,
  });
}

export function useUpcomingTarefas(days: number = 7) {
  return useQuery({
    queryKey: ['tarefas', 'upcoming', days],
    queryFn: () => tarefasApi.getUpcoming(days),
  });
}

export function useOverdueTarefas() {
  return useQuery({
    queryKey: ['tarefas', 'overdue'],
    queryFn: () => tarefasApi.getOverdue(),
  });
}

export function useTodayTarefas() {
  return useQuery({
    queryKey: ['tarefas', 'today'],
    queryFn: () => tarefasApi.getTodayTasks(),
  });
}

export function useTarefasStats() {
  return useQuery({
    queryKey: ['tarefas', 'stats'],
    queryFn: () => tarefasApi.getStats(),
  });
}

export function useTarefasByEstado(estado: EstadoTarefa) {
  return useQuery({
    queryKey: ['tarefas', 'estado', estado],
    queryFn: () => tarefasApi.getByEstado(estado),
  });
}

export function useTarefasByPrioridade(prioridade: PrioridadeTarefa) {
  return useQuery({
    queryKey: ['tarefas', 'prioridade', prioridade],
    queryFn: () => tarefasApi.getByPrioridade(prioridade),
  });
}

export function useTarefasByResponsavel(responsavelId: string) {
  return useQuery({
    queryKey: ['tarefas', 'responsavel', responsavelId],
    queryFn: () => tarefasApi.getByResponsavel(responsavelId),
    enabled: !!responsavelId,
  });
}

export function useCreateTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTarefaDto) => tarefasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });
}

export function useUpdateTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTarefaDto> }) =>
      tarefasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });
}

export function useUpdateTarefaEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTarefa }) =>
      tarefasApi.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });
}

export function useMarkTarefaConcluida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tarefasApi.markConcluida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });
}

export function useDeleteTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tarefasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
    },
  });
}
