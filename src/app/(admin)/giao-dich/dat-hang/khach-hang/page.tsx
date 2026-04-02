import { createClient } from '@/infrastructure/supabase/server'
import OrderTable from '@/presentation/components/order/OrderTable'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DatHangKhachHangPage() {
  const supabase = await createClient()

  // Lấy session hiện tại
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lấy role từ nhan_su.accounts qua auth_id
  const { data: account } = await supabase
    .schema('nhan_su')
    .from('accounts')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  const role = (account?.role as 'admin' | 'manager' | 'staff') ?? 'staff'
  const accountId = account?.id ?? ''

  return <OrderTable role={role} accountId={accountId} />
}