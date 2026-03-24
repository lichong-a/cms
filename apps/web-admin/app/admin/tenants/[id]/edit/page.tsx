'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import TenantForm from '@/components/TenantForm'

export default function EditTenantPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params['id'] as string

  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [_saving, setSaving] = useState(false)

  // 加载租户数据
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const API = `${window.location.protocol}//${window.location.hostname}:3003/api/v1`

        const response = await fetch(`${API}/tenants/${tenantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          setTenant(result.data)
        } else {
          alert(result.error || '加载失败')
          router.push('/admin/tenants')
        }
      } catch (error) {
        console.error('加载租户失败:', error)
        alert('加载失败')
        router.push('/admin/tenants')
      } finally {
        setLoading(false)
      }
    }

    loadTenant()
  }, [tenantId, router])

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('accessToken')
      const API = `${window.location.protocol}//${window.location.hostname}:3003/api/v1`

      const response = await fetch(`${API}/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        alert('租户更新成功')
        router.push('/admin/tenants')
      } else {
        alert(result.error || '更新失败')
      }
    } catch (error: any) {
      console.error('更新租户失败:', error)
      alert(error.message || '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/tenants')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">租户不存在</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/tenants"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <span>←</span>
          <span>返回租户列表</span>
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">编辑租户</h1>
          <div className="flex gap-2">
            <Link
              href={`/admin/tenants/${tenantId}/config`}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              配置管理
            </Link>
            <Link
              href={`/admin/tenants/${tenantId}/migrate`}
              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              数据迁移
            </Link>
          </div>
        </div>
        <TenantForm 
          tenant={tenant}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </div>
  )
}
