// src/application/use-cases/order/CreateOrderUseCase.ts
'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateOrderDTO } from '@/application/dto/OrderDTO'

export async function createOrderUseCase(dto: CreateOrderDTO): Promise<string> {
  if (!dto.customerId)          throw new Error('Thiếu khách hàng')
  if (dto.items.length === 0)   throw new Error('Đơn hàng trống')

  const supabase = await createClient()

  // Sinh order ID
  const { data: last } = await supabase
    .from('orders')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
  const nextNum = last?.[0]?.id
    ? parseInt(last[0].id.replace('DH', ''), 10) + 1
    : 1
  const orderId = 'DH' + String(nextNum).padStart(6, '0')

  const total = dto.items.reduce((s, i) => {
    const discounted = Math.round(i.unitPrice * (1 - (i.discount ?? 0) / 100))
    return s + discounted * i.quantity
  }, 0)

  const { error: orderError } = await supabase.from('orders').insert({
    id:              orderId,
    customer_id:     dto.customerId,
    seller:          dto.customerName,
    total,
    status:          'pending',
    workflow_status: 'Chờ xác nhận',
    ordered_at:      new Date().toISOString(),
    priority_score:  0,
    note:            dto.note ?? null,
  })
  if (orderError) throw new Error(orderError.message)

  const items = dto.items.map(i => ({
    order_id:     orderId,
    product_code: i.productCode,
    product_name: i.productName,
    quantity:     i.quantity,
    unit_price:   i.unitPrice,
    discount:     i.discount ?? 0,
    sell_price:   Math.round(i.unitPrice * (1 - (i.discount ?? 0) / 100)),
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(items)
  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/giao-dich/dat-hang/khach-hang')
  return orderId
}
