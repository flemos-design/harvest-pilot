'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, UserPlus, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui';

const registerSchema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As passwords não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const { confirmPassword, ...registerData } = data;
      await registerUser({ ...registerData, papel: 'GESTOR' });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tenta novamente.');
    }
  };

  return (
    <AuthLayout title="Criar Conta" subtitle="Gestão agrícola inteligente">
      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Nome Completo"
          icon={<User className="h-4 w-4" />}
          type="text"
          placeholder="João Silva"
          error={errors.nome?.message}
          {...register('nome')}
        />

        <FormInput
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          placeholder="nome@exemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <FormInput
          label="Confirmar Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" size="md" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs text-slate-500">ou</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      {/* Login Link */}
      <Link
        href="/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Já tenho conta
      </Link>
    </AuthLayout>
  );
}
