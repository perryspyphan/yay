// ============================================================
// APPLICATION LAYER - InventoryInput.dto.ts
// Nhiệm vụ: Định nghĩa cấu trúc dữ liệu gửi từ UI lên UseCase.
// Chặn không cho gửi giá trị không hợp lệ (validation rules).
// KHÔNG gọi Supabase, KHÔNG render UI.
// ============================================================

export interface InventoryCheckItemDTO {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  stock_quantity: number;
  actual_quantity: number;  // Giá trị người dùng nhập
  diff_quantity: number;    // Tính bởi UseCase: actual - stock
  sell_price: number;
  diff_value: number;       // Tính bởi UseCase: diff_quantity * sell_price
}

export interface AdjustStockInputDTO {
  inventory_check_id: string;
  items: InventoryCheckItemDTO[];
  balanced_by: string;
}

export interface CreateInventoryCheckDTO {
  creator: string;
  notes?: string;
}

// Validation helper - chạy trước khi gửi lên UseCase
export function validateAdjustStockInput(input: AdjustStockInputDTO): string | null {
  if (!input.inventory_check_id) return 'Thiếu mã phiếu kiểm kho';
  if (!input.balanced_by) return 'Thiếu thông tin người cân bằng';
  if (!input.items || input.items.length === 0) return 'Phiếu không có sản phẩm nào';

  for (const item of input.items) {
    if (!item.product_id) return `Sản phẩm thiếu mã hàng`;
    if (item.actual_quantity < 0) return `Số lượng thực tế không được âm: ${item.product_name}`;
    if (item.stock_quantity < 0) return `Tồn kho hệ thống không hợp lệ: ${item.product_name}`;
  }

  return null; // null = hợp lệ
}