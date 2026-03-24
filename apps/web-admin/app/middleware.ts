import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 开发环境暂时禁用认证检查，方便测试
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  
  // 生产环境：检查认证 token
  const token = request.cookies.get('token')?.value
  
  // 如果没有 token 且访问管理页面，重定向到登录页
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
