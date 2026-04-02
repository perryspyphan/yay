// src/app/(admin)/tai-khoan/page.tsx
//
// Lấy role của người đang đăng nhập để:
// 1. Filter danh sách accounts phù hợp (manager chỉ thấy staff)
// 2. Truyền callerRole xuống AccountTable để giới hạn actions

import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { getAccountsUseCase, getEmployeesUseCase } from '@/application/use-cases/staff/StaffUseCases'
import AccountTable from '@/presentation/components/account/AccountTable'
import type { Role } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function TaiKhoanPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lấy role của người đang đăng nhập
  const { data: account } = await supabase
    .schema('nhan_su')
    .from('accounts')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  const callerRole = (account?.role ?? 'staff') as Role

  // getAccounts sẽ filter theo callerRole
  // (manager chỉ thấy staff, admin thấy tất cả)
  const [accounts, employees] = await Promise.all([
    getAccountsUseCase(undefined, callerRole),
    getEmployeesUseCase(),
  ])

  return (
    <AccountTable
      initialAccounts={accounts}
      employees={employees}
      callerRole={callerRole}
    />
  )
}