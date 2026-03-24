'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MenuItem {
  href: string
  label: string
  icon: string
  exact?: boolean
  superAdminOnly?: boolean
}

const menuItems: MenuItem[] = [
  { href: '/admin', label: '仪表盘', icon: '📊', exact: true },
  { href: '/admin/articles', label: '文章管理', icon: '📝' },
  { href: '/admin/categories', label: '分类管理', icon: '📁' },
  { href: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { href: '/admin/media', label: '媒体库', icon: '🖼️' },
  { href: '/admin/users', label: '用户管理', icon: '👥' },
  { href: '/admin/tenants', label: '租户管理', icon: '🏢' },
  { href: '/admin/settings', label: '系统设置', icon: '⚙️' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // 检查用户角色是否为超级管理员
    const userRole = localStorage.getItem('userRole')
    const isSuper = userRole === 'super_admin' || userRole === 'admin'
    setIsSuperAdmin(isSuper)
  }, [])

  // 过滤菜单项：超级管理员专属菜单只对超级管理员显示
  const visibleMenuItems = menuItems.filter(item => !item.superAdminOnly || isSuperAdmin)

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 text-white min-h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold">CMS Admin</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
            aria-label="关闭菜单"
          >
            ✕
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => {
              // 修复高亮逻辑：精确匹配或前缀匹配
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    {...(onClose && { onClick: onClose })}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
