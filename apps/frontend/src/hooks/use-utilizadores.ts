import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilizadoresApi } from '@/lib/api';
import type { CreateUtilizadorDto, UpdateUtilizadorDto, LoginDto, ChangePasswordDto } from '@/types';

export function useUtilizadores(organizacaoId?: string) {
  return useQuery({
    queryKey: ['utilizadores', organizacaoId],
    queryFn: () => utilizadoresApi.getAll(organizacaoId),
  });
}

export function useUtilizador(id: string) {
  return useQuery({
    queryKey: ['utilizadores', id],
    queryFn: () => utilizadoresApi.getById(id),
    enabled: !!id,
  });
}

export function useUtilizadorByEmail(email: string) {
  return useQuery({
    queryKey: ['utilizadores', 'email', email],
    queryFn: () => utilizadoresApi.getByEmail(email),
    enabled: !!email,
  });
}

export function useUtilizadoresStats(organizacaoId?: string) {
  return useQuery({
    queryKey: ['utilizadores', 'stats', organizacaoId],
    queryFn: () => utilizadoresApi.getStats(organizacaoId),
  });
}

export function useCreateUtilizador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUtilizadorDto) => utilizadoresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
    },
  });
}

export function useUpdateUtilizador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUtilizadorDto }) =>
      utilizadoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, passwords }: { id: string; passwords: ChangePasswordDto }) =>
      utilizadoresApi.changePassword(id, passwords),
  });
}

export function useDeleteUtilizador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => utilizadoresApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginDto) => utilizadoresApi.login(credentials),
  });
}
