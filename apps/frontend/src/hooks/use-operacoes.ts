import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operacoesApi } from '@/lib/api';
import type { CreateOperacaoDto } from '@/types';

export function useOperacoes(params?: {
  parcelaId?: string;
  tipo?: string;
  operadorId?: string;
}) {
  return useQuery({
    queryKey: ['operacoes', params],
    queryFn: () => operacoesApi.getAll(params),
  });
}

export function useOperacao(id: string) {
  return useQuery({
    queryKey: ['operacoes', id],
    queryFn: () => operacoesApi.getById(id),
    enabled: !!id,
  });
}

export function useOperacoesResumo(params?: {
  parcelaId?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: ['operacoes', 'resumo', params],
    queryFn: () => operacoesApi.getResumo(params),
  });
}

export function useCreateOperacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOperacaoDto) => operacoesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
}

export function useUpdateOperacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOperacaoDto> }) =>
      operacoesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['operacoes', variables.id] });
    },
  });
}

export function useDeleteOperacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => operacoesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });
}
