// ============================================================
//  src/middleware.ts
//  Lớp bảo vệ đầu tiên — chặn URL theo role
//
//  Chạy trước mọi request, kể cả khi user gõ thẳng URL.
//  Không có quyền → redirect /dashboard thay vì báo lỗi.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { canAccessRoute, type Role } from '@/lib/rbac'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Tạo Supabase client dùng cookie của request hiện tại
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  // ── BƯỚC 1: Kiểm tra đăng nhập ──────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()

  // Chưa đăng nhập → redirect về login
  if (!user && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Đã đăng nhập mà vào login/register → redirect về dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Trang login/register không cần check role
  if (!user) return response

  // ── BƯỚC 2: Lấy role từ nhan_su.accounts ────────────────────
  //
  //  Query role một lần duy nhất mỗi request.
  //  Nếu không tìm thấy account → mặc định 'staff'
  //  (an toàn hơn là để null hoặc throw error)

  const { data: account } = await supabase
    .schema('nhan_su')
    .from('accounts')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  const role = (account?.role ?? 'staff') as Role

  // ── BƯỚC 3: Kiểm tra quyền truy cập route ───────────────────
  //
  //  canAccessRoute() đọc ROUTE_PERMISSIONS từ rbac.ts
  //  và tìm rule phù hợp nhất với pathname hiện tại.

  if (!canAccessRoute(pathname, role)) {
    // Không có quyền → redirect về dashboard, không báo lỗi
    // (tránh lộ thông tin về sự tồn tại của route)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Chạy middleware cho tất cả route trừ static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
}