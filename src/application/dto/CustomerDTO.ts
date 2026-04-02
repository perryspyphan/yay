// src/application/dto/CustomerDTO.ts
// Single source of truth – XOÁ Customer.dto.ts sau khi dùng file này

import type { CustomerTier } from '@/domain/entities/Customer'

export interface AddCustomerDTO {
  name:   string
  phone:  string
  email?: string
  tier:   CustomerTier
}

export interface UpdateCustomerDTO {
  name:  string
  phone: string | null
  email: string | null
  tier:  CustomerTier
}

export interface CustomerFiltersDTO {
  search?:   string
  tier?:     CustomerTier
  minTotal?: number
  maxTotal?: number
  dateFrom?: string
  dateTo?:   string
}