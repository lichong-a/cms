/**
 * API Client for v1 API
 */

const getApiBaseUrl = () => {
  if (process.env['NEXT_PUBLIC_API_URL']) {
    return process.env['NEXT_PUBLIC_API_URL']
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3003/api/v1`
  }
  return 'http://localhost:3003/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

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
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getTenantSlug(): string {
    if (typeof window === 'undefined') return 'default'
    return localStorage.getItem('currentTenant') || 'default'
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
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
        localStorage.setItem('accessToken', data.data.accessToken)
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken)
        }
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
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isAuthenticated')
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
      console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`, 'Token:', token.substring(0, 20) + '...')
    } else {
      console.warn(`[API Request] ${options.method || 'GET'} ${endpoint} - No token`)
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
