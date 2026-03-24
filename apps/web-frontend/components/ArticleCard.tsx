'use client';

import type { Article, Category } from '@cms/types';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article & {
    category?: Category;
    author?: {
      username: string;
      avatarUrl?: string;
    };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: string | Date | number) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.article
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-glass"
    >
      {/* 封面图 */}
      <Link href={`/article/${article.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            // 渐变占位
            <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold opacity-20">
                {article.title.charAt(0)}
              </span>
            </div>
          )}
          {/* 分类标签 */}
          {article.category && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white shadow-sm">
              {article.category.name}
            </span>
          )}
        </div>
      </Link>

      {/* 内容区 */}
      <div className="p-5">
        {/* 标题 */}
        <Link href={`/article/${article.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* 摘要 */}
        {article.excerpt && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* 作者 */}
            {article.author && (
              <div className="flex items-center gap-1.5">
                {article.author.avatarUrl ? (
                  <img
                    src={article.author.avatarUrl}
                    alt={article.author.username}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{article.author.username}</span>
              </div>
            )}
            {/* 发布日期 */}
            {article.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            )}
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-3 text-gray-400">
            <span>{article.viewCount || 0} 阅读</span>
            <span>{article.likeCount || 0} 赞</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// 骨架屏
export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-glass animate-pulse">
      {/* 封面占位 */}
      <div className="aspect-[16/10] bg-gray-300/50 dark:bg-gray-700/50" />
      
      {/* 内容占位 */}
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
