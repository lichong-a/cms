'use client';

import { type User } from '@cms/types';
import { cn } from '@cms/utils';
import { User as UserIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/Button';

interface AuthorCardProps {
  author: User;
  className?: string;
  showFollowButton?: boolean;
}

/**
 * 作者卡片组件
 * - 显示头像、名称、简介
 * - 可选的关注按钮
 */
export function AuthorCard({
  author,
  className,
  showFollowButton = false,
}: AuthorCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-start space-x-4">
        {/* 头像 */}
        <div className="flex-shrink-0">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.username}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {author.username}
          </h3>

          {author.metadata?.['bio'] && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {author.metadata['bio']}
            </p>
          )}

          {showFollowButton && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                // TODO: 实现关注逻辑
              }}
            >
              关注
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
