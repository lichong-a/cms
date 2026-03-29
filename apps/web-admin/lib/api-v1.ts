/**
 * API Client for v1 API
 */

import { getApiV1BaseUrl } from './api-base-url'
import {
  clearSession,
  getAccessToken,
  getCurrentTenant,
  getRefreshToken,
  persistSession,
} from './session'

const API_BASE_URL = getApiV1BaseUrl()

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private baseUrl: string
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return getAccessToken()
  }

  private getTenantSlug(): string {
    return getCurrentTenant() || 'default'
  }

  private getRefreshToken(): string | null {
    return getRefreshToken()
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      this.logout()
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        this.logout()
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        persistSession({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken ?? refreshToken,
        })
      } else {
        this.logout()
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      this.logout()
      throw error
    }
  }

  private logout() {
    if (typeof window !== 'undefined') {
      clearSession({ includeTenant: true })
      window.location.href = '/login'
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 添加租户 header
    const tenantSlug = this.getTenantSlug()
    if (tenantSlug && tenantSlug !== 'default') {
      headers['X-Tenant'] = tenantSlug
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 - Token expired
    if (response.status === 401 && retry) {
      // If already refreshing, wait for it
      if (this.isRefreshing && this.refreshPromise) {
        await this.refreshPromise
      } else if (this.getRefreshToken()) {
        // Start refresh
        this.isRefreshing = true
        this.refreshPromise = this.refreshAccessToken()
        
        try {
          await this.refreshPromise
        } finally {
          this.isRefreshing = false
          this.refreshPromise = null
        }
        
        // Retry the original request with new token
        return this.request<T>(endpoint, options, false)
      } else {
        this.logout()
        throw new Error('Authentication required')
      }
    }

    if (!response.ok) {
      let errorMessage = 'Request failed'
      
      try {
        const error = await response.json()
        // 如果是验证错误， 显示详细字段错误
        if (response.status === 400 && error.details) {
          const fieldErrors = error.details.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
          errorMessage = `Validation failed: ${fieldErrors}`
          console.error('[API Error] Validation details:', error.details)
        } else {
          errorMessage = error.message || error.error?.message || 'Request failed'
        }
        throw new Error(errorMessage)
      } catch {
        throw new Error('Request failed')
      }
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const options: RequestInit = { method: 'POST' }
    if (data !== undefined) {
      options.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, options)
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const options: RequestInit = { method: 'PUT' }
    if (data !== undefined) {
      options.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, options)
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const headers: Record<string, string> = {}
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }

  // 登出方法
  async logoutUser() {
    try {
      await this.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.logout()
    }
  }
}

export const api = new ApiClient(API_BASE_URL)
