'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { StaggeredList, StaggeredItem } from '@/components/animations';
import { api } from '@/lib/api-v1';

interface DashboardStats {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  userCount: number;
  mediaCount: number;
  recentArticles: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    publishedAt: string | null;
    author: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
      if (response.success) {
        setStats(response.data);
      } else {
        setError('加载统计数据失败');
      }
    } catch (err) {
      console.error('加载统计失败:', err);
      setError('加载统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
      PENDING: { label: '待审', className: 'bg-yellow-100 text-yellow-700' },
      PUBLISHED: { label: '已发布', className: 'bg-green-100 text-green-700' },
      ARCHIVED: { label: '归档', className: 'bg-gray-100 text-gray-500' },
      SCHEDULED: { label: '定时', className: 'bg-blue-100 text-blue-700' },
    };
    const config = statusMap[status] || statusMap['DRAFT']!;
    return (
      <span className={`text-xs px-2 py-1 rounded ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">仪表盘</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">仪表盘</h1>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-destructive">{error}</div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-foreground">仪表盘</h1>

      <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StaggeredItem>
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
            className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
          >
            <div className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">文章总数</div>
            <div className="text-2xl lg:text-3xl font-bold text-card-foreground">{stats.articleCount}</div>
          </motion.div>
        </StaggeredItem>

        <StaggeredItem>
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
            className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
          >
            <div className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">分类数量</div>
            <div className="text-2xl lg:text-3xl font-bold text-card-foreground">{stats.categoryCount}</div>
          </motion.div>
        </StaggeredItem>

        <StaggeredItem>
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
            className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
          >
            <div className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">标签数量</div>
            <div className="text-2xl lg:text-3xl font-bold text-card-foreground">{stats.tagCount}</div>
          </motion.div>
        </StaggeredItem>

        <StaggeredItem>
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
            className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
          >
            <div className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">媒体文件</div>
            <div className="text-2xl lg:text-3xl font-bold text-card-foreground">{stats.mediaCount}</div>
          </motion.div>
        </StaggeredItem>
      </StaggeredList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
        >
          <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-card-foreground">最近文章</h2>
          <div className="space-y-2 lg:space-y-3">
            {stats.recentArticles.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">暂无文章</div>
            ) : (
              stats.recentArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xs lg:text-sm truncate text-card-foreground">{article.title}</span>
                    {getStatusBadge(article.status)}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{article.author}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg shadow p-4 lg:p-6 border border-border"
        >
          <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-card-foreground">系统状态</h2>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex justify-between items-center text-sm text-card-foreground">
              <span>API 状态</span>
              <span className="text-green-600">✓ 正常</span>
            </div>
            <div className="flex justify-between items-center text-sm text-card-foreground">
              <span>数据库状态</span>
              <span className="text-green-600">✓ 正常</span>
            </div>
            <div className="flex justify-between items-center text-sm text-card-foreground">
              <span>用户总数</span>
              <span className="text-muted-foreground">{stats.userCount}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
