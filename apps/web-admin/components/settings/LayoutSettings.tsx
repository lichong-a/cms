'use client';

import { cn } from '@cms/utils';
import { useState } from 'react';

interface LayoutSettingsProps {
  initialData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface LayoutConfig {
  navbar_style: 'standard' | 'centered' | 'minimal';
  sidebar_position: 'left' | 'right' | 'none';
  sidebar_width: string;
  footer_style: 'simple' | 'extended' | 'minimal';
  article_list_style: 'list' | 'grid' | 'card';
  article_card_layout: 'vertical' | 'horizontal';
  home_page_layout: 'blog' | 'magazine' | 'portfolio';
  container_max_width: string;
}

const navbarStyles = [
  { value: 'standard', label: '标准导航', description: 'Logo 在左，菜单在右' },
  { value: 'centered', label: '居中导航', description: 'Logo 居中，菜单两侧' },
  { value: 'minimal', label: '极简导航', description: '仅显示 Logo 和汉堡菜单' },
];

const sidebarPositions = [
  { value: 'left', label: '左侧', description: '侧边栏在左侧' },
  { value: 'right', label: '右侧', description: '侧边栏在右侧' },
  { value: 'none', label: '无', description: '不显示侧边栏' },
];

const footerStyles = [
  { value: 'simple', label: '简洁', description: '仅显示版权信息' },
  { value: 'extended', label: '扩展', description: '包含链接和社交媒体' },
  { value: 'minimal', label: '极简', description: '单行文字' },
];

const articleListStyles = [
  { value: 'list', label: '列表', description: '垂直列表形式' },
  { value: 'grid', label: '网格', description: '多列网格布局' },
  { value: 'card', label: '卡片', description: '大卡片样式' },
];

const homePageLayouts = [
  { value: 'blog', label: '博客', description: '传统博客布局' },
  { value: 'magazine', label: '杂志', description: '杂志风格，突出特色文章' },
  { value: 'portfolio', label: '作品集', description: '展示作品风格' },
];

const containerWidthOptions = [
  { value: 'max-w-5xl', label: '小 (1024px)' },
  { value: 'max-w-6xl', label: '中 (1152px)' },
  { value: 'max-w-7xl', label: '大 (1280px)' },
  { value: 'max-w-full', label: '全宽' },
];

export default function LayoutSettings({ initialData, onChange }: LayoutSettingsProps) {
  const [config, setConfig] = useState<LayoutConfig>({
    navbar_style: initialData?.['navbar_style'] || 'standard',
    sidebar_position: initialData?.['sidebar_position'] || 'right',
    sidebar_width: initialData?.['sidebar_width'] || '300px',
    footer_style: initialData?.['footer_style'] || 'extended',
    article_list_style: initialData?.['article_list_style'] || 'list',
    article_card_layout: initialData?.['article_card_layout'] || 'vertical',
    home_page_layout: initialData?.['home_page_layout'] || 'blog',
    container_max_width: initialData?.['container_max_width'] || 'max-w-7xl',
  });

  const updateConfig = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-8">
      {/* 导航栏样式 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">导航栏样式</h3>
        <div className="grid grid-cols-3 gap-4">
          {navbarStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => updateConfig('navbar_style', style.value as LayoutConfig['navbar_style'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.navbar_style === style.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{style.label}</p>
              <p className="text-sm text-gray-500 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 侧边栏位置 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">侧边栏位置</h3>
        <div className="grid grid-cols-3 gap-4">
          {sidebarPositions.map((pos) => (
            <button
              key={pos.value}
              onClick={() => updateConfig('sidebar_position', pos.value as LayoutConfig['sidebar_position'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.sidebar_position === pos.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{pos.label}</p>
              <p className="text-sm text-gray-500 mt-1">{pos.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 页脚样式 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">页脚样式</h3>
        <div className="grid grid-cols-3 gap-4">
          {footerStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => updateConfig('footer_style', style.value as LayoutConfig['footer_style'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.footer_style === style.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{style.label}</p>
              <p className="text-sm text-gray-500 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表样式 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">文章列表样式</h3>
        <div className="grid grid-cols-3 gap-4">
          {articleListStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => updateConfig('article_list_style', style.value as LayoutConfig['article_list_style'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.article_list_style === style.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{style.label}</p>
              <p className="text-sm text-gray-500 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 首页布局 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">首页布局</h3>
        <div className="grid grid-cols-3 gap-4">
          {homePageLayouts.map((layout) => (
            <button
              key={layout.value}
              onClick={() => updateConfig('home_page_layout', layout.value as LayoutConfig['home_page_layout'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.home_page_layout === layout.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{layout.label}</p>
              <p className="text-sm text-gray-500 mt-1">{layout.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 容器宽度 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">容器最大宽度</h3>
        <div className="grid grid-cols-4 gap-2">
          {containerWidthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateConfig('container_max_width', option.value)}
              className={cn(
                'px-4 py-2 text-sm border rounded-md transition-colors',
                config.container_max_width === option.value
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 布局预览 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">布局预览</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="mb-4">
            {/* Navbar Preview */}
            <div className="h-12 bg-gray-300 rounded flex items-center justify-between px-4">
              <div className="h-6 w-20 bg-gray-400 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-gray-400 rounded" />
                <div className="h-4 w-12 bg-gray-400 rounded" />
                <div className="h-4 w-12 bg-gray-400 rounded" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            {/* Sidebar Preview */}
            {config.sidebar_position !== 'none' && (
              <div 
                className={cn(
                  'h-32 bg-gray-200 rounded flex-shrink-0',
                  config.sidebar_position === 'left' && 'order-first',
                  config.sidebar_position === 'right' && 'order-last'
                )}
                style={{ width: '100px' }}
              >
                <div className="p-2 space-y-2">
                  <div className="h-3 w-full bg-gray-300 rounded" />
                  <div className="h-3 w-4/5 bg-gray-300 rounded" />
                  <div className="h-3 w-full bg-gray-300 rounded" />
                </div>
              </div>
            )}
            
            {/* Content Preview */}
            <div className="flex-1 h-32 bg-white border rounded p-4">
              {config.article_list_style === 'list' && (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              )}
              {config.article_list_style === 'grid' && (
                <div className="grid grid-cols-2 gap-2 h-full">
                  <div className="bg-gray-200 rounded" />
                  <div className="bg-gray-200 rounded" />
                </div>
              )}
              {config.article_list_style === 'card' && (
                <div className="h-full bg-gray-200 rounded" />
              )}
            </div>
          </div>
          
          <div className="mt-4">
            {/* Footer Preview */}
            <div className="h-12 bg-gray-300 rounded flex items-center justify-center">
              <div className="h-3 w-40 bg-gray-400 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
