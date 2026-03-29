'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Download, Upload, Copy, FileText, FolderOpen, 
  Tag, Image, Users, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

import { getApiV1BaseUrl } from '@/lib/api-base-url'
import { getAccessToken } from '@/lib/session'

interface Tenant {
  id: string
  name: string
  slug: string
}

interface MigrationOptions {
  articles: boolean
  categories: boolean
  tags: boolean
  media: boolean
  users: boolean
}

interface LogEntry {
  type: 'info' | 'success' | 'error'
  message: string
  timestamp: Date
}

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

export default function TenantMigratePage() {
  const params = useParams()
  const tenantId = params['id'] as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // 导出选项
  const [exportOptions, setExportOptions] = useState<MigrationOptions>({
    articles: true,
    categories: true,
    tags: true,
    media: false,
    users: false,
  })

  // 导入选项
  const [importFile, setImportFile] = useState<File | null>(null)

  // 复制选项
  const [cloneOptions, setCloneOptions] = useState({
    newTenantId: '',
    newTenantName: '',
    newTenantSlug: '',
    copyData: {
      articles: true,
      categories: true,
      tags: true,
      media: false,
    },
  })

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      setLoading(true)
      const result = await fetchAPI<{ success: boolean; data: Tenant }>(`/tenants/${tenantId}`)
      if (result.success && result.data) {
        setTenant(result.data)
      }
    } catch (error) {
      console.error('Failed to load tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  const clearLogs = () => {
    setLogs([])
    setProgress(0)
  }

  // 导出数据
  const handleExport = async () => {
    try {
      setActiveCard('export')
      clearLogs()
      setProgress(10)
      addLog('info', '开始导出数据...')

      const result = await fetchAPI<{ success: boolean; data: any }>(`/tenants/${tenantId}/export`, {
        method: 'POST',
        body: JSON.stringify(exportOptions),
      })

      setProgress(50)
      addLog('info', '数据导出完成，准备下载...')

      if (result.success && result.data) {
        // 创建下载文件
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tenant-${tenant?.slug || tenantId}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setProgress(100)
        addLog('success', '导出成功！文件已开始下载。')
      } else {
        throw new Error('Export failed')
      }
    } catch (error: any) {
      addLog('error', `导出失败: ${error.message || '未知错误'}`)
      setProgress(0)
    } finally {
      setActiveCard(null)
    }
  }

  // 导入数据
  const handleImport = async () => {
    if (!importFile) {
      alert('请选择要导入的文件')
      return
    }

    try {
      setActiveCard('import')
      clearLogs()
      setProgress(10)
      addLog('info', '读取文件...')

      // 读取文件内容
      const fileContent = await importFile.text()
      const data = JSON.parse(fileContent)

      setProgress(30)
      addLog('info', '验证数据格式...')

      // 发送到服务器
      const result = await fetchAPI<{ success: boolean; message?: string }>(`/tenants/${tenantId}/import`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      })

      setProgress(90)
      
      if (result.success) {
        setProgress(100)
        addLog('success', result.message || '导入成功！')
        setImportFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error(result.message || 'Import failed')
      }
    } catch (error: any) {
      addLog('error', `导入失败: ${error.message || '未知错误'}`)
      setProgress(0)
    } finally {
      setActiveCard(null)
    }
  }

  // 复制租户
  const handleClone = async () => {
    if (!cloneOptions.newTenantId || !cloneOptions.newTenantName || !cloneOptions.newTenantSlug) {
      alert('请填写完整的租户信息')
      return
    }

    if (!confirm(`确定要创建新租户 "${cloneOptions.newTenantName}" 并复制数据吗？`)) {
      return
    }

    try {
      setActiveCard('clone')
      clearLogs()
      setProgress(10)
      addLog('info', `开始创建租户 ${cloneOptions.newTenantName}...`)

      const result = await fetchAPI<{ success: boolean; data?: any; message?: string }>(`/tenants/${tenantId}/clone`, {
        method: 'POST',
        body: JSON.stringify(cloneOptions),
      })

      setProgress(90)

      if (result.success) {
        setProgress(100)
        addLog('success', result.message || '租户复制成功！')
        addLog('info', `新租户 ID: ${cloneOptions.newTenantId}`)
        // 重置表单
        setCloneOptions({
          newTenantId: '',
          newTenantName: '',
          newTenantSlug: '',
          copyData: {
            articles: true,
            categories: true,
            tags: true,
            media: false,
          },
        })
      } else {
        throw new Error(result.message || 'Clone failed')
      }
    } catch (error: any) {
      addLog('error', `复制失败: ${error.message || '未知错误'}`)
      setProgress(0)
    } finally {
      setActiveCard(null)
    }
  }

  const toggleOption = (section: 'export' | 'clone', field: string) => {
    if (section === 'export') {
      setExportOptions(prev => ({ ...prev, [field]: !prev[field as keyof MigrationOptions] }))
    } else {
      setCloneOptions(prev => ({
        ...prev,
        copyData: { ...prev.copyData, [field]: !prev.copyData[field as keyof typeof prev.copyData] },
      }))
    }
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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/tenants"
          className="p-2 hover:bg-white/70 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据迁移工具</h1>
          <p className="text-sm text-gray-500">{tenant?.name} ({tenant?.slug})</p>
        </div>
      </div>

      {/* 三卡片布局 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* 导出卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">数据导出</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            将租户数据导出为 JSON 文件，可用于备份或迁移到其他系统。
          </p>

          <div className="space-y-2 mb-4">
            {[
              { key: 'articles', icon: FileText, label: '文章' },
              { key: 'categories', icon: FolderOpen, label: '分类' },
              { key: 'tags', icon: Tag, label: '标签' },
              { key: 'media', icon: Image, label: '媒体' },
              { key: 'users', icon: Users, label: '用户' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions[item.key as keyof MigrationOptions]}
                  onChange={() => toggleOption('export', item.key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <item.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>

          <motion.button
            onClick={handleExport}
            disabled={activeCard !== null}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {activeCard === 'export' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出数据
              </>
            )}
          </motion.button>
        </motion.div>

        {/* 导入卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">数据导入</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            从 JSON 文件导入数据到当前租户。数据将进行去重处理。
          </p>

          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
            >
              {importFile ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {importFile.name}
                </span>
              ) : (
                '选择 JSON 文件'
              )}
            </motion.button>
          </div>

          <motion.button
            onClick={handleImport}
            disabled={activeCard !== null || !importFile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {activeCard === 'import' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导入中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                导入数据
              </>
            )}
          </motion.button>
        </motion.div>

        {/* 复制租户卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Copy className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">租户复制</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            创建新租户并复制数据。适用于测试环境搭建。
          </p>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="新租户 ID"
              value={cloneOptions.newTenantId}
              onChange={(e) => setCloneOptions(prev => ({ ...prev, newTenantId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 text-sm"
            />
            <input
              type="text"
              placeholder="新租户名称"
              value={cloneOptions.newTenantName}
              onChange={(e) => setCloneOptions(prev => ({ ...prev, newTenantName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 text-sm"
            />
            <input
              type="text"
              placeholder="新租户 Slug"
              value={cloneOptions.newTenantSlug}
              onChange={(e) => setCloneOptions(prev => ({ ...prev, newTenantSlug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 text-sm"
            />

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">复制数据类型：</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'articles', label: '文章' },
                  { key: 'categories', label: '分类' },
                  { key: 'tags', label: '标签' },
                  { key: 'media', label: '媒体' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloneOptions.copyData[item.key as keyof typeof cloneOptions.copyData]}
                      onChange={() => toggleOption('clone', item.key)}
                      className="w-3 h-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleClone}
            disabled={activeCard !== null}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {activeCard === 'clone' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                复制中...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制租户
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* 进度条和日志 */}
      <AnimatePresence>
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">操作日志</h3>
              <button
                onClick={clearLogs}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清除
              </button>
            </div>

            {/* 进度条 */}
            {progress > 0 && (
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${
                      progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}%</p>
              </div>
            )}

            {/* 日志列表 */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 text-sm ${
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'success' ? 'text-green-600' :
                    'text-gray-600'
                  }`}
                >
                  {log.type === 'error' && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  {log.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  {log.type === 'info' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <span>{log.message}</span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 快捷入口 */}
      <div className="flex gap-4">
        <Link
          href={`/admin/tenants/${tenantId}/edit`}
          className="px-4 py-2 bg-white/70 border border-white/20 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors"
        >
          编辑租户
        </Link>
        <Link
          href={`/admin/tenants/${tenantId}/config`}
          className="px-4 py-2 bg-white/70 border border-white/20 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors"
        >
          配置管理
        </Link>
      </div>
    </div>
  )
}
