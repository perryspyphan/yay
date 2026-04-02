// src/application/use-cases/customer/CustomerUseCases.ts
// Gộp GetCustomersUseCase + GetOrdersUseCase + MutateCustomerUseCase vào 1 file
// XOÁ 3 file cũ sau khi dùng file này

'use server'

import { getCustomerRepository } from '@/infrastructure/container/DIContainer'
import type { AddCustomerDTO, UpdateCustomerDTO, CustomerFiltersDTO } from '@/application/dto/CustomerDTO'

// ── Read ────────────────────────────────────────────────────────
export async function getCustomersUseCase(filters?: CustomerFiltersDTO) {
  return getCustomerRepository().getAll(filters)
}

export async function getOrdersByCustomerUseCase(customerId: string) {
  return getCustomerRepository().getOrdersByCustomer(customerId)
}

export async function getOrderWithItemsUseCase(orderId: string) {
  return getCustomerRepository().getOrderWithItems(orderId)
}

// ── Mutate ──────────────────────────────────────────────────────
export async function addCustomerUseCase(form: AddCustomerDTO) {
  if (!form.name?.trim()) throw new Error('Tên không được rỗng')
  return getCustomerRepository().add(form)
}

export async function updateCustomerUseCase(id: string, form: UpdateCustomerDTO) {
  if (!form.name?.trim()) throw new Error('Tên không được rỗng')
  return getCustomerRepository().update(id, form)
}

export async function deleteCustomersUseCase(ids: string[]) {
  if (ids.length === 0) throw new Error('Chưa chọn khách hàng')
  return getCustomerRepository().deleteMany(ids)
}

// Sync tier thủ công (thường DB trigger tự lo)
export async function syncCustomerTierUseCase(customerId: string) {
  return getCustomerRepository().syncTier(customerId)
}