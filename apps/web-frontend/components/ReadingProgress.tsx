'use client';

import { cn } from '@cms/utils';
import { useEffect, useState } from 'react';

/**
 * 阅读进度条组件
 * 监听滚动事件，显示当前阅读进度
 */
export function ReadingProgress({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // 初始化

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200/50 backdrop-blur-sm',
        className
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
