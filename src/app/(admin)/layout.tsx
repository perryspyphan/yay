// ============================================================
//  src/app/(admin)/layout.tsx
//
//  Thay đổi so với cũ:
//  Layout là Server Component — query role từ nhan_su.accounts
//  rồi truyền xuống Header (Client Component) qua props.
//
//  Tại sao làm ở Layout thay vì trong Header?
//  → Header là 'use client' nên không thể dùng createClient (server).
//  → Layout chạy trên server, query một lần, truyền xuống an toàn.
// ============================================================

import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/presentation/components/layout/Header'
import type { Role } from '@/lib/rbac'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Lấy user đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lấy role + tên từ nhan_su.accounts
  const { data: account } = await supabase
    .schema('nhan_su')
    .from('accounts')
    .select('role, name')
    .eq('auth_id', user.id)
    .single()

  const role     = (account?.role ?? 'staff') as Role
  const userName = account?.name ?? user.email ?? 'Người dùng'

  return (
    <>
      {/* Truyền role và tên xuống Header */}
      <Header role={role} userName={userName} />
      {children}
    </>
  )
}