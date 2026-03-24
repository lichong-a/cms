'use client';

import { type Article, ContentStatus } from '@cms/types';
import { formatDate , cn } from '@cms/utils';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ArticleTableProps {
  articles: Article[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  loading?: boolean;
}

export default function ArticleTable({
  articles,
  onEdit,
  onDelete,
  onBulkDelete,
  loading = false,
}: ArticleTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => String(a.id))));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && confirm(`确定要删除选中的 ${selectedIds.size} 篇文章吗？`)) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    const styles: Record<ContentStatus, string> = {
      [ContentStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [ContentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [ContentStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
      [ContentStatus.DELETED]: 'bg-red-100 text-red-800',
    };

    const labels: Record<ContentStatus, string> = {
      [ContentStatus.PUBLISHED]: '已发布',
      [ContentStatus.DRAFT]: '草稿',
      [ContentStatus.ARCHIVED]: '已归档',
      [ContentStatus.DELETED]: '已删除',
    };

    return (
      <span className={cn('px-2 py-1 text-xs rounded-full font-medium', styles[status])}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无文章</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-primary-700">
            已选择 {selectedIds.size} 篇文章
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            批量删除
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === articles.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                封面
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(String(article.id))}
                    onChange={() => toggleSelect(String(article.id))}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </td>
                <td className="px-4 py-4">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">无封面</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-md">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </div>
                    {article.excerpt && (
                      <div className="text-sm text-gray-500 truncate">
                        {article.excerpt}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {article.categoryId ? `分类 ${article.categoryId}` : '-'}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(article.status)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {formatDate(article.createdAt as string, 'MM-dd')}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(String(article.id))}
                      className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这篇文章吗？')) {
                          onDelete(String(article.id));
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
