'use client';

import { cn } from '@cms/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5,
}: PaginationProps) {
  // 生成页码数组（智能省略）
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxPageButtons) {
      // 如果总页数少于最大按钮数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 否则显示部分页码 + 省略号
      const half = Math.floor(maxPageButtons / 2);
      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxPageButtons - 1);
      
      // 调整起始位置
      if (end - start < maxPageButtons - 1) {
        start = Math.max(1, end - maxPageButtons + 1);
      }
      
      // 显示第一页
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('ellipsis');
        }
      }
      
      // 中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 显示最后一页
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="分页导航">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        )}
        aria-label="上一页"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">上一页</span>
      </button>

      {/* 页码 */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                aria-label={`第 ${page} 页`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        )}
        aria-label="下一页"
      >
        <span className="hidden sm:inline">下一页</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* 页码信息 */}
      <div className="hidden md:flex items-center text-sm text-gray-600 ml-4">
        <span>
          第 {currentPage} / {totalPages} 页
        </span>
      </div>
    </nav>
  );
}
