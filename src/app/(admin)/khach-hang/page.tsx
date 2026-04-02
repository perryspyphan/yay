import { getCustomersUseCase } from '@/application/use-cases/customer/CustomerUsecase'
import CustomerTable from '@/presentation/components/customer/CustomerTable'

export const dynamic = 'force-dynamic'

export default async function KhachHangPage() {
  const customers = await getCustomersUseCase()
  return <CustomerTable initialCustomers={customers} />
}