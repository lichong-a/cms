'use client'

import { useState, useEffect } from 'react'

interface Tag {
  id: string
  name: string
  slug: string
  description?: string
}

const API = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:3003/api/v1`
  : 'http://localhost:3003/api/v1'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  return res.json()
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const r = await fetchAPI<{ success: boolean; data: Tag[] }>('/tags')
      if (r.success) setTags(r.data || [])
    } catch {
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await fetchAPI(`/tags/${editingId}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await fetchAPI('/tags', { method: 'POST', body: JSON.stringify(form) })
      }
      setForm({ name: '', slug: '', description: '' })
      setEditingId(null)
      load()
    } catch {
      alert('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    try {
      await fetchAPI(`/tags/${id}`, { method: 'DELETE' })
      load()
    } catch {
      alert('删除失败')
    }
  }

  const handleEdit = (t: Tag) => {
    setForm({ name: t.name, slug: t.slug, description: t.description || '' })
    setEditingId(t.id)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">标签管理</h1>
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
            {tags && tags.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div><span className="font-medium">{t.name}</span><span className="ml-2 text-sm text-gray-500">{t.slug}</span></div>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(t)} className="text-blue-600 text-sm">编辑</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-600 text-sm">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
