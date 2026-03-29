'use client'

import { useState, useEffect } from 'react'

import { getApiV1BaseUrl } from '@/lib/api-base-url'
import { getAccessToken } from '@/lib/session'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  _count?: { articles: number }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${getApiV1BaseUrl()}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  return res.json()
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const r = await fetchAPI<{ success: boolean; data: Category[] }>('/categories')
      if (r.success) setCategories(r.data || [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await fetchAPI(`/categories/${editingId}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await fetchAPI('/categories', { method: 'POST', body: JSON.stringify(form) })
      }
      setForm({ name: '', slug: '', description: '' })
      setEditingId(null)
      load()
    } catch {
      alert('保存失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    try {
      await fetchAPI(`/categories/${id}`, { method: 'DELETE' })
      load()
    } catch {
      alert('删除失败')
    }
  }

  const handleEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '' })
    setEditingId(String(c.id))
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">分类管理</h1>
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 pb-6 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input placeholder="名称" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 border rounded-md" required />
            <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="px-3 py-2 border rounded-md" required />
            <input placeholder="描述" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingId ? '更新' : '创建'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({ name: '', slug: '', description: '' })}} className="ml-2 px-4 py-2 bg-gray-200 rounded-md">取消</button>}
        </form>
        {loading ? <div className="p-4 text-center text-gray-500">加载中...</div> : (
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div><span className="font-medium">{c.name}</span><span className="ml-2 text-sm text-gray-500">{c.slug}</span></div>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 text-sm">编辑</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 text-sm">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
