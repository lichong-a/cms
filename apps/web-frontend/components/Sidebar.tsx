'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SidebarProps {
  categories?: Array<{ id: number; name: string; slug: string; _count?: { articles: number } }>
  tags?: Array<{ id: number; name: string; slug: string; _count?: { articles: number } }>
  recentArticles?: Array<{ id: number; title: string; slug: string }>
  stats?: {
    articles: number
    categories: number
    tags: number
    users: number
  }
}

const sidebarVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: '100%',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  }
}

export function Sidebar({ categories, tags, recentArticles, stats }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* 移动端展开按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
      
      {/* 移动端遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* 侧边栏 */}
      <AnimatePresence>
        {(isOpen || typeof window === 'undefined' || window.innerWidth >= 1024) && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              fixed lg:sticky top-0 lg:top-8 right-0 h-full lg:h-auto
              w-80 lg:w-full z-50 lg:z-auto
              bg-white lg:bg-transparent
              overflow-y-auto p-6 lg:p-0
              space-y-6
              lg:transform-none
            `}
          >
        {/* 移动端关闭按钮 */}
        <button
          className="lg:hidden absolute top-4 right-4 p-2"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* 统计信息 */}
        {stats && (
          <div className="p-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/80 dark:from-gray-900/60 dark:to-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-glass">
            <h3 className="font-semibold mb-3">📊 统计</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-bold text-2xl">{stats.articles}</div>
                <div className="text-muted-foreground">文章</div>
              </div>
              <div>
                <div className="font-bold text-2xl">{stats.categories}</div>
                <div className="text-muted-foreground">分类</div>
              </div>
              <div>
                <div className="font-bold text-2xl">{stats.tags}</div>
                <div className="text-muted-foreground">标签</div>
              </div>
              <div>
                <div className="font-bold text-2xl">{stats.users}</div>
                <div className="text-muted-foreground">用户</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 分类 */}
        {categories && categories.length > 0 && (
          <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 shadow-glass">
            <h3 className="font-semibold mb-3">📁 分类</h3>
            <div className="space-y-2">
              {categories.slice(0, 5).map(category => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category._count?.articles || 0}
                  </span>
                </Link>
              ))}
            </div>
            {categories.length > 5 && (
              <Link
                href="/categories"
                className="block text-sm text-primary mt-3 hover:underline"
              >
                查看全部 →
              </Link>
            )}
          </div>
        )}
        
        {/* 标签云 */}
        {tags && tags.length > 0 && (
          <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 shadow-glass">
            <h3 className="font-semibold mb-3">🏷️ 标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 15).map(tag => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="text-xs px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
            {tags.length > 15 && (
              <Link
                href="/tags"
                className="block text-sm text-primary mt-3 hover:underline"
              >
                查看全部 →
              </Link>
            )}
          </div>
        )}
        
        {/* 最新文章 */}
        {recentArticles && recentArticles.length > 0 && (
          <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 shadow-glass">
            <h3 className="font-semibold mb-3">📖 最新文章</h3>
            <div className="space-y-3">
              {recentArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="block text-sm hover:text-primary transition-colors line-clamp-2"
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
