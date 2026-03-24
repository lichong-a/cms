import { type Metadata } from 'next'
import Link from 'next/link'

import { StaggeredList, StaggeredItem } from '@/components/animations'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: '首页 - CMS 内容管理系统',
  description: '欢迎来到 CMS 内容管理系统，浏览最新文章',
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
  author_id: number
  category_id: number | null
  users: {
    id: number
    username: string
    email: string
    avatarUrl: string | null
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
  description?: string
  articleCount: number
}

interface Tag {
  id: number
  name: string
  slug: string
  articleCount: number
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

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

interface TagsResponse {
  success: boolean
  data: Tag[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.185:3003/api/v1'

async function getArticles(page: number = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles?page=${page}&limit=9&status=PUBLISHED`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch articles')
    }
    
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

async function getTags() {
  try {
    const res = await fetch(`${API_BASE_URL}/tags`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch tags')
    }
    
    return res.json() as Promise<TagsResponse>
  } catch (error) {
    console.error('Error fetching tags:', error)
    return {
      success: false,
      data: []
    }
  }
}

async function getStats() {
  try {
    // 并行获取所有数据来计算统计信息
    const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
      getArticles(1),
      getCategories(),
      getTags()
    ])
    
    return {
      articles: articlesRes.meta?.total || 0,
      categories: categoriesRes.data?.length || 0,
      tags: tagsRes.data?.length || 0,
      users: 1 // 暂时硬编码，后续可以从 API 获取
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      articles: 0,
      categories: 0,
      tags: 0,
      users: 0
    }
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  
  // 并行获取所有数据
  const [articlesData, categoriesData, tagsData, statsData] = await Promise.all([
    getArticles(currentPage),
    getCategories(),
    getTags(),
    getStats()
  ])
  
  const articles = articlesData.data || []
  const { totalPages } = articlesData.meta
  const categories = categoriesData.data || []
  const tags = tagsData.data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* 主内容区 - 文章列表 */}
        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">最新文章</h1>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页
              </p>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
              <p className="text-muted-foreground">
                还没有发布任何文章，请稍后再来查看
              </p>
            </div>
          ) : (
            <>
              <StaggeredList className="grid md:grid-cols-2 gap-6 mb-8">
                {articles.map((article) => (
                  <StaggeredItem key={article.id}>
                    <article
                      className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* 封面占位 */}
                      <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold opacity-30">
                          {article.title.charAt(0)}
                        </span>
                      </div>

                      <div className="p-6">
                        {/* 分类 */}
                        {article.categories && (
                          <Link
                            href={`/categories/${article.categories.slug}`}
                            className="text-xs font-medium text-primary hover:underline mb-2 inline-block"
                          >
                            {article.categories.name}
                          </Link>
                        )}

                        {/* 标题 */}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link href={`/articles/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>

                        {/* 摘要 */}
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        {/* 元信息 */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>👤</span>
                            <span>{article.users.username}</span>
                          </div>
                          <span>
                            {new Date(article.published_at || article.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>

                        {/* 标签 */}
                        {article.article_tags && article.article_tags.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {article.article_tags.slice(0, 3).map((at) => (
                              <Link
                                key={at.tags.id}
                                href={`/tags/${at.tags.slug}`}
                                className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80 transition-colors"
                              >
                                #{at.tags.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </StaggeredItem>
                ))}
              </StaggeredList>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/?page=${currentPage - 1}`}
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
                            href={`/?page=${page}`}
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
                        href={`/?page=${currentPage + 1}`}
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
        </main>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <Sidebar 
            categories={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              _count: { articles: cat.articleCount || 0 }
            }))}
            tags={tags.map(tag => ({
              id: tag.id,
              name: tag.name,
              slug: tag.slug,
              _count: { articles: tag.articleCount || 0 }
            }))}
            recentArticles={articles.slice(0, 5).map(article => ({
              id: article.id,
              title: article.title,
              slug: article.slug
            }))}
            stats={statsData}
          />
        </div>
      </div>
    </div>
  )
}
