import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insumosApi } from '@/lib/api';
import type { CreateInsumoDto } from '@/types';

export function useInsumos(categoria?: string) {
  return useQuery({
    queryKey: ['insumos', categoria],
    queryFn: () => insumosApi.getAll(categoria),
  });
}

export function useInsumo(id: string) {
  return useQuery({
    queryKey: ['insumos', id],
    queryFn: () => insumosApi.getById(id),
    enabled: !!id,
  });
}

export function useLowStockInsumos() {
  return useQuery({
    queryKey: ['insumos', 'low-stock'],
    queryFn: () => insumosApi.getLowStock(),
  });
}

export function useExpiringSoonInsumos(days: number = 30) {
  return useQuery({
    queryKey: ['insumos', 'expiring-soon', days],
    queryFn: () => insumosApi.getExpiringSoon(days),
  });
}

export function useInsumosStats() {
  return useQuery({
    queryKey: ['insumos', 'stats'],
    queryFn: () => insumosApi.getStats(),
  });
}

export function useCreateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInsumoDto) => insumosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInsumoDto> }) =>
      insumosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantidade }: { id: string; quantidade: number }) =>
      insumosApi.adjustStock(id, quantidade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => insumosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}
