// src/domain/services/PricingService.ts

import type { CustomerTier } from '@/domain/entities/Customer'

/** Phần trăm chiết khấu theo hạng khách hàng */
export const TIER_DISCOUNT: Record<CustomerTier, number> = {
  Đồng: 0,
  Bạc:  3,   // 3%
  Vàng: 5,   // 5%
}

export function calcDiscountedPrice(price: number, tier: CustomerTier): number {
  const pct = TIER_DISCOUNT[tier] ?? 0
  return Math.round(price * (1 - pct / 100))
}

export function calcLineTotal(unitPrice: number, qty: number, discountPct = 0): number {
  const discounted = Math.round(unitPrice * (1 - discountPct / 100))
  return discounted * qty
}

export function calcOrderTotal(lines: { unitPrice: number; qty: number; discountPct?: number }[]): number {
  return lines.reduce((sum, l) => sum + calcLineTotal(l.unitPrice, l.qty, l.discountPct), 0)
}

/** Lợi nhuận gộp */
export function calcGrossProfit(sellPrice: number, costPrice: number, qty: number): number {
  return (sellPrice - costPrice) * qty
}

export function calcGrossMarginPct(sellPrice: number, costPrice: number): number {
  if (sellPrice === 0) return 0
  return Math.round(((sellPrice - costPrice) / sellPrice) * 100 * 10) / 10
}
