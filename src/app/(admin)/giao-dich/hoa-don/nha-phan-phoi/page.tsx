import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { getDistributorInvoicesUseCase } from '@/application/use-cases/order/GetDistributorInvoicesUseCase'
import DistributorInvoiceTable from '@/presentation/components/invoice/DistributorInvoiceTable'

export const dynamic = 'force-dynamic'

export default async function HoaDonNhaPhanPhoiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const invoices = await getDistributorInvoicesUseCase()

  return <DistributorInvoiceTable initialInvoices={invoices} />
}