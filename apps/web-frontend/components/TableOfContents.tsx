'use client';

import { cn } from '@cms/utils';
import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocItem[];
  className?: string;
}

/**
 * 目录导航组件
 * - IntersectionObserver 高亮当前章节
 * - 点击平滑滚动到对应位置
 * - sticky 定位
 */
export function TableOfContents({
  headings,
  className,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // 观察所有标题元素
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // 顶部导航栏高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className={cn('sticky top-24', className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-100">
        目录
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                'text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors',
                heading.level === 2 && 'pl-3',
                heading.level === 3 && 'pl-6',
                heading.level === 4 && 'pl-9',
                activeId === heading.id
                  ? 'text-primary-600 bg-primary-50 font-medium dark:text-primary-400 dark:bg-primary-900/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
