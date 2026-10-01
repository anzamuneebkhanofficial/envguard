'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGetMe, apiLogin, apiRegister, apiLogout, type UserSafeProfile } from '../lib/auth';
import type { LoginFormValues, RegisterFormValues } from '../validators/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [hasMounted, setHasMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
    const current = typeof window !== 'undefined' ? localStorage.getItem('envguard_token') : null;
    setToken(current);

    const handleAuthChange = () => {
      const updated = typeof window !== 'undefined' ? localStorage.getItem('envguard_token') : null;
      setToken(updated);
      if (!updated) {
        queryClient.setQueryData(['auth', 'me'], null);
      } else {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, [queryClient]);

  const {
    data: user,
    isLoading: isQueryLoading,
    isError,
    refetch,
  } = useQuery<UserSafeProfile | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('envguard_token') : null;
      if (!currentToken) return null;
      try {
        return await apiGetMe();
      } catch {
        apiLogout();
        return null;
      }
    },
    enabled: hasMounted && !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => apiLogin(values),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push('/projects');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) => apiRegister(values),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push('/projects');
    },
  });

  const logout = useCallback((redirectTo: string | null = '/login') => {
    apiLogout();
    setToken(null);
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [queryClient, router]);

  // Loading is true while determining initial client token or while user query is actively fetching
  const isLoading = !hasMounted || (!!token && isQueryLoading);

  return {
    user: user ?? null,
    isAuthenticated: hasMounted && !!token && !!user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
    refetchUser: refetch,
  };
}

