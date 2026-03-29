import { type Metadata } from 'next'
import Link from 'next/link'

import { getApiV1BaseUrl } from '@/lib/api-base-url'

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: string
  created_at: string
  published_at: string | null
  users: {
    id: number
    username: string
    email: string
  }
  categories: {
    id: number
    name: string
    slug: string
  } | null
  article_tags: {
    tags: {
      id: number
      name: string
      slug: string
    }
  }[]
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

interface ArticlesResponse {
  success: boolean
  data: Article[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CategoryResponse {
  success: boolean
  data: Category
}

const API_BASE_URL = getApiV1BaseUrl()

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/slug/${slug}`, {
      cache: 'no-store',
    })
    
    if (!res.ok) return null
    
    const data = await res.json() as CategoryResponse
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getArticlesByCategory(categoryId: number, page: number = 1) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/articles?page=${page}&limit=9&categoryId=${categoryId}&status=PUBLISHED`,
      { cache: 'no-store' }
    )
    
    if (!res.ok) throw new Error('Failed to fetch articles')
    
    return res.json() as Promise<ArticlesResponse>
  } catch (error) {
    console.error('Error fetching articles:', error)
    return {
      success: false,
      data: [],
      meta: { page: 1, limit: 9, total: 0, totalPages: 0 }
    }
  }
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  
  if (!category) {
    return { title: '分类未找到' }
  }
  
  return {
    title: `${category.name} - CMS 内容管理系统`,
    description: category.description || `浏览 ${category.name} 分类下的所有文章`,
  }
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = parseInt(pageParam || '1', 10)
  
  const category = await getCategory(slug)
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">分类未找到</h1>
          <p className="text-muted-foreground mb-8">该分类不存在或已被删除</p>
          <Link
            href="/categories"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            返回分类列表
          </Link>
        </div>
      </div>
    )
  }
  
  const articlesData = await getArticlesByCategory(category.id, currentPage)
  const articles = articlesData.data || []
  const { totalPages, total } = articlesData.meta

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 面包屑 */}
      <nav className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-primary">分类</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* 标题 */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground text-lg">{category.description}</p>
        )}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>📝 {total} 篇文章</span>
          {totalPages > 1 && (
            <span>📄 第 {currentPage} 页，共 {totalPages} 页</span>
          )}
        </div>
      </header>

      {/* 文章列表 */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
          <p className="text-muted-foreground">该分类下还没有发布任何文章</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-5xl font-bold opacity-30">
                    {article.title.charAt(0)}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>👤 {article.users.username}</span>
                    <span>
                      {new Date(article.published_at || article.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {article.article_tags && article.article_tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {article.article_tags.slice(0, 3).map((at) => (
                        <Link
                          key={at.tags.id}
                          href={`/tags/${at.tags.slug}`}
                          className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
                        >
                          #{at.tags.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/categories/${slug}?page=${currentPage - 1}`}
                    className="px-4 py-2 border rounded hover:bg-accent transition-colors"
                  >
                    上一页
                  </Link>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 2) return true
                    return false
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span key={`ellipsis-${page}`} className="px-4 py-2">...</span>
                      )
                    }
                    return (
                      <Link
                        key={page}
                        href={`/categories/${slug}?page=${page}`}
                        className={`px-4 py-2 border rounded transition-colors ${
                          page === currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {page}
                      </Link>
                    )
                  })}
                
                {currentPage < totalPages && (
                  <Link
                    href={`/categories/${slug}?page=${currentPage + 1}`}
                    className="px-4 py-2 border rounded hover:bg-accent transition-colors"
                  >
                    下一页
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
