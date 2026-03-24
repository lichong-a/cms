'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  status: string
  createdAt: string
  updatedAt: string
}

const API = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:3003/api/v1`
  : 'http://localhost:3003/api/v1'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  return res.json()
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const load = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })
      const r = await fetchAPI<{ success: boolean; data: Tenant[]; meta: { totalPages: number } }>(`/tenants?${params}`)
      if (r.success) {
        setTenants(r.data || [])
        setTotalPages(r.meta.totalPages || 1)
      }
    } catch {
      alert('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要禁用此租户吗？禁用后租户将无法访问。')) return
    try {
      const r = await fetchAPI<{ success: boolean }>(`/tenants/${id}`, { method: 'DELETE' })
      if (r.success) {
        alert('租户已禁用')
        load()
      }
    } catch {
      alert('禁用失败')
    }
  }

  const handleSearch = () => {
    setPage(1)
    load()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: '活跃', className: 'bg-green-100 text-green-700' },
      TRIAL: { label: '试用', className: 'bg-blue-100 text-blue-700' },
      SUSPENDED: { label: '暂停', className: 'bg-yellow-100 text-yellow-700' },
      DISABLED: { label: '禁用', className: 'bg-gray-100 text-gray-500' },
    }
    const config = statusMap[status] || statusMap['ACTIVE']!
    return (
      <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">租户管理</h1>
        <Link
          href="/admin/tenants/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          创建租户
        </Link>
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/70 rounded-lg shadow-lg border border-white/20 p-4"
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索租户名称或标识..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          >
            <option value="">全部状态</option>
            <option value="ACTIVE">活跃</option>
            <option value="TRIAL">试用</option>
            <option value="SUSPENDED">暂停</option>
            <option value="DISABLED">禁用</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            搜索
          </motion.button>
        </div>
      </motion.div>

      {/* Tenant List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">暂无租户</div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/70 rounded-lg shadow-lg border border-white/20 overflow-hidden"
        >
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  租户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.map((tenant, index) => (
                <motion.tr
                  key={tenant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tenant.logo && (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="w-10 h-10 rounded-lg mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tenant.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tenants/${tenant.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        编辑
                      </Link>
                      <Link
                        href={`/admin/tenants/${tenant.id}/config`}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        配置
                      </Link>
                      <Link
                        href={`/admin/tenants/${tenant.id}/migrate`}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                      >
                        迁移
                      </Link>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        禁用
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/70"
          >
            上一页
          </motion.button>
          <div className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white/70 rounded-md border border-gray-300">
            {page} / {totalPages}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/70"
          >
            下一页
          </motion.button>
        </div>
      )}
    </div>
  )
}
