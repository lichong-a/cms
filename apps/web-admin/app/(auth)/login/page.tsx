'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { api } from '@/lib/api-v1'

interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      name: string
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password })

      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('isAuthenticated', 'true')
        router.push('/admin')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败，请重试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-lg shadow-md p-6 lg:p-8 border border-border">
        <h1 className="text-xl lg:text-2xl font-bold text-center mb-6 text-card-foreground">CMS 管理后台</h1>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
