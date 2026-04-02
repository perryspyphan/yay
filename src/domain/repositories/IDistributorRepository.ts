import type { Distributor, DistributorOrder, DistributorGroup } from '@/domain/entities/Distributor'

export interface DistributorFilters {
  search?: string
  group?: string
  minTotal?: number
  maxTotal?: number
  minDebt?: number
  maxDebt?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface IDistributorRepository {
  getAll(filters?: DistributorFilters): Promise<Distributor[]>
  getOrdersByDistributor(distributorId: string): Promise<DistributorOrder[]>
  add(form: {
    name: string; phone: string; email: string
    address: string; tax_code: string; group: DistributorGroup
  }): Promise<void>
  update(id: string, form: {
    name: string; phone: string | null; email: string | null
    address: string | null; tax_code: string | null; group: DistributorGroup
  }): Promise<void>
  deleteMany(ids: string[]): Promise<void>
}