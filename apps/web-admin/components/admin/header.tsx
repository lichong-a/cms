'use client'

import TenantSwitcher from '@/components/TenantSwitcher'
import { api } from '@/lib/api-v1'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const handleLogout = () => {
    void api.logoutUser()
  }

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* 移动端汉堡菜单按钮 */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          aria-label="打开菜单"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">后台管理</h2>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* 租户切换器 */}
        <TenantSwitcher />
        
        <span className="text-sm text-gray-600 hidden sm:inline">欢迎，管理员</span>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          退出
        </button>
      </div>
    </header>
  )
}
