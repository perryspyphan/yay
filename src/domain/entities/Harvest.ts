// ============================================================
// DOMAIN LAYER - Harvest.ts
// Nhiệm vụ: Định nghĩa Interface HarvestRecord khớp với Schema Database.
// Là "ngôn ngữ chung" cho tính năng Thu hoạch.
// KHÔNG chứa logic, KHÔNG gọi API, KHÔNG import thư viện ngoài.
// ============================================================

export interface Harvest {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  creator: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface HarvestStats {
  product_id: string;
  product_name: string;
  unit: string;
  total_quantity: number;
  first_harvest: string;
  last_harvest: string;
}

export interface HarvestFilter {
  productId?: string;
  harvestFrom?: string;
  harvestTo?: string;
}