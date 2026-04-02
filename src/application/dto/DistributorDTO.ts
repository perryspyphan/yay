import type { DistributorGroup } from '@/domain/entities/Distributor'

export interface DistributorDTO {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tax_code: string | null
  group: DistributorGroup
  total_buy: number
  debt: number
  status: string
  created_at: string
}

export interface AddDistributorDTO {
  name: string
  phone: string
  email: string
  address: string
  tax_code: string
  group: DistributorGroup
}

export interface UpdateDistributorDTO {
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tax_code: string | null
  group: DistributorGroup
}

export interface DistributorFiltersDTO {
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