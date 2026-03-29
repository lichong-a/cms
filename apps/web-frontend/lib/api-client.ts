/**
 * API Client for CMS Web Frontend
 */

import { getApiV1BaseUrl } from './api-base-url'

const API_BASE_URL = getApiV1BaseUrl()

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // 文章相关 API
  async getArticles(params?: { page?: number; limit?: number; category?: string; tag?: string }) {
    if (!params) {
      return this.fetch<{ data: unknown[]; total: number }>('/articles')
    }

    return this.fetch<{ data: unknown[]; total: number }>('/articles', { params })
  }

  async getArticleBySlug(slug: string) {
    return this.fetch<{ data: unknown }>(`/articles/${slug}`)
  }

  // 分类相关 API
  async getCategories() {
    return this.fetch<{ data: unknown[] }>('/categories')
  }

  async getCategoryBySlug(slug: string) {
    return this.fetch<{ data: unknown }>(`/categories/${slug}`)
  }

  // 标签相关 API
  async getTags() {
    return this.fetch<{ data: unknown[] }>('/tags')
  }

  async getTagBySlug(slug: string) {
    return this.fetch<{ data: unknown }>(`/tags/${slug}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
