'use client';

import { cn } from '@cms/utils';
import { 
  Globe, 
  Palette, 
  Layout, 
  ToggleLeft, 
  Search, 
  Share2 
} from 'lucide-react';

export type SettingsTab = 'basic' | 'theme' | 'layout' | 'feature' | 'seo' | 'social';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const tabs = [
  { id: 'basic' as const, label: '基本信息', icon: Globe },
  { id: 'theme' as const, label: '主题', icon: Palette },
  { id: 'layout' as const, label: '布局', icon: Layout },
  { id: 'feature' as const, label: '功能', icon: ToggleLeft },
  { id: 'seo' as const, label: 'SEO', icon: Search },
  { id: 'social' as const, label: '社交', icon: Share2 },
];

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
