import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 设置安全相关的 HTTP 头
  response.headers.set('X-Frame-Options', 'DENY')  // 防止点击劫持
  response.headers.set('X-Content-Type-Options', 'nosniff')  // 防止 MIME 类型嗅探
  response.headers.set('X-XSS-Protection', '1; mode=block')  // 开启 XSS 过滤
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )  // CSP 策略
  
  return response
}

export const config = {
  matcher: '/:path*',
} 