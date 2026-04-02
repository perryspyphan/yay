import { getDistributorsUseCase } from '@/application/use-cases/distributor/DistributorUseCases'
import DistributorTable from '@/presentation/components/distributor/DistributorTable'

export const dynamic = 'force-dynamic'

export default async function NhaPhanPhoiPage() {
  const distributors = await getDistributorsUseCase()
  return <DistributorTable initialDistributors={distributors} />
}