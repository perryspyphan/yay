// src/domain/value-objects/CustomerTier.ts
// Single source of truth – XOÁ Customer-tier.ts sau khi dùng file này
// Ngưỡng hạng phù hợp với đơn online nhỏ

import type { CustomerTier } from '@/domain/entities/Customer'

export const TIER_THRESHOLDS = {
  Vàng: 2_000_000,  // ≥ 2 triệu
  Bạc:  500_000,    // ≥ 500k
} as const

export const TIER_RANK: Record<CustomerTier, number> = {
  Đồng: 0,
  Bạc:  1,
  Vàng: 2,
}

// Tính hạng từ tổng chi tiêu
export function calcTier(total: number): CustomerTier {
  if (total >= TIER_THRESHOLDS.Vàng) return 'Vàng'
  if (total >= TIER_THRESHOLDS.Bạc)  return 'Bạc'
  return 'Đồng'
}

// Chỉ nâng hạng, không hạ
export function shouldUpgrade(current: CustomerTier, next: CustomerTier): boolean {
  return TIER_RANK[next] > TIER_RANK[current]
}

// Tính priority score khi xảy ra conflict hàng
// Vàng > Bạc > Đồng, cùng hạng → đặt sớm hơn thắng
export function calcPriorityScore(tier: CustomerTier, orderedAt: Date): number {
  const tierRank = TIER_RANK[tier]
  // Đảo timestamp: đặt sớm hơn → số nhỏ hơn → cần đảo
  const tsInverse = 9999999999 - Math.floor(orderedAt.getTime() / 1000)
  return tierRank * 10_000_000 + tsInverse
}