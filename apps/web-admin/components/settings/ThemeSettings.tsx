'use client';

import { cn } from '@cms/utils';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface ThemeSettingsProps {
  initialData?: Record<string, any>;
  themes?: Theme[];
  onChange: (data: Record<string, any>) => void;
  onActivateTheme?: (themeId: string) => void;
}

interface Theme {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  previewImage?: string;
  isActive: boolean;
  isBuiltin: boolean;
}

interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  text_secondary: string;
  border_color: string;
  font_family: string;
  font_size_base: string;
  border_radius: string;
  shadow_intensity: string;
}

const presetThemes = [
  {
    name: '默认橙色',
    colors: {
      primary_color: '#F97316',
      secondary_color: '#6366F1',
      accent_color: '#EC4899',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
    },
  },
  {
    name: '深蓝科技',
    colors: {
      primary_color: '#3B82F6',
      secondary_color: '#8B5CF6',
      accent_color: '#06B6D4',
      background_color: '#FFFFFF',
      text_color: '#1E293B',
    },
  },
  {
    name: '绿色自然',
    colors: {
      primary_color: '#10B981',
      secondary_color: '#14B8A6',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#064E3B',
    },
  },
  {
    name: '暗黑模式',
    colors: {
      primary_color: '#8B5CF6',
      secondary_color: '#EC4899',
      accent_color: '#06B6D4',
      background_color: '#0F172A',
      text_color: '#E2E8F0',
    },
  },
];

const fontOptions = [
  { value: 'system-ui', label: '系统默认' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: '"Noto Sans SC", sans-serif', label: '思源黑体' },
  { value: '"Source Han Serif SC", serif', label: '思源宋体' },
  { value: 'Georgia, serif', label: 'Georgia' },
];

const borderRadiusOptions = [
  { value: 'none', label: '无圆角' },
  { value: '0.25rem', label: '小圆角' },
  { value: '0.5rem', label: '中圆角' },
  { value: '0.75rem', label: '大圆角' },
  { value: '1rem', label: '超大圆角' },
];

const shadowIntensityOptions = [
  { value: 'none', label: '无阴影' },
  { value: 'sm', label: '轻微' },
  { value: 'base', label: '标准' },
  { value: 'md', label: '中等' },
  { value: 'lg', label: '强烈' },
];

export default function ThemeSettings({ 
  initialData, 
  // themes = [], 
  onChange,
  // onActivateTheme,
}: ThemeSettingsProps) {
  const [config, setConfig] = useState<ThemeConfig>({
    primary_color: initialData?.['primary_color'] || '#F97316',
    secondary_color: initialData?.['secondary_color'] || '#6366F1',
    accent_color: initialData?.['accent_color'] || '#EC4899',
    background_color: initialData?.['background_color'] || '#FFFFFF',
    text_color: initialData?.['text_color'] || '#1F2937',
    text_secondary: initialData?.['text_secondary'] || '#6B7280',
    border_color: initialData?.['border_color'] || '#E5E7EB',
    font_family: initialData?.['font_family'] || 'system-ui',
    font_size_base: initialData?.['font_size_base'] || '16px',
    border_radius: initialData?.['border_radius'] || '0.5rem',
    shadow_intensity: initialData?.['shadow_intensity'] || 'base',
  });

  const [customMode, setCustomMode] = useState(false);

  const updateConfig = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const applyPresetTheme = (preset: typeof presetThemes[0]) => {
    const newConfig = { ...config, ...preset.colors };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-8">
      {/* 预设主题选择器 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">预设主题</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPresetTheme(preset)}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all hover:shadow-md',
                config.primary_color === preset.colors.primary_color
                  ? 'border-primary-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex gap-2 mb-3">
                {Object.entries(preset.colors).slice(0, 3).map(([key, color]) => (
                  <div
                    key={key}
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-900">{preset.name}</p>
              {config.primary_color === preset.colors.primary_color && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">自定义颜色</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomMode(!customMode)}
          >
            {customMode ? '收起' : '展开'}
          </Button>
        </div>

        {customMode && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 主色调 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主色调
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => updateConfig('primary_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.primary_color}
                  onChange={(e) => updateConfig('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 次要颜色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                次要颜色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.secondary_color}
                  onChange={(e) => updateConfig('secondary_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.secondary_color}
                  onChange={(e) => updateConfig('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 强调色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                强调色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => updateConfig('accent_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.accent_color}
                  onChange={(e) => updateConfig('accent_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 背景色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                背景色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.background_color}
                  onChange={(e) => updateConfig('background_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.background_color}
                  onChange={(e) => updateConfig('background_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 文字颜色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文字颜色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.text_color}
                  onChange={(e) => updateConfig('text_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.text_color}
                  onChange={(e) => updateConfig('text_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 次要文字 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                次要文字
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.text_secondary}
                  onChange={(e) => updateConfig('text_secondary', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.text_secondary}
                  onChange={(e) => updateConfig('text_secondary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* 边框颜色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                边框颜色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.border_color}
                  onChange={(e) => updateConfig('border_color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={config.border_color}
                  onChange={(e) => updateConfig('border_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 字体选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          字体
        </label>
        <select
          value={config.font_family}
          onChange={(e) => updateConfig('font_family', e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 圆角大小 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          圆角大小
        </label>
        <div className="grid grid-cols-5 gap-2">
          {borderRadiusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateConfig('border_radius', option.value)}
              className={cn(
                'px-4 py-2 text-sm border rounded-md transition-colors',
                config.border_radius === option.value
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 阴影强度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          阴影强度
        </label>
        <div className="grid grid-cols-5 gap-2">
          {shadowIntensityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateConfig('shadow_intensity', option.value)}
              className={cn(
                'px-4 py-2 text-sm border rounded-md transition-colors',
                config.shadow_intensity === option.value
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 实时预览 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">实时预览</h3>
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: config.background_color,
            borderColor: config.border_color,
            fontFamily: config.font_family,
          }}
        >
          <h4 
            className="text-2xl font-bold mb-2"
            style={{ color: config.text_color }}
          >
            示例标题
          </h4>
          <p 
            className="mb-4"
            style={{ color: config.text_secondary }}
          >
            这是一段示例文字，展示当前主题配置的效果。
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded font-medium"
              style={{ 
                backgroundColor: config.primary_color,
                color: '#FFFFFF',
                borderRadius: config.border_radius,
              }}
            >
              主按钮
            </button>
            <button 
              className="px-4 py-2 rounded font-medium"
              style={{ 
                backgroundColor: config.secondary_color,
                color: '#FFFFFF',
                borderRadius: config.border_radius,
              }}
            >
              次按钮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
