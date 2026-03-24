'use client';

import { cn } from '@cms/utils';
import { useState } from 'react';

import { Input } from '@/components/Input';

interface SeoSettingsProps {
  initialData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

interface SeoConfig {
  meta_title_template: string;
  meta_description_template: string;
  og_image: string;
  twitter_card_type: 'summary' | 'summary_large_image';
  robots_txt: string;
  sitemap_enabled: boolean;
  sitemap_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  google_site_verification: string;
  baidu_site_verification: string;
  bing_site_verification: string;
  structured_data_enabled: boolean;
}

const twitterCardTypes = [
  { value: 'summary', label: '摘要卡片', description: '小图预览' },
  { value: 'summary_large_image', label: '大图卡片', description: '大图预览' },
];

const sitemapFrequencies = [
  { value: 'always', label: '始终' },
  { value: 'hourly', label: '每小时' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
  { value: 'never', label: '从不' },
];

export default function SeoSettings({ initialData, onChange }: SeoSettingsProps) {
  const [config, setConfig] = useState<SeoConfig>({
    meta_title_template: initialData?.['meta_title_template'] || '{title} | {site_name}',
    meta_description_template: initialData?.['meta_description_template'] || '',
    og_image: initialData?.['og_image'] || '',
    twitter_card_type: initialData?.['twitter_card_type'] || 'summary_large_image',
    robots_txt: initialData?.['robots_txt'] || `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: {site_url}/sitemap.xml`,
    sitemap_enabled: initialData?.['sitemap_enabled'] ?? true,
    sitemap_frequency: initialData?.['sitemap_frequency'] || 'daily',
    google_site_verification: initialData?.['google_site_verification'] || '',
    baidu_site_verification: initialData?.['baidu_site_verification'] || '',
    bing_site_verification: initialData?.['bing_site_verification'] || '',
    structured_data_enabled: initialData?.['structured_data_enabled'] ?? true,
  });

  const updateConfig = <K extends keyof SeoConfig>(key: K, value: SeoConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-8">
      {/* Meta 标题模板 */}
      <div>
        <Input
          id="meta_title_template"
          label="Meta 标题模板"
          value={config.meta_title_template}
          onChange={(e) => updateConfig('meta_title_template', e.target.value)}
          placeholder="{title} | {site_name}"
        />
        <p className="mt-2 text-sm text-gray-500">
          可用变量: {'{title}'}, {'{site_name}'}, {'{category}'}, {'{tag}'}
        </p>
      </div>

      {/* Meta 描述模板 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meta 描述模板
        </label>
        <textarea
          id="meta_description_template"
          value={config.meta_description_template}
          onChange={(e) => updateConfig('meta_description_template', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="留空则使用网站描述或文章摘要"
        />
      </div>

      {/* Open Graph 图片 */}
      <div>
        <Input
          id="og_image"
          label="默认分享图片 (OG Image)"
          value={config.og_image}
          onChange={(e) => updateConfig('og_image', e.target.value)}
          placeholder="https://example.com/og-image.jpg"
        />
        <p className="mt-2 text-sm text-gray-500">
          推荐尺寸: 1200x630px，用于社交媒体分享时显示
        </p>
      </div>

      {/* Twitter 卡片类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Twitter 卡片类型
        </label>
        <div className="grid grid-cols-2 gap-4">
          {twitterCardTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateConfig('twitter_card_type', type.value as SeoConfig['twitter_card_type'])}
              className={cn(
                'p-4 text-left border-2 rounded-lg transition-all',
                config.twitter_card_type === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{type.label}</p>
              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sitemap 配置 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Sitemap 配置</h3>
          <button
            type="button"
            onClick={() => updateConfig('sitemap_enabled', !config.sitemap_enabled)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              config.sitemap_enabled ? 'bg-primary-500' : 'bg-gray-200'
            )}
            role="switch"
            aria-checked={config.sitemap_enabled}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                config.sitemap_enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
        
        {config.sitemap_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              更新频率
            </label>
            <select
              value={config.sitemap_frequency}
              onChange={(e) => updateConfig('sitemap_frequency', e.target.value as SeoConfig['sitemap_frequency'])}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sitemapFrequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Robots.txt 编辑器 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Robots.txt
        </label>
        <textarea
          id="robots_txt"
          value={config.robots_txt}
          onChange={(e) => updateConfig('robots_txt', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-2 text-sm text-gray-500">
          可用变量: {'{site_url}'} - 会被替换为网站地址
        </p>
      </div>

      {/* 站点验证码 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">站点验证</h3>
        <div className="space-y-4">
          <div>
            <Input
              id="google_site_verification"
              label="Google 站点验证码"
              value={config.google_site_verification}
              onChange={(e) => updateConfig('google_site_verification', e.target.value)}
              placeholder="Google Search Console 提供的验证码"
            />
          </div>
          <div>
            <Input
              id="baidu_site_verification"
              label="百度站点验证码"
              value={config.baidu_site_verification}
              onChange={(e) => updateConfig('baidu_site_verification', e.target.value)}
              placeholder="百度站长平台提供的验证码"
            />
          </div>
          <div>
            <Input
              id="bing_site_verification"
              label="Bing 站点验证码"
              value={config.bing_site_verification}
              onChange={(e) => updateConfig('bing_site_verification', e.target.value)}
              placeholder="Bing Webmaster Tools 提供的验证码"
            />
          </div>
        </div>
      </div>

      {/* 结构化数据 */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">结构化数据</h3>
            <p className="text-sm text-gray-500 mt-1">
              自动生成 JSON-LD 结构化数据，有助于搜索引擎理解网站内容
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateConfig('structured_data_enabled', !config.structured_data_enabled)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              config.structured_data_enabled ? 'bg-primary-500' : 'bg-gray-200'
            )}
            role="switch"
            aria-checked={config.structured_data_enabled}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                config.structured_data_enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
