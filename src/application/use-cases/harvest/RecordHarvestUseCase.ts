// ============================================================
// APPLICATION LAYER - RecordHarvestUseCase.ts
// ...
// ============================================================

import { HarvestRepository } from '@/infrastructure/supabase/repositories/HarvestRepository';
import { HarvestInputDTO, validateHarvestInput } from '@/application/dto/HarvestInput.dto';

export interface RecordHarvestResult {
  success: boolean;
  newStock?: number;
  harvestId?: string;
  error?: string;
}

export class RecordHarvestUseCase {
  private harvestRepo: HarvestRepository;

  constructor() {
    this.harvestRepo = new HarvestRepository();
  }

  async execute(input: HarvestInputDTO, currentUser: string): Promise<RecordHarvestResult> {
    const validationError = validateHarvestInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const product = await this.harvestRepo.getProductInfo(input.product_id);
      if (!product) {
        return { success: false, error: 'Không tìm thấy sản phẩm' };
      }

      const newStock = product.stock + input.quantity;

      const harvestRecord = await this.harvestRepo.saveHarvestRecord({
        product_id: input.product_id,
        product_name: product.name,
        quantity: input.quantity,
        unit: product.unit,
        harvest_date: input.harvest_date,
        creator: currentUser,
        notes: input.notes,
      });

      await this.harvestRepo.updateProductStock(input.product_id, newStock);

      return {
        success: true,
        newStock,
        harvestId: harvestRecord.id,
      };
    } catch (error: any) {
      console.error('[RecordHarvestUseCase] Lỗi ghi nhận thu hoạch:', error);
      return {
        success: false,
        error: error.message || 'Lỗi không xác định khi ghi nhận thu hoạch',
      };
    }
  }
}