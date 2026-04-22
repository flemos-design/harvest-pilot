'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As passwords não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      setSuccess(false);
      await axios.post(`${API_URL}/utilizadores/reset-password`, {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir password');
    }
  };

  return (
    <AuthLayout title="Nova Password" subtitle="Gestão agrícola inteligente">
      {!success ? (
        <>
          <p className="text-sm text-slate-400 mb-6 text-center">
            Introduz a tua nova password. Deve ter pelo menos 6 caracteres.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Nova Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <FormInput
              label="Confirmar Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isSubmitting}
            >
              {isSubmitting ? 'A redefinir...' : 'Redefinir password'}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Password alterada!
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            A tua password foi redefinida com sucesso.
          </p>
          <p className="text-xs text-slate-500">
            A redirecionar para o login...
          </p>
        </div>
      )}

      {!success && (
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
