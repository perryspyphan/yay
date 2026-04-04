// ============================================================
// INFRASTRUCTURE LAYER - InventoryRepository.ts
// Nhiệm vụ: Nơi DUY NHẤT gọi supabase cho tính năng Kiểm kho.
//   - createCheck(): Tạo phiếu kiểm kho mới với code tự sinh
//   - getCheckById(): Lấy phiếu theo ID
//   - getAllChecks(): Lấy danh sách phiếu với filter
//   - getCheckItems(): Lấy các item của một phiếu
//   - addItem(): Thêm sản phẩm vào phiếu
//   - balanceItems(): Cập nhật stock product + item diff (gọi bởi UseCase)
//   - completeCheck(): Đánh dấu phiếu "Đã cân bằng" + lưu tổng
//   - cancelCheck(): Hủy phiếu
//   - deleteCheck(): Xóa phiếu và toàn bộ items
// KHÔNG chứa logic tính toán kinh doanh, KHÔNG render UI.
// ============================================================

import { supabase } from '@/lib/supabase';
import { InventoryCheck, InventoryItem, InventoryFilter } from '../../domain/Inventory';
import { InventoryCheckItemDTO } from '../../application/dtos/InventoryInput.dto';

export class InventoryRepository {
  // ─── Tạo phiếu kiểm kho ──────────────────────────────────
  async createCheck(data: { creator: string; notes?: string }): Promise<InventoryCheck> {
    // Tự sinh mã phiếu theo format KK + timestamp
    const code = `KK${Date.now().toString().slice(-6)}`;

    const { data: result, error } = await supabase
      .from('inventory_checks')
      .insert([{
        code,
        creator: data.creator,
        notes: data.notes,
        status: 'Phiếu tạm',
        actual_quantity: 0,
        total_items: 0,
        total_increase: 0,
        total_decrease: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw new Error(`Tạo phiếu thất bại: ${error.message}`);
    return result;
  }

  // ─── Lấy phiếu theo ID ───────────────────────────────────
  async getCheckById(id: string): Promise<InventoryCheck | null> {
    const { data, error } = await supabase
      .from('inventory_checks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // ─── Lấy danh sách phiếu với filter ─────────────────────
  async getAllChecks(filters?: InventoryFilter): Promise<InventoryCheck[]> {
    let query = supabase.from('inventory_checks').select('*');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.creator) query = query.ilike('creator', `%${filters.creator}%`);
    if (filters?.createdFrom) query = query.gte('created_at', filters.createdFrom);
    if (filters?.createdTo) query = query.lte('created_at', filters.createdTo);
    if (filters?.searchCode) query = query.ilike('code', `%${filters.searchCode}%`);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Lấy danh sách phiếu thất bại: ${error.message}`);
    return data || [];
  }

  // ─── Lấy items của một phiếu ─────────────────────────────
  async getCheckItems(checkId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_check_items')
      .select('*')
      .eq('inventory_check_id', checkId);

    if (error) throw new Error(`Lấy items phiếu thất bại: ${error.message}`);
    return data || [];
  }

  // ─── Thêm sản phẩm vào phiếu ─────────────────────────────
  async addItem(item: {
    inventory_check_id: string;
    product_id: string;
    product_name: string;
    unit: string;
    stock_quantity: number;
    sell_price: number;
  }): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_check_items')
      .insert([{
        ...item,
        actual_quantity: 0,
        diff_quantity: 0,
        diff_value: 0,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw new Error(`Thêm sản phẩm vào phiếu thất bại: ${error.message}`);
    return data;
  }

  // ─── Cân bằng: Cập nhật stock và item diff ───────────────
  // Được gọi bởi AdjustStockUseCase sau khi đã tính toán xong
  async balanceItems(items: InventoryCheckItemDTO[]): Promise<void> {
    for (const item of items) {
      // Cập nhật tồn kho thực tế trong bảng products
      const newStock = item.stock_quantity + item.diff_quantity;
      const { error: productError } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.product_id);

      if (productError) throw new Error(`Cập nhật stock sản phẩm ${item.product_id} thất bại: ${productError.message}`);

      // Lưu số liệu chênh lệch vào inventory_check_items
      const { error: itemError } = await supabase
        .from('inventory_check_items')
        .update({
          actual_quantity: item.actual_quantity,
          diff_quantity: item.diff_quantity,
          diff_value: item.diff_value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (itemError) throw new Error(`Cập nhật item ${item.id} thất bại: ${itemError.message}`);
    }
  }

  // ─── Hoàn tất phiếu: đổi trạng thái + lưu tổng ──────────
  async completeCheck(id: string, data: {
    balanced_by: string;
    total_increase: number;
    total_decrease: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('inventory_checks')
      .update({
        status: 'Đã cân bằng',
        balanced_by: data.balanced_by,
        balanced_at: new Date().toISOString(),
        total_increase: data.total_increase,
        total_decrease: data.total_decrease,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Hoàn tất phiếu thất bại: ${error.message}`);
  }

  // ─── Hủy phiếu ───────────────────────────────────────────
  async cancelCheck(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_checks')
      .update({ status: 'Đã hủy', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Hủy phiếu thất bại: ${error.message}`);
  }

  // ─── Xóa phiếu và toàn bộ items ─────────────────────────
  async deleteCheck(id: string): Promise<void> {
    const { error: itemError } = await supabase
      .from('inventory_check_items')
      .delete()
      .eq('inventory_check_id', id);

    if (itemError) throw new Error(`Xóa items thất bại: ${itemError.message}`);

    const { error } = await supabase
      .from('inventory_checks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Xóa phiếu thất bại: ${error.message}`);
  }

  // ─── Lưu tạm phiếu (cập nhật actual_quantity) ────────────
  async saveDraft(checkId: string, items: Pick<InventoryCheckItemDTO, 'id' | 'actual_quantity'>[]): Promise<void> {
    for (const item of items) {
      const { error } = await supabase
        .from('inventory_check_items')
        .update({
          actual_quantity: item.actual_quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (error) throw new Error(`Lưu tạm item ${item.id} thất bại: ${error.message}`);
    }

    await supabase
      .from('inventory_checks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', checkId);
  }
}