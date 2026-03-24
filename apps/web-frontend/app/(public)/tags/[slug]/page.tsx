import { type Metadata } from 'next'
import Link from 'next/link'

interface TagDetailPageProps {
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

interface Tag {
  id: number
  name: string
  slug: string
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

interface TagResponse {
  success: boolean
  data: Tag
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.185:3003/api/v1'

async function getTag(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/tags/slug/${slug}`, {
      cache: 'no-store',
    })
    
    if (!res.ok) return null
    
    const data = await res.json() as TagResponse
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

async function getArticlesByTag(tagId: number, page: number = 1) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/articles?page=${page}&limit=9&tagId=${tagId}&status=PUBLISHED`,
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

export async function generateMetadata({ params }: TagDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)
  
  if (!tag) {
    return { title: '标签未找到' }
  }
  
  return {
    title: `#${tag.name} - CMS 内容管理系统`,
    description: `浏览标签 #${tag.name} 下的所有文章`,
  }
}

export default async function TagDetailPage({ params, searchParams }: TagDetailPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = parseInt(pageParam || '1', 10)
  
  const tag = await getTag(slug)
  
  if (!tag) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">标签未找到</h1>
          <p className="text-muted-foreground mb-8">该标签不存在或已被删除</p>
          <Link
            href="/tags"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            返回标签列表
          </Link>
        </div>
      </div>
    )
  }
  
  const articlesData = await getArticlesByTag(tag.id, currentPage)
  const articles = articlesData.data || []
  const { totalPages, total } = articlesData.meta

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 面包屑 */}
      <nav className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="hover:text-primary">标签</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">#{tag.name}</span>
      </nav>

      {/* 标题 */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-primary">#</span>{tag.name}
        </h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
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
          <p className="text-muted-foreground">该标签下还没有发布任何文章</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
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
                          className={`text-xs px-2 py-1 rounded hover:bg-secondary/80 ${
                            at.tags.id === tag.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}
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
                    href={`/tags/${slug}?page=${currentPage - 1}`}
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
                        href={`/tags/${slug}?page=${page}`}
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
                    href={`/tags/${slug}?page=${currentPage + 1}`}
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
