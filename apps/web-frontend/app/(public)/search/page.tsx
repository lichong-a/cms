import { Search } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'

import { getApiV1BaseUrl } from '@/lib/api-base-url'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
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

const API_BASE_URL = getApiV1BaseUrl()

async function searchArticles(query: string, page: number = 1) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/articles?page=${page}&limit=9&search=${encodeURIComponent(query)}&status=PUBLISHED`,
      { cache: 'no-store' }
    )
    
    if (!res.ok) throw new Error('Failed to search articles')
    
    return res.json() as Promise<ArticlesResponse>
  } catch (error) {
    console.error('Error searching articles:', error)
    return {
      success: false,
      data: [],
      meta: { page: 1, limit: 9, total: 0, totalPages: 0 }
    }
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  
  if (!q) {
    return {
      title: '搜索 - CMS 内容管理系统',
      description: '搜索文章',
    }
  }
  
  return {
    title: `搜索 "${q}" - CMS 内容管理系统`,
    description: `搜索包含 "${q}" 的文章`,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams
  const query = q || ''
  const currentPage = parseInt(pageParam || '1', 10)
  
  const articlesData = query ? await searchArticles(query, currentPage) : null
  const articles = articlesData?.data || []
  const meta = articlesData?.meta

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 标题 */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">搜索文章</h1>
        <p className="text-muted-foreground">在全站文章中搜索你感兴趣的内容</p>
      </header>

      {/* 搜索框 */}
      <div className="max-w-2xl mx-auto mb-12">
        <form method="get" className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="输入关键词搜索..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            搜索
          </button>
        </form>
        
        {/* 热门搜索 */}
        <div className="mt-4 flex gap-2 flex-wrap items-center">
          <span className="text-sm text-muted-foreground">热门搜索:</span>
          {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((keyword) => (
            <Link
              key={keyword}
              href={`/search?q=${encodeURIComponent(keyword)}`}
              className="text-xs px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
            >
              {keyword}
            </Link>
          ))}
        </div>
      </div>

      {/* 搜索结果 */}
      {!query ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">开始搜索</h3>
          <p className="text-muted-foreground">输入关键词来搜索文章</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">未找到结果</h3>
          <p className="text-muted-foreground mb-8">
            没有找到包含 "<span className="font-medium">{query}</span>" 的文章
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-6 py-3 border rounded-lg hover:bg-accent transition-colors"
            >
              清除搜索
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              浏览全部文章
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 结果统计 */}
          <div className="mb-8 text-center">
            <p className="text-muted-foreground">
              找到 <span className="font-semibold text-foreground">{meta?.total}</span> 篇包含 "
              <span className="font-semibold text-foreground">{query}</span>" 的文章
            </p>
          </div>

          {/* 文章列表 */}
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
                  {article.categories && (
                    <Link
                      href={`/categories/${article.categories.slug}`}
                      className="text-xs font-medium text-primary hover:underline mb-2 inline-block"
                    >
                      {article.categories.name}
                    </Link>
                  )}

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
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                    className="px-4 py-2 border rounded hover:bg-accent transition-colors"
                  >
                    上一页
                  </Link>
                )}
                
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (meta.totalPages <= 5) return true
                    if (page === 1 || page === meta.totalPages) return true
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
                        href={`/search?q=${encodeURIComponent(query)}&page=${page}`}
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
                
                {currentPage < meta.totalPages && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
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
