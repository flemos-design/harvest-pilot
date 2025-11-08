import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarioApi } from '@/lib/api';
import type { CreateCalendarioRegraDto } from '@/types';

export function useCalendario(params?: {
  cultura?: string;
  tipoOperacao?: string;
  regiao?: string;
  mes?: number;
}) {
  return useQuery({
    queryKey: ['calendario', params],
    queryFn: () => calendarioApi.getAll(params),
  });
}

export function useCalendarioRegra(id: string) {
  return useQuery({
    queryKey: ['calendario', id],
    queryFn: () => calendarioApi.getById(id),
    enabled: !!id,
  });
}

export function useCalendarioByCultura(cultura: string) {
  return useQuery({
    queryKey: ['calendario', 'cultura', cultura],
    queryFn: () => calendarioApi.getByCultura(cultura),
    enabled: !!cultura,
  });
}

export function useCalendarioByTipoOperacao(tipoOperacao: string) {
  return useQuery({
    queryKey: ['calendario', 'tipoOperacao', tipoOperacao],
    queryFn: () => calendarioApi.getByTipoOperacao(tipoOperacao),
    enabled: !!tipoOperacao,
  });
}

export function useCalendarioByRegiao(regiao: string) {
  return useQuery({
    queryKey: ['calendario', 'regiao', regiao],
    queryFn: () => calendarioApi.getByRegiao(regiao),
    enabled: !!regiao,
  });
}

export function useCalendarioByMes(mes: number) {
  return useQuery({
    queryKey: ['calendario', 'mes', mes],
    queryFn: () => calendarioApi.getByMes(mes),
    enabled: mes >= 1 && mes <= 12,
  });
}

export function useCalendarioStats() {
  return useQuery({
    queryKey: ['calendario', 'stats'],
    queryFn: () => calendarioApi.getStats(),
  });
}

export function useCreateCalendarioRegra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCalendarioRegraDto) => calendarioApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
    },
  });
}

export function useUpdateCalendarioRegra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCalendarioRegraDto> }) =>
      calendarioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
    },
  });
}

export function useDeleteCalendarioRegra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
    },
  });
}
