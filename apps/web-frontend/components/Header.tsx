'use client'

import { Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { ThemeToggle } from '@/components/animations'

interface UserInfo {
  username: string
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

  // 从 localStorage 读取用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-foreground">
          CMS
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-foreground hover:text-primary transition-colors">首页</Link>
          <Link href="/categories" className="text-sm text-foreground hover:text-primary transition-colors">分类</Link>
          <Link href="/tags" className="text-sm text-foreground hover:text-primary transition-colors">标签</Link>
        </div>
        
        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 text-foreground">
              <User className="w-5 h-5" />
              <span className="text-sm">{user.username}</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-foreground hover:text-primary transition-colors">登录</Link>
              <Link href="/register" className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                注册
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link href="/" className="block text-sm text-foreground hover:text-primary transition-colors">首页</Link>
            <Link href="/categories" className="block text-sm text-foreground hover:text-primary transition-colors">分类</Link>
            <Link href="/tags" className="block text-sm text-foreground hover:text-primary transition-colors">标签</Link>
            <hr className="border-border" />
            {user ? (
              <>
                <div className="text-sm text-foreground">{user.username}</div>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm text-foreground hover:text-primary transition-colors">登录</Link>
                <Link href="/register" className="block text-sm text-foreground hover:text-primary transition-colors">注册</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
