'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Save, Palette, Globe, Settings, Search,
  FileText, ToggleLeft, HardDrive
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { getApiV1BaseUrl } from '@/lib/api-base-url'
import { getAccessToken } from '@/lib/session'

interface TenantConfig {
  seo: {
    siteName: string
    siteDescription: string
    keywords: string[]
  }
  theme: {
    primaryColor: string
    logo?: string
    favicon?: string
  }
  domains: {
    subdomain?: string
    customDomain?: string
  }
  features: {
    enableComments: boolean
    enableWorkflows: boolean
    enableVersioning: boolean
    enableMediaLibrary: boolean
    maxArticles: number
    maxStorageMB: number
  }
}

interface Tenant {
  id: string
  name: string
  slug: string
  config: TenantConfig
}

const defaultConfig: TenantConfig = {
  seo: {
    siteName: '',
    siteDescription: '',
    keywords: [],
  },
  theme: {
    primaryColor: '#1890ff',
    logo: '',
    favicon: '',
  },
  domains: {
    subdomain: '',
    customDomain: '',
  },
  features: {
    enableComments: true,
    enableWorkflows: false,
    enableVersioning: true,
    enableMediaLibrary: true,
    maxArticles: 1000,
    maxStorageMB: 1024,
  },
}

const tabs = [
  { id: 'seo', label: 'SEO 设置', icon: Search },
  { id: 'theme', label: '主题配置', icon: Palette },
  { id: 'domains', label: '域名管理', icon: Globe },
  { id: 'features', label: '功能开关', icon: Settings },
]

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${getApiV1BaseUrl()}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  return res.json()
}

export default function TenantConfigPage() {
  const params = useParams()
  const tenantId = params['id'] as string

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [config, setConfig] = useState<TenantConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState('seo')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [keywordsInput, setKeywordsInput] = useState('')

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      setLoading(true)
      const result = await fetchAPI<{ success: boolean; data: Tenant }>(`/tenants/${tenantId}`)
      if (result.success && result.data) {
        setTenant(result.data)
        const mergedConfig = {
          ...defaultConfig,
          ...result.data.config,
          seo: { ...defaultConfig.seo, ...result.data.config?.seo },
          theme: { ...defaultConfig.theme, ...result.data.config?.theme },
          domains: { ...defaultConfig.domains, ...result.data.config?.domains },
          features: { ...defaultConfig.features, ...result.data.config?.features },
        }
        setConfig(mergedConfig)
        setKeywordsInput(mergedConfig.seo.keywords.join(', '))
      }
    } catch (error) {
      console.error('Failed to load tenant:', error)
      alert('加载租户失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const result = await fetchAPI<{ success: boolean; data: Tenant }>(`/tenants/${tenantId}/config`, {
        method: 'PUT',
        body: JSON.stringify({ config }),
      })
      if (result.success) {
        alert('配置保存成功')
        loadTenant()
      } else {
        alert('保存失败')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (section: keyof TenantConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value)
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean)
    updateConfig('seo', 'keywords', keywords)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tenants"
            className="p-2 hover:bg-white/70 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">租户配置</h1>
            <p className="text-sm text-gray-500">{tenant?.name} ({tenant?.slug})</p>
          </div>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存配置'}
        </motion.button>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/70 text-gray-700 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6"
        >
          {/* SEO 设置 */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO 设置
              </h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    站点名称
                  </label>
                  <input
                    type="text"
                    value={config.seo.siteName}
                    onChange={(e) => updateConfig('seo', 'siteName', e.target.value)}
                    placeholder="输入站点名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    站点描述
                  </label>
                  <textarea
                    value={config.seo.siteDescription}
                    onChange={(e) => updateConfig('seo', 'siteDescription', e.target.value)}
                    placeholder="输入站点描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO 关键词
                  </label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="输入关键词，用逗号分隔"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                  <p className="mt-1 text-xs text-gray-500">用逗号分隔多个关键词</p>
                </div>
              </div>
            </div>
          )}

          {/* 主题配置 */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                主题配置
              </h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主题色
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) => updateConfig('theme', 'primaryColor', e.target.value)}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.theme.primaryColor}
                      onChange={(e) => updateConfig('theme', 'primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    <div
                      className="w-10 h-10 rounded-lg shadow-inner"
                      style={{ backgroundColor: config.theme.primaryColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.theme.logo || ''}
                      onChange={(e) => updateConfig('theme', 'logo', e.target.value)}
                      placeholder="输入 Logo URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    {config.theme.logo && (
                      <img
                        src={config.theme.logo}
                        alt="Logo preview"
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={config.theme.favicon || ''}
                    onChange={(e) => updateConfig('theme', 'favicon', e.target.value)}
                    placeholder="输入 Favicon URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 域名管理 */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                域名管理
              </h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    子域名
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">https://</span>
                    <input
                      type="text"
                      value={config.domains.subdomain || ''}
                      onChange={(e) => updateConfig('domains', 'subdomain', e.target.value)}
                      placeholder="your-tenant"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                      .yourcms.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    自定义域名
                  </label>
                  <input
                    type="text"
                    value={config.domains.customDomain || ''}
                    onChange={(e) => updateConfig('domains', 'customDomain', e.target.value)}
                    placeholder="www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    请确保已将域名 CNAME 记录指向系统提供的地址
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 功能开关 */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                功能开关
              </h2>
              
              <div className="grid gap-4">
                {/* 评论功能 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">评论功能</p>
                      <p className="text-sm text-gray-500">启用文章评论系统</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.enableComments}
                      onChange={(e) => updateConfig('features', 'enableComments', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 工作流 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">工作流</p>
                      <p className="text-sm text-gray-500">启用内容审批工作流</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.enableWorkflows}
                      onChange={(e) => updateConfig('features', 'enableWorkflows', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 版本控制 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">版本控制</p>
                      <p className="text-sm text-gray-500">启用内容版本历史</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.enableVersioning}
                      onChange={(e) => updateConfig('features', 'enableVersioning', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 媒体库 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ToggleLeft className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">媒体库</p>
                      <p className="text-sm text-gray-500">启用媒体文件管理</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.enableMediaLibrary}
                      onChange={(e) => updateConfig('features', 'enableMediaLibrary', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* 配额设置 */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-800 mb-4">配额设置</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        最大文章数
                      </label>
                      <input
                        type="number"
                        value={config.features.maxArticles}
                        onChange={(e) => updateConfig('features', 'maxArticles', parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        最大存储空间 (MB)
                      </label>
                      <input
                        type="number"
                        value={config.features.maxStorageMB}
                        onChange={(e) => updateConfig('features', 'maxStorageMB', parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
