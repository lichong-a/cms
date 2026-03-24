import { Plus, FolderOpen, Settings, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onNewArticle?: () => void;
  onMediaLibrary?: () => void;
  onSettings?: () => void;
  onStats?: () => void;
}

export default function QuickActions({ 
  onNewArticle, 
  onMediaLibrary, 
  onSettings, 
  onStats 
}: QuickActionsProps) {
  const actions = [
    {
      label: '新建文章',
      icon: <Plus className="w-4 h-4" />,
      onClick: onNewArticle,
      color: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      label: '媒体库',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: onMediaLibrary,
      color: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      label: '系统设置',
      icon: <Settings className="w-4 h-4" />,
      onClick: onSettings,
      color: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      label: '查看统计',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: onStats,
      color: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
    }
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center justify-center p-3 rounded-lg border border-border transition-colors ${action.color}`}
            >
              <span className="mr-2">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
