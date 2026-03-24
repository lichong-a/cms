'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Header from '@/components/admin/header'
import Sidebar from '@/components/admin/sidebar'
import { PageTransition } from '@/components/animations'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // 检查认证状态
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const accessToken = localStorage.getItem('accessToken')

    if (!isAuthenticated || !accessToken) {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 bg-gray-50 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
