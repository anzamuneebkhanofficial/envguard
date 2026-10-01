import { apiClient } from './api/client';
import type { LoginFormValues, RegisterFormValues } from '../validators/auth';

export interface UserSafeProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserSafeProfile;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('envguard_token', token);
    document.cookie = `envguard_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event('auth_change'));
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('envguard_token');
    document.cookie = 'envguard_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    window.dispatchEvent(new Event('auth_change'));
  }
}

export async function apiLogin(values: LoginFormValues): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  if (result.token) {
    setAuthToken(result.token);
  }
  return result;
}

export async function apiRegister(values: RegisterFormValues): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  if (result.token) {
    setAuthToken(result.token);
  }
  return result;
}

export async function apiGetMe(): Promise<UserSafeProfile> {
  return apiClient<UserSafeProfile>('/auth/me');
}

export function apiLogout(): void {
  clearAuthToken();
}
