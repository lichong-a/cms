import { type Article, type User, type ApiResponse } from '@cms/types';

import { getApiOrigin, getApiV1BaseUrl } from './api-base-url';

const API_BASE = getApiOrigin();

/**
 * API Client for making HTTP requests to the backend
 */

const API_BASE_URL = getApiV1BaseUrl();

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Get auth token from localStorage (client-side only)
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('token')
      : null;

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * 获取文章详情
 */
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
      cache: 'no-store', // SSR
    });

    if (!res.ok) return null;

    const data: ApiResponse<Article> = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

/**
 * 获取相关文章
 */
export async function getRelatedArticles(
  slug: string,
  limit: number = 6
): Promise<Article[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/articles/${slug}/related?limit=${limit}`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) return [];

    const data: ApiResponse<Article[]> = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch related articles:', error);
    return [];
  }
}

/**
 * 获取作者信息
 */
export async function getAuthor(authorId: number): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/users/${authorId}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data: ApiResponse<User> = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch author:', error);
    return null;
  }
}
