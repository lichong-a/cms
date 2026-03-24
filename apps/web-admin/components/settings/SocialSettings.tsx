'use client';

import { cn } from '@cms/utils';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Instagram,
  Facebook,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface SocialSettingsProps {
  initialData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  sortOrder: number;
}

const platformOptions = [
  { value: 'website', label: '网站', icon: Globe },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'wechat', label: 'WeChat', icon: MessageCircle },
];

const getIconComponent = (platform: string) => {
  const option = platformOptions.find(p => p.value === platform);
  return option?.icon || Globe;
};

export default function SocialSettings({ initialData, onChange }: SocialSettingsProps) {
  const [links, setLinks] = useState<SocialLink[]>(
    initialData?.['social_links'] || []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<Partial<SocialLink>>({
    platform: '',
    label: '',
    url: '',
  });

  const updateLinks = (newLinks: SocialLink[]) => {
    setLinks(newLinks);
    onChange({ social_links: newLinks });
  };

  const addLink = () => {
    if (!newLink.platform || !newLink.url) return;

    const link: SocialLink = {
      id: `link_${Date.now()}`,
      platform: newLink.platform,
      label: newLink.label || platformOptions.find(p => p.value === newLink.platform)?.label || '',
      url: newLink.url,
      icon: newLink.platform,
      sortOrder: links.length,
    };

    updateLinks([...links, link]);
    setNewLink({ platform: '', label: '', url: '' });
  };

  const removeLink = (id: string) => {
    const newLinks = links.filter(l => l.id !== id);
    updateLinks(newLinks);
  };

  const updateLink = (id: string, updates: Partial<SocialLink>) => {
    const newLinks = links.map(l => 
      l.id === id ? { ...l, ...updates } : l
    );
    updateLinks(newLinks);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex] as SocialLink, newLinks[index] as SocialLink];
    
    // Update sort order
    newLinks.forEach((link, idx) => {
      link.sortOrder = idx;
    });
    
    updateLinks(newLinks);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">社交链接</h3>
        <p className="text-sm text-gray-500 mb-6">
          添加您的社交媒体链接，它们将显示在网站上
        </p>
      </div>

      {/* 添加新链接 */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-4">添加新链接</h4>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              平台
            </label>
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">选择平台</option>
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <Input
              label="显示名称"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              placeholder="留空使用平台名称"
            />
          </div>
          <div className="col-span-5">
            <Input
              label="链接地址"
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="col-span-1 flex items-end">
            <Button
              variant="primary"
              onClick={addLink}
              disabled={!newLink.platform || !newLink.url}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 链接列表 */}
      <div className="space-y-2">
        {links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无社交链接，请添加
          </div>
        ) : (
          links.map((link, index) => {
            const IconComponent = getIconComponent(link.platform);
            
            return (
              <div
                key={link.id}
                className={cn(
                  'flex items-center gap-4 p-4 border rounded-lg bg-white',
                  editingId === link.id && 'border-primary-500 bg-primary-50'
                )}
              >
                {/* 拖拽和排序 */}
                <div className="flex items-center gap-1 text-gray-400">
                  <GripVertical className="h-5 w-5 cursor-move" />
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveLink(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveLink(index, 'down')}
                      disabled={index === links.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* 图标 */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  {editingId === link.id ? (
                    <div className="space-y-2">
                      <Input
                        value={link.label}
                        onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        placeholder="显示名称"
                      />
                      <Input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="链接地址"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">{link.label}</p>
                      <p className="text-sm text-gray-500 truncate">{link.url}</p>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editingId === link.id ? null : link.id)}
                  >
                    {editingId === link.id ? '完成' : '编辑'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(link.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* URL 验证提示 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 URL 格式提示</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 请确保 URL 以 http:// 或 https:// 开头</li>
          <li>• Email 链接格式: mailto:your@email.com</li>
          <li>• 链接会在新窗口中打开</li>
        </ul>
      </div>
    </div>
  );
}
