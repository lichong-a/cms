'use client';

import type { Article, Category } from '@cms/types';

import { ArticleCard, ArticleCardSkeleton } from './ArticleCard';

interface ArticleListProps {
  articles: (Article & {
    category?: Category;
    author?: {
      username: string;
      avatarUrl?: string;
    };
  })[];
  loading?: boolean;
  emptyText?: string;
}

export function ArticleList({ articles, loading, emptyText = '暂无文章' }: ArticleListProps) {
  // 加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 空状态
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <p className="text-lg">{emptyText}</p>
      </div>
    );
  }

  // 文章列表
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
