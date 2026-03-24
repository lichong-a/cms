'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { TiptapEditor } from '@/components/editor'
import { api } from '@/lib/api-v1'

interface Category {
  id: number
  name: string
}

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

export default function NewArticlePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagNames, setTagNames] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.get<CategoriesResponse>('/categories')
      if (response.success && response.data) {
        setCategories(response.data)
      }
    } catch (err) {
      console.error('加载分类失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('请输入文章标题')
      return
    }

    setSaving(true)
    setError('')

    try {
      // 处理标签（将逗号分隔的字符串转为数组）
      const tags = tagNames
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // 生成 slug（基于标题）
      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '')

      // 转换状态为大写（后端期望）
      const statusUpper = status.toUpperCase() as 'DRAFT' | 'PUBLISHED'
      
      console.log('[文章创建] 状态转换:', {
        '原始状态': status,
        '转换后状态': statusUpper
      })

      const payload = {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt.trim() || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        status: statusUpper,
      }
      
      console.log('[文章创建] 发送数据:', payload)
      
      const response = await api.post<{ success: boolean }>('/articles', payload)
      
      console.log('[文章创建] 响应:', response)

      if (response.success) {
        console.log('[文章创建] 成功，跳转到列表页')
        router.push('/admin/articles')
      } else {
        console.error('[文章创建] 失败:', response)
        setError('创建失败，请重试')
      }
    } catch (err) {
      console.error('[文章创建] 异常:', err)
      const errorResponse = err as Error
      setError(errorResponse.message || '创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold">新建文章</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="输入文章标题"
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              文章摘要
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="简短描述这篇文章的内容..."
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              文章内容
            </label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="开始编写你的文章..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                id="tags"
                type="text"
                value={tagNames}
                onChange={(e) => setTagNames(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="标签1, 标签2, 标签3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发布状态
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value as 'draft')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">草稿</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'published')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">发布</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存文章'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
