import { type Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '标签 - CMS 内容管理系统',
  description: '浏览所有文章标签',
}

export const dynamic = 'force-dynamic'

interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  _count?: {
    articles: number
  }
}

interface TagsResponse {
  success: boolean
  data: Tag[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.185:3003/api/v1'

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

export default async function TagsPage() {
  const tagsData = await getTags()
  const tags = tagsData.data || []
  
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">首页</Link>
          <span className="mx-2">/</span>
          <span>标签</span>
        </nav>
        <h1 className="text-4xl font-bold mb-4">文章标签</h1>
        <p className="text-muted-foreground">浏览所有标签，发现更多精彩内容</p>
      </header>

      {tags.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold mb-2">暂无标签</h3>
          <p className="text-muted-foreground">还没有创建任何标签</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="group inline-flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-accent transition-all duration-300 hover:shadow-md"
            >
              <span className="font-medium group-hover:text-primary transition-colors">
                #{tag.name}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {tag._count?.articles || 0}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* 统计 */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        共 {tags.length} 个标签
      </div>
    </div>
  )
}
