'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const API = `${window.location.protocol}//${window.location.hostname}:3003/api/v1`

      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const result = await response.json()

      if (result.success) {
        alert('用户创建成功')
        router.push('/admin/users')
      } else {
        alert(result.error || '创建失败')
      }
    } catch (error: any) {
      console.error('创建用户失败:', error)
      alert(error.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <span>←</span>
          <span>返回用户列表</span>
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">新建用户</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">用户名 *</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入用户名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱 *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入邮箱地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">密码 *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入密码"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">角色</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">普通用户</option>
              <option value="editor">编辑</option>
              <option value="admin">管理员</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建用户'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
