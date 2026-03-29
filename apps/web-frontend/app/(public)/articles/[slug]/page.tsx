import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getApiV1BaseUrl } from '@/lib/api-base-url'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
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

interface ArticleDetailResponse {
  success: boolean
  data: Article
}

const API_BASE_URL = getApiV1BaseUrl()

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/slug/${slug}`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json() as ArticleDetailResponse
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  
  if (!article) {
    return {
      title: '文章未找到',
    }
  }
  
  return {
    title: `${article.title} - CMS 内容管理系统`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      authors: [article.users.username],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 面包屑导航 */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              首页
            </Link>
          </li>
          <li>/</li>
          {article.categories && (
            <>
              <li>
                <Link
                  href={`/categories/${article.categories.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {article.categories.name}
                </Link>
              </li>
              <li>/</li>
            </>
          )}
          <li className="text-foreground font-medium truncate max-w-md">
            {article.title}
          </li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主内容区 */}
        <div className="lg:col-span-2">
          <article>
            {/* 文章头部 */}
            <header className="mb-8">
              {/* 分类标签 */}
              {article.categories && (
                <Link
                  href={`/categories/${article.categories.slug}`}
                  className="inline-block text-sm font-medium text-primary hover:underline mb-4"
                >
                  {article.categories.name}
                </Link>
              )}
              
              {/* 标题 */}
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>
              
              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* 作者 */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <span className="font-medium text-foreground">
                    {article.users.username}
                  </span>
                </div>
                
                {/* 日期 */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <time dateTime={article.published_at || article.created_at}>
                    {formatDate(article.published_at || article.created_at)}
                  </time>
                </div>
                
                {/* 阅读时间 */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">☕</span>
                  <span>
                    {Math.ceil(article.content.length / 500)} 分钟阅读
                  </span>
                </div>
              </div>
            </header>

            {/* 文章内容 */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 标签 */}
            {article.article_tags && article.article_tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                  标签
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {article.article_tags.map(({ tags }) => (
                    <Link
                      key={tags.id}
                      href={`/tags/${tags.slug}`}
                      className="px-4 py-2 bg-secondary hover:bg-secondary/80 
                        rounded-full text-sm transition-colors"
                    >
                      #{tags.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 文章导航 */}
            <div className="mt-12 pt-8 border-t flex justify-between items-center">
              <Link
                href="/"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <span>←</span>
                <span>返回首页</span>
              </Link>
              
              <Link
                href="/categories"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                浏览更多文章
              </Link>
            </div>
          </article>
        </div>

        {/* 侧边栏 */}
        <aside className="lg:col-span-1 space-y-8">
          {/* 作者卡片 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">作者</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 
                flex items-center justify-center text-white font-bold text-lg">
                {article.users.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{article.users.username}</p>
                <p className="text-sm text-muted-foreground">
                  {article.users.email}
                </p>
              </div>
            </div>
          </div>

          {/* 相关文章推荐 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">相关推荐</h3>
            <div className="space-y-4">
              <Link
                href="/categories"
                className="block p-3 rounded hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium line-clamp-2">
                  查看更多 "{article.categories?.name || '未分类'}" 文章
                </p>
              </Link>
              
              {article.article_tags && article.article_tags.length > 0 && (
                <Link
                  href="/tags"
                  className="block p-3 rounded hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-2">
                    探索相关标签
                  </p>
                </Link>
              )}
            </div>
          </div>

          {/* 文章信息 */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">文章信息</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">发布日期</dt>
                <dd className="font-medium">
                  {formatDate(article.published_at || article.created_at)}
                </dd>
              </div>
              
              <div>
                <dt className="text-muted-foreground">文章 ID</dt>
                <dd className="font-medium">#{article.id}</dd>
              </div>
              
              <div>
                <dt className="text-muted-foreground">字数</dt>
                <dd className="font-medium">
                  {article.content.replace(/<[^>]*>/g, '').length} 字
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
