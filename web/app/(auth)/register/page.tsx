'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema, type RegisterFormValues } from '../../../validators/auth';
import { useAuth } from '../../../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isRegistering, isAuthenticated, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/projects');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      await registerUser(values);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121318] flex items-center justify-center p-4 bg-tech-grid">
        <div className="w-full max-w-sm rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-8 text-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-[#1e1f25] border border-[#3c4a42] mx-auto flex items-center justify-center text-[#10b981] animate-pulse">
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </div>
          <p className="text-xs font-mono text-[#bbcabf]">
            {isAuthenticated ? 'Redirecting to your workspace…' : 'Verifying session…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121318] flex items-center justify-center p-4 bg-tech-grid">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#1e1f25] border border-[#3c4a42] items-center justify-center text-[#10b981] mb-3 shadow-lg shadow-black/40">
            <span className="material-symbols-outlined text-[26px]">terminal</span>
          </div>
          <h1 className="text-xl font-bold text-[#e3e1e9] tracking-tight">EnvGuard</h1>
          <p className="text-xs text-[#bbcabf] font-mono mt-1">
            Zero-Plaintext Variable Tracker
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#3c4a42] bg-[#1a1b21] p-6 shadow-2xl shadow-black/80">
          <h2 className="text-sm font-semibold text-[#e3e1e9] mb-4">Create your workspace account</h2>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">FULL NAME</label>
              <Input
                type="text"
                placeholder="Alice Developer"
                icon="person"
                {...register('name')}
                error={errors.name?.message}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">EMAIL</label>
              <Input
                type="email"
                placeholder="alice@corp.com"
                icon="mail"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#bbcabf] mb-1.5">PASSWORD</label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                icon="lock"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isRegistering}
              icon="arrow_forward"
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-[#86948a]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4edea3] hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#86948a] font-mono">
          <Link href="/landing" className="hover:text-[#e3e1e9] transition-colors">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
