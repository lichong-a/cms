'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Tenant {
  id?: string
  name: string
  slug: string
  logo?: string
  status?: string
  config?: any
}

interface TenantFormProps {
  tenant?: Tenant
  onSubmit: (data: Tenant) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export default function TenantForm({ tenant, onSubmit, onCancel, isEdit = false }: TenantFormProps) {
  const [form, setForm] = useState<Tenant>({
    id: tenant?.id || '',
    name: tenant?.name || '',
    slug: tenant?.slug || '',
    logo: tenant?.logo || '',
    status: tenant?.status || 'ACTIVE',
    config: tenant?.config || {},
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Tenant, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="backdrop-blur-xl bg-white/70 rounded-lg shadow-lg border border-white/20 p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEdit ? '编辑租户' : '创建租户'}
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              租户ID *
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => handleChange('id', e.target.value)}
              required
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              placeholder="例如：tenant-001"
            />
            <p className="text-xs text-gray-500 mt-1">最多30个字符，创建后不可修改</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            租户名称 *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            placeholder="例如：示例公司"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug标识 *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            required
            maxLength={50}
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            placeholder="例如：example-com"
          />
          <p className="text-xs text-gray-500 mt-1">小写字母、数字和连字符，用于URL和子域名</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            value={form.logo || ''}
            onChange={(e) => handleChange('logo', e.target.value)}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            >
              <option value="ACTIVE">活跃</option>
              <option value="TRIAL">试用</option>
              <option value="SUSPENDED">暂停</option>
              <option value="DISABLED">禁用</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '保存中...' : (isEdit ? '更新' : '创建')}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
