// ============================================================
// APPLICATION LAYER - HarvestInput.dto.ts
// Nhiệm vụ: Định nghĩa dữ liệu đầu vào cho chức năng Thu hoạch.
// Kiểm tra ngày thu hoạch không được ở tương lai.
// Kiểm tra số lượng phải > 0.
// KHÔNG gọi Supabase, KHÔNG render UI.
// ============================================================

export interface HarvestInputDTO {
  product_id: string;
  quantity: number;      // Phải > 0
  harvest_date: string;  // ISO date string, không được là ngày tương lai
  notes?: string;
}

// Validation helper - chạy trước khi gửi lên UseCase
export function validateHarvestInput(input: HarvestInputDTO): string | null {
  if (!input.product_id) return 'Chưa chọn sản phẩm';
  if (!input.quantity || input.quantity <= 0) return 'Số lượng thu hoạch phải lớn hơn 0';
  if (!input.harvest_date) return 'Chưa chọn ngày thu hoạch';

  const harvestDate = new Date(input.harvest_date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Cho phép ngày hôm nay

  if (harvestDate > today) {
    return 'Ngày thu hoạch không được ở tương lai';
  }

  return null; // null = hợp lệ
}