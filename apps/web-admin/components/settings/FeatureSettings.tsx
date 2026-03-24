'use client';

import { cn } from '@cms/utils';
import { useState } from 'react';

interface FeatureSettingsProps {
  initialData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface FeatureConfig {
  enable_comments: boolean;
  enable_search: boolean;
  enable_share: boolean;
  enable_rss: boolean;
  enable_registration: boolean;
  enable_dark_mode: boolean;
  enable_reading_progress: boolean;
  enable_table_of_contents: boolean;
  enable_related_articles: boolean;
  enable_author_card: boolean;
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          checked ? 'bg-primary-500' : 'bg-gray-200'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

const features = [
  {
    key: 'enable_comments' as const,
    label: '启用评论',
    description: '允许访客在文章下发表评论',
  },
  {
    key: 'enable_search' as const,
    label: '启用搜索',
    description: '提供全站搜索功能',
  },
  {
    key: 'enable_share' as const,
    label: '启用分享',
    description: '显示社交分享按钮',
  },
  {
    key: 'enable_rss' as const,
    label: '启用 RSS',
    description: '提供 RSS 订阅功能',
  },
  {
    key: 'enable_registration' as const,
    label: '允许注册',
    description: '允许新用户注册账号',
  },
  {
    key: 'enable_dark_mode' as const,
    label: '深色模式',
    description: '支持深色/浅色模式切换',
  },
  {
    key: 'enable_reading_progress' as const,
    label: '阅读进度',
    description: '在文章页显示阅读进度条',
  },
  {
    key: 'enable_table_of_contents' as const,
    label: '目录导航',
    description: '在文章页显示目录导航',
  },
  {
    key: 'enable_related_articles' as const,
    label: '相关文章',
    description: '在文章底部显示相关推荐',
  },
  {
    key: 'enable_author_card' as const,
    label: '作者卡片',
    description: '在文章底部显示作者信息卡片',
  },
];

export default function FeatureSettings({ initialData, onChange }: FeatureSettingsProps) {
  const [config, setConfig] = useState<FeatureConfig>({
    enable_comments: initialData?.['enable_comments'] ?? true,
    enable_search: initialData?.['enable_search'] ?? true,
    enable_share: initialData?.['enable_share'] ?? true,
    enable_rss: initialData?.['enable_rss'] ?? true,
    enable_registration: initialData?.['enable_registration'] ?? false,
    enable_dark_mode: initialData?.['enable_dark_mode'] ?? true,
    enable_reading_progress: initialData?.['enable_reading_progress'] ?? true,
    enable_table_of_contents: initialData?.['enable_table_of_contents'] ?? true,
    enable_related_articles: initialData?.['enable_related_articles'] ?? true,
    enable_author_card: initialData?.['enable_author_card'] ?? true,
  });

  const updateConfig = <K extends keyof FeatureConfig>(key: K, value: FeatureConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">功能开关</h3>
        <p className="text-sm text-gray-500 mb-6">
          开启或关闭网站功能，某些功能可能需要额外配置
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {features.map((feature) => (
          <Switch
            key={feature.key}
            checked={config[feature.key]}
            onChange={(checked) => updateConfig(feature.key, checked)}
            label={feature.label}
            description={feature.description}
          />
        ))}
      </div>

      {/* 功能说明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 某些功能可能需要额外的服务支持（如评论系统）</li>
          <li>• 关闭功能后，相关UI元素将不再显示</li>
          <li>• 深色模式会自动根据系统偏好显示切换按钮</li>
          <li>• 搜索功能需要建立索引才能使用</li>
        </ul>
      </div>
    </div>
  );
}
