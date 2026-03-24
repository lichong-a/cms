'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import TenantForm from '@/components/TenantForm'

export default function NewTenantPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('accessToken')
      const API = `${window.location.protocol}//${window.location.hostname}:3003/api/v1`
      
      const response = await fetch(`${API}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        alert('租户创建成功')
        router.push('/admin/tenants')
      } else {
        alert(result.error || '创建失败')
      }
    } catch (error: any) {
      console.error('创建租户失败:', error)
      alert(error.message || '创建失败')
    }
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
        <h1 className="text-2xl font-bold mb-6">创建租户</h1>
        <TenantForm onSubmit={handleSubmit} onCancel={() => router.push('/admin/tenants')} />
      </div>
    </div>
  )
}
