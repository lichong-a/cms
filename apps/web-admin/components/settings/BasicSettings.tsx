'use client';

import { Upload, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface BasicSettingsProps {
  initialData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface BasicConfig {
  site_name: string;
  site_description: string;
  site_keywords: string[];
  site_logo: string;
  site_favicon: string;
  site_author: string;
  site_email: string;
  site_url: string;
  icp_number: string;
  copyright_text: string;
}

export default function BasicSettings({ initialData, onChange }: BasicSettingsProps) {
  const [config, setConfig] = useState<BasicConfig>({
    site_name: initialData?.['site_name'] || '',
    site_description: initialData?.['site_description'] || '',
    site_keywords: initialData?.['site_keywords'] || [],
    site_logo: initialData?.['site_logo'] || '',
    site_favicon: initialData?.['site_favicon'] || '',
    site_author: initialData?.['site_author'] || '',
    site_email: initialData?.['site_email'] || '',
    site_url: initialData?.['site_url'] || '',
    icp_number: initialData?.['icp_number'] || '',
    copyright_text: initialData?.['copyright_text'] || '',
  });

  const [keywordInput, setKeywordInput] = useState('');

  const updateConfig = <K extends keyof BasicConfig>(key: K, value: BasicConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !config.site_keywords.includes(keywordInput.trim())) {
      const newKeywords = [...config.site_keywords, keywordInput.trim()];
      updateConfig('site_keywords', newKeywords);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = config.site_keywords.filter(k => k !== keyword);
    updateConfig('site_keywords', newKeywords);
  };

  const handleImageUpload = (field: 'site_logo' | 'site_favicon') => {
    // TODO: 实现图片上传功能
    console.log('Upload image for:', field);
  };

  return (
    <div className="space-y-6">
      {/* 网站名称 */}
      <div>
        <Input
          id="site_name"
          label="网站名称"
          value={config.site_name}
          onChange={(e) => updateConfig('site_name', e.target.value)}
          placeholder="我的博客"
        />
      </div>

      {/* 网站描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          网站描述
        </label>
        <textarea
          id="site_description"
          value={config.site_description}
          onChange={(e) => updateConfig('site_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="网站描述用于SEO和社交媒体展示..."
        />
      </div>

      {/* 关键词 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          关键词
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="输入关键词后按回车添加"
          />
          <Button variant="secondary" onClick={addKeyword}>
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.site_keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          网站 Logo
        </label>
        <div className="flex items-center gap-4">
          {config.site_logo ? (
            <div className="relative">
              <img
                src={config.site_logo}
                alt="Logo"
                className="h-16 w-auto border rounded"
              />
              <button
                onClick={() => updateConfig('site_logo', '')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
              暂无 Logo
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => handleImageUpload('site_logo')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            上传 Logo
          </Button>
        </div>
      </div>

      {/* Favicon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          网站图标 (Favicon)
        </label>
        <div className="flex items-center gap-4">
          {config.site_favicon ? (
            <div className="relative">
              <img
                src={config.site_favicon}
                alt="Favicon"
                className="h-8 w-8 border rounded"
              />
              <button
                onClick={() => updateConfig('site_favicon', '')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-8 w-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
              <Upload className="h-4 w-4" />
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => handleImageUpload('site_favicon')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            上传图标
          </Button>
        </div>
      </div>

      {/* 作者和邮箱 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="site_author"
            label="网站作者"
            value={config.site_author}
            onChange={(e) => updateConfig('site_author', e.target.value)}
            placeholder="作者名称"
          />
        </div>
        <div>
          <Input
            id="site_email"
            label="联系邮箱"
            type="email"
            value={config.site_email}
            onChange={(e) => updateConfig('site_email', e.target.value)}
            placeholder="contact@example.com"
          />
        </div>
      </div>

      {/* 网站地址 */}
      <div>
        <Input
          id="site_url"
          label="网站地址"
          type="url"
          value={config.site_url}
          onChange={(e) => updateConfig('site_url', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {/* ICP 备案号 */}
      <div>
        <Input
          id="icp_number"
          label="ICP 备案号"
          value={config.icp_number}
          onChange={(e) => updateConfig('icp_number', e.target.value)}
          placeholder="京ICP备XXXXXXXX号"
        />
      </div>

      {/* 版权信息 */}
      <div>
        <Input
          id="copyright_text"
          label="版权信息"
          value={config.copyright_text}
          onChange={(e) => updateConfig('copyright_text', e.target.value)}
          placeholder="© 2024 我的博客. All rights reserved."
        />
      </div>
    </div>
  );
}
