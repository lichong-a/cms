/**
 * Authentication utilities
 */

import { api } from './api-v1';
import { clearSession, getAccessToken, hasSession, persistSession } from './session';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  // Store token
  if (typeof window !== 'undefined' && response.success) {
    persistSession({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }
  
  return response;
}

/**
 * Register user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  
  // Store token
  if (typeof window !== 'undefined' && response.success) {
    persistSession({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
  }
  
  return response;
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    clearSession({ includeTenant: true });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return hasSession();
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getAccessToken();
}
