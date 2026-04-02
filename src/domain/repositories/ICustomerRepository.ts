// src/domain/repositories/ICustomerRepository.ts
// Single source of truth – XOÁ Customer-respository.ts sau khi dùng file này

import type { Customer, Order, OrderWithItems, CustomerTier } from '@/domain/entities/Customer'

export interface CustomerFilters {
  search?:   string
  tier?:     CustomerTier
  minTotal?: number
  maxTotal?: number
  dateFrom?: string
  dateTo?:   string
}

export interface ICustomerRepository {
  getAll(filters?: CustomerFilters): Promise<Customer[]>
  getOrdersByCustomer(customerId: string): Promise<Order[]>
  getOrderWithItems(orderId: string): Promise<OrderWithItems>
  add(form: { name: string; phone: string; email?: string; tier: CustomerTier }): Promise<void>
  update(id: string, form: { name: string; phone: string | null; email: string | null; tier: CustomerTier }): Promise<void>
  deleteMany(ids: string[]): Promise<void>
  // Tier được nâng tự động bởi DB trigger, method này dùng khi cần force sync
  syncTier(customerId: string): Promise<void>
}