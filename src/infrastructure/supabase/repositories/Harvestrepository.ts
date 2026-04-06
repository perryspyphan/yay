// ============================================================
// INFRASTRUCTURE LAYER - HarvestRepository.ts
// ...
// ============================================================

import { createClient } from '@/infrastructure/supabase/client';
import { Harvest, HarvestStats, HarvestFilter } from '@/domain/entities/Harvest';

interface ProductInfo {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

export class HarvestRepository {
  private get supabase() {
    return createClient();
  }

  async getProductInfo(productId: string): Promise<ProductInfo | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, name, stock, unit')
      .eq('id', productId)
      .single();
    if (error) return null;
    return data;
  }

  async saveHarvestRecord(data: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit: string;
    harvest_date: string;
    creator: string;
    notes?: string;
  }): Promise<Harvest> {
    const { data: result, error } = await this.supabase
      .from('harvests')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw new Error(`Lưu bản ghi thu hoạch thất bại: ${error.message}`);
    return result;
  }

  async updateProductStock(productId: string, newStock: number): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId);
    if (error) throw new Error(`Cập nhật tồn kho thất bại: ${error.message}`);
  }

  async getHarvests(filters?: HarvestFilter): Promise<Harvest[]> {
    let query = this.supabase.from('harvests').select('*');
    if (filters?.productId) query = query.eq('product_id', filters.productId);
    if (filters?.harvestFrom) query = query.gte('harvest_date', filters.harvestFrom);
    if (filters?.harvestTo) query = query.lte('harvest_date', filters.harvestTo);
    const { data, error } = await query.order('harvest_date', { ascending: false });
    if (error) throw new Error(`Lấy danh sách thu hoạch thất bại: ${error.message}`);
    return data || [];
  }

  async getHarvestStats(filters?: HarvestFilter): Promise<HarvestStats[]> {
    let query = this.supabase
      .from('harvests')
      .select('product_id, product_name, unit, quantity, harvest_date');
    if (filters?.productId) query = query.eq('product_id', filters.productId);
    if (filters?.harvestFrom) query = query.gte('harvest_date', filters.harvestFrom);
    if (filters?.harvestTo) query = query.lte('harvest_date', filters.harvestTo);
    const { data, error } = await query;
    if (error) throw new Error(`Lấy thống kê thu hoạch thất bại: ${error.message}`);

    const statsMap: Record<string, HarvestStats> = {};
    (data || []).forEach((record: any) => {
      if (!statsMap[record.product_id]) {
        statsMap[record.product_id] = {
          product_id: record.product_id,
          product_name: record.product_name,
          unit: record.unit,
          total_quantity: 0,
          first_harvest: record.harvest_date,
          last_harvest: record.harvest_date,
        };
      }
      statsMap[record.product_id].total_quantity += record.quantity;
      if (record.harvest_date < statsMap[record.product_id].first_harvest)
        statsMap[record.product_id].first_harvest = record.harvest_date;
      if (record.harvest_date > statsMap[record.product_id].last_harvest)
        statsMap[record.product_id].last_harvest = record.harvest_date;
    });
    return Object.values(statsMap);
  }

  async deleteHarvest(id: string): Promise<void> {
    const { error } = await this.supabase.from('harvests').delete().eq('id', id);
    if (error) throw new Error(`Xóa bản ghi thu hoạch thất bại: ${error.message}`);
  }

  async getAvailableProducts(): Promise<ProductInfo[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, name, stock, unit')
      .eq('type', 'Hàng hóa')
      .order('name');
    if (error) throw new Error(`Lấy danh sách sản phẩm thất bại: ${error.message}`);
    return data || [];
  }
}