'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      setSuccess(false);
      await axios.post(`${API_URL}/utilizadores/forgot-password`, data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar email de recuperação');
    }
  };

  return (
    <AuthLayout title="Recuperar Password" subtitle="Gestão agrícola inteligente">
      {!success ? (
        <>
          <p className="text-sm text-slate-400 mb-6 text-center">
            Introduz o teu email e enviaremos um link para redefinires a password.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="nome@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isSubmitting}
            >
              {isSubmitting ? 'A enviar...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Email enviado!</h2>
          <p className="text-sm text-slate-400 mb-4">
            Se o email existir na nossa base de dados, receberás um link de recuperação em breve.
          </p>
          <p className="text-xs text-slate-500">
            Não te esqueças de verificar a pasta de spam.
          </p>
        </div>
      )}

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    </AuthLayout>
  );
}
