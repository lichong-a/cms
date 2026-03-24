/**
 * Authentication utilities
 */

import { api } from './api-v1';

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
    localStorage.setItem('accessToken', response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    localStorage.setItem('isAuthenticated', 'true');
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
    localStorage.setItem('accessToken', response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    localStorage.setItem('isAuthenticated', 'true');
  }
  
  return response;
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
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
  return !!localStorage.getItem('accessToken');
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}
