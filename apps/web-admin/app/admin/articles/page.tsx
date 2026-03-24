'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

import { StatusBadge } from '@/components/StatusBadge'
import { api } from '@/lib/api-v1'

interface Article {
  id: string
  title: string
  excerpt?: string
  category?: { name: string }
  status: string
  createdAt?: string
  created_at?: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const res = await api.get<{ success: boolean; data: Article[] }>('/articles')
      if (res.success) setArticles(res.data || [])
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    try {
      await api.delete(`/articles/${id}`)
      setArticles(articles.filter(a => a.id !== id))
    } catch {
      alert('删除失败')
    }
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-'
    try {
      const date = new Date(d)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('zh-CN')
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl lg:text-2xl font-bold">文章管理</h1>
        <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center text-sm lg:text-base">
          + 新建文章
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无文章</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden sm:table-cell">分类</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden md:table-cell">日期</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{article.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{article.category?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(article.created_at || article.createdAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/admin/articles/${article.id}/edit`} className="text-blue-600 hover:underline text-sm">编辑</Link>
                      <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:underline text-sm">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
