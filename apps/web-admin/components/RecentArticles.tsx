import { motion } from 'framer-motion';
import { Eye, FileText, Clock } from 'lucide-react';

interface RecentArticlesProps {
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
}

export default function RecentArticles({ articles }: RecentArticlesProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        text: '草稿',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: <FileText className="w-3 h-3" />
      },
      published: {
        text: '已发布',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: <Eye className="w-3 h-3" />
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">最近文章</h3>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {article.title}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  {getStatusBadge(article.status)}
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(article.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4">
          <a href="/admin/articles" className="text-sm text-primary hover:underline">
            查看全部 →
          </a>
        </div>
      </div>
    </div>
  );
}
