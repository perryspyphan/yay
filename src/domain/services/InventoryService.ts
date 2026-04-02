// src/domain/services/InventoryService.ts

import type { Product } from '@/domain/entities/Product'

export type StockStatus = 'out_of_stock' | 'below_min' | 'ok' | 'above_max'

export function getStockStatus(product: Product): StockStatus {
  if (product.stock === 0)                  return 'out_of_stock'
  if (product.stock < product.min_stock)    return 'below_min'
  if (product.stock > product.max_stock)    return 'above_max'
  return 'ok'
}

export function stockStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    out_of_stock: 'Hết hàng',
    below_min:    'Dưới định mức',
    ok:           'Bình thường',
    above_max:    'Vượt định mức',
  }
  return labels[status]
}

export function stockStatusColor(status: StockStatus): string {
  const colors: Record<StockStatus, string> = {
    out_of_stock: '#9E422C',
    below_min:    '#EF4444',
    ok:           '#15803D',
    above_max:    '#F59E0B',
  }
  return colors[status]
}

/** Tính số lượng cần đặt thêm để đạt min_stock */
export function calcReorderQty(product: Product): number {
  if (product.stock >= product.min_stock) return 0
  return product.min_stock - product.stock
}

/** Trừ tồn kho khi bán — trả về lỗi nếu không đủ hàng */
export function deductStock(product: Product, qty: number): number {
  if (product.stock < qty) {
    throw new Error(`Không đủ tồn kho cho "${product.name}". Còn: ${product.stock}, cần: ${qty}`)
  }
  return product.stock - qty
}
