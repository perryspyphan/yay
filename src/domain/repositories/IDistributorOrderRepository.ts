// Tầng Domain — interface, chỉ định nghĩa "cần làm gì"
// Không quan tâm Supabase hay bất kỳ DB nào

import type {
  DistributorOrder,
  DistributorOrderItem,
  DistributorOrderStatus,
} from '@/domain/entities/DistributorOrder'

export interface DistributorOrderFilters {
  search?: string
  status?: DistributorOrderStatus
  dateFrom?: string
  dateTo?: string
}

export interface CreateDistributorOrderInput {
  distributor_id: string
  items: Omit<DistributorOrderItem, 'id' | 'order_id'>[]
  discount_pct: number
  discount_confirmed_by: string | null
  discount_confirmed_at: string | null
  delivery_date: string | null
  note: string | null
  ordered_by: string
}

export interface IDistributorOrderRepository {
  getAll(filters?: DistributorOrderFilters): Promise<DistributorOrder[]>
  getById(id: string): Promise<import('@/domain/entities/DistributorOrder').DistributorOrderWithItems | null>
  create(input: CreateDistributorOrderInput): Promise<string> // trả về id đơn mới
  updateStatus(id: string, status: DistributorOrderStatus): Promise<void>
}