'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

import { getApiV1BaseUrl } from '@/lib/api-base-url'
import { getAccessToken, getCurrentTenant, setCurrentTenant as saveCurrentTenant } from '@/lib/session'

interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
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

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedTenant = getCurrentTenant()
    if (savedTenant) {
      setCurrentTenant(savedTenant)
    }

    // 加载租户列表
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const result = await fetchAPI<{ success: boolean; data: Tenant[] }>('/tenants?limit=100&status=ACTIVE')
      if (result.success && result.data) {
        setTenants(result.data)
        // 如果没有保存的租户，默认选择第一个
        if (!currentTenant && result.data.length > 0 && result.data[0]?.slug) {
          const defaultTenant = result.data[0].slug
          setCurrentTenant(defaultTenant)
          saveCurrentTenant(defaultTenant)
        }
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitch = (tenantSlug: string) => {
    if (tenantSlug === currentTenant) {
      setIsOpen(false)
      return
    }

    saveCurrentTenant(tenantSlug)
    setCurrentTenant(tenantSlug)
    setIsOpen(false)

    // 刷新页面以应用新租户
    window.location.reload()
  }

  const currentTenantData = tenants.find(t => t.slug === currentTenant)

  // 如果只有一个租户，不显示切换器
  if (tenants.length <= 1 && !loading) {
    return null
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg shadow-sm hover:bg-white/90 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700 font-medium max-w-[120px] truncate">
          {currentTenantData?.name || '选择租户'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 下拉菜单 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden z-50"
            >
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 px-2">切换租户</p>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    加载中...
                  </div>
                ) : tenants.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    暂无可用租户
                  </div>
                ) : (
                  tenants.map((tenant) => (
                    <motion.button
                      key={tenant.id}
                      onClick={() => handleSwitch(tenant.slug)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                        currentTenant === tenant.slug ? 'bg-blue-50' : ''
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {tenant.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {tenant.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {tenant.slug}
                        </p>
                      </div>
                      {currentTenant === tenant.slug && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
