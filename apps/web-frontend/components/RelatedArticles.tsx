'use client';

import { type Article } from '@cms/types';
import { cn } from '@cms/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/Card';

interface RelatedArticlesProps {
  articles: Article[];
  className?: string;
  maxDisplay?: number;
}

/**
 * 相关文章组件
 * - 水平滚动卡片列表
 * - 或网格布局
 * - 最多显示指定数量
 */
export function RelatedArticles({
  articles,
  className,
  maxDisplay = 6,
}: RelatedArticlesProps) {
  const displayArticles = articles.slice(0, maxDisplay);

  if (displayArticles.length === 0) return null;

  return (
    <div className={cn('', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        相关文章
      </h3>

      {/* 桌面端：网格布局 */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayArticles.map((article) => (
          <RelatedArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* 移动端：水平滚动 */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4" style={{ width: 'max-content' }}>
          {displayArticles.map((article) => (
            <div key={article.id} className="w-64 flex-shrink-0">
              <RelatedArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: Article }) {
  // 计算阅读时间（假设每分钟阅读 300 字）
  const readingTime = article.metadata?.['readingTime'] || 3;

  return (
    <Link href={`/article/${article.slug}`}>
      <Card hoverable className="h-full overflow-hidden">
        {/* 封面图 */}
        {article.coverImage && (
          <div className="relative w-full h-32">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 256px, (max-width: 1024px) 300px, 250px"
            />
          </div>
        )}

        <div className="p-4">
          {/* 标题 */}
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
            {article.title}
          </h4>

          {/* 元信息 */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(article.createdAt), 'yyyy-MM-dd', {
                locale: zhCN,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime} 分钟
            </span>
          </div>

          {/* 摘要 */}
          {article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {article.excerpt}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
