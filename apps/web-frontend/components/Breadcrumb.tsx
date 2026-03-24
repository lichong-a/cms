import { cn } from '@cms/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * 面包屑导航组件
 * - 显示层级路径
 * - 当前页不可点击
 * - 分隔符（ChevronRight）
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="面包屑导航"
    >
      <Link
        href="/"
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
