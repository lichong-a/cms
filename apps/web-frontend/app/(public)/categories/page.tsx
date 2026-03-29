import { type Metadata } from 'next'
import Link from 'next/link'

import { getApiV1BaseUrl } from '@/lib/api-base-url'

export const metadata: Metadata = {
  title: '分类 - CMS 内容管理系统',
  description: '浏览所有文章分类',
}

export const dynamic = 'force-dynamic'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
  _count?: {
    articles: number
  }
}

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

const API_BASE_URL = getApiV1BaseUrl()

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories')
    }
    
    return res.json() as Promise<CategoriesResponse>
  } catch (error) {
    console.error('Error fetching categories:', error)
    return {
      success: false,
      data: []
    }
  }
}

export default async function CategoriesPage() {
  const categoriesData = await getCategories()
  const categories = categoriesData.data || []
  
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">首页</Link>
          <span className="mx-2">/</span>
          <span>分类</span>
        </nav>
        <h1 className="text-4xl font-bold mb-4">文章分类</h1>
        <p className="text-muted-foreground">浏览所有文章分类，找到你感兴趣的内容</p>
      </header>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold mb-2">暂无分类</h3>
          <p className="text-muted-foreground">还没有创建任何分类</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group border rounded-lg p-6 hover:bg-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                  {category._count?.articles || 0} 篇
                </span>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                点击查看 →
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 统计 */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        共 {categories.length} 个分类
      </div>
    </div>
  )
}
