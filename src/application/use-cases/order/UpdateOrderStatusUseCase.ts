// src/application/use-cases/order/UpdateOrderStatusUseCase.ts
'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import { canTransition } from '@/domain/value-objects/OrderStatus'
import type { OrderWorkflowStatus } from '@/domain/value-objects/OrderStatus'
import type { UpdateOrderStatusDTO } from '@/application/dto/OrderDTO'

export async function updateOrderStatusUseCase(dto: UpdateOrderStatusDTO): Promise<void> {
  const supabase = await createClient()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('workflow_status')
    .eq('id', dto.orderId)
    .single()
  if (fetchErr || !order) throw new Error('Không tìm thấy đơn hàng')

  const from = order.workflow_status as OrderWorkflowStatus
  if (!canTransition(from, dto.status as OrderWorkflowStatus)) {
    throw new Error(`Không thể chuyển từ "${from}" sang "${dto.status}"`)
  }

  const { error } = await supabase
    .from('orders')
    .update({ workflow_status: dto.status })
    .eq('id', dto.orderId)
  if (error) throw new Error(error.message)

  revalidatePath('/giao-dich/dat-hang/khach-hang')
}
