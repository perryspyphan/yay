import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { getCustomerInvoicesUseCase } from '@/application/use-cases/order/GetCustomerInvoicesUseCase'
import CustomerInvoiceTable from '@/presentation/components/invoice/CustomerInvoiceTable'

export const dynamic = 'force-dynamic'

export default async function HoaDonKhachHangPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const invoices = await getCustomerInvoicesUseCase()

  return <CustomerInvoiceTable initialInvoices={invoices} />
}