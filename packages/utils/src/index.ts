// CMS 共享工具函数

import type { PaginationParams, ApiResponse } from '@cms/types';
import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(d);
  } else if (days > 0) {
    return `${days} 天前`;
  } else if (hours > 0) {
    return `${hours} 小时前`;
  } else if (minutes > 0) {
    return `${minutes} 分钟前`;
  } else {
    return '刚刚';
  }
}

/**
 * 生成 slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 构建分页查询参数
 */
export function buildPagination(params: PaginationParams) {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  return {
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  };
}

/**
 * 构建分页响应
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): ApiResponse<T[]> {
  const { page = 1, limit = 20 } = params;
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      timestamp: new Date().toISOString(),
    },
  };
}

// ============================================================================
// UI 工具函数
// ============================================================================

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期（使用 date-fns）
 */
export function formatDateFns(date: string | Date, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * 格式化相对时间（使用 date-fns）
 */
export function formatRelativeTimeFns(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
