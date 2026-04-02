'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DistributorGroup, DistributorOrderItem, DistributorOrderWithItems } from '@/domain/entities/Distributor'
import { getDistributorRepository } from '@/infrastructure/container/DIContainer'

export async function getDistributorsUseCase(filters?: {
  search?: string; group?: string; minTotal?: number; maxTotal?: number
  minDebt?: number; maxDebt?: number; status?: string; dateFrom?: string; dateTo?: string
}) {
  return getDistributorRepository().getAll(filters)
}

export async function getOrdersByDistributorUseCase(distributorId: string) {
  return getDistributorRepository().getOrdersByDistributor(distributorId)
}

export async function addDistributorUseCase(form: {
  name: string; phone: string; email: string
  address: string; tax_code: string; group: DistributorGroup
}) {
  return getDistributorRepository().add(form)
}

export async function updateDistributorUseCase(id: string, form: {
  name: string; phone: string | null; email: string | null
  address: string | null; tax_code: string | null; group: DistributorGroup
}) {
  return getDistributorRepository().update(id, form)
}

export async function deleteDistributorsUseCase(ids: string[]) {
  return getDistributorRepository().deleteMany(ids)
}

// ── Lấy chi tiết hóa đơn NPP kèm items + thông tin distributor ──
export async function getDistributorOrderWithItemsUseCase(orderId: string): Promise<DistributorOrderWithItems> {
  const supabase = await createClient()

  const { data: order, error: oErr } = await supabase
    .from('distributor_orders')
    .select('*')
    .eq('id', orderId)
    .single()
  if (oErr) throw new Error(oErr.message)

  const { data: dist, error: dErr } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', order.distributor_id)
    .single()
  if (dErr) throw new Error(dErr.message)

  const { data: items } = await supabase
    .from('distributor_order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('id')

  // Lấy tên staff nếu có
  let staffName = null
  let confirmedByName = null
  if (order.staff_id) {
    const { data: s } = await supabase.from('staff').select('name').eq('id', order.staff_id).single()
    staffName = s?.name || null
  }
  if (order.discount_confirmed_by) {
    const { data: s } = await supabase.from('staff').select('name').eq('id', order.discount_confirmed_by).single()
    confirmedByName = s?.name || null
  }

  return {
    ...order,
    staff_name: staffName,
    confirmed_by_name: confirmedByName,
    distributor: dist,
    items: items || [],
  }
}

// ── Verify PIN của staff ──
export async function verifyStaffPinUseCase(staffId: string, pin: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('staff')
    .select('pin_hash')
    .eq('id', staffId)
    .single()
  if (!data?.pin_hash) return false
  // So sánh trực tiếp (nếu dùng plain text) hoặc hash tùy setup
  return data.pin_hash === pin
}

// ── Tạo đơn NPP mới ──
export async function createDistributorOrderUseCase(form: {
  distributor_id: string
  items: Omit<DistributorOrderItem, 'id' | 'order_id'>[]
  discount_pct: number
  discount_confirmed_by: string | null
  staff_id: string
  invoice_date: string
  delivery_date: string
  delivery_location: string
  note: string
  status: string
}): Promise<string> {
  const supabase = await createClient()

  // Tính total sau chiết khấu
  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.sell_price, 0)
  const discount = Math.round(subtotal * form.discount_pct / 100)
  const total = subtotal - discount

  // Tạo ID mới
  const { data: last } = await supabase
    .from('distributor_orders')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
  const lastNum = last?.[0]?.id ? parseInt(last[0].id.replace('HDN', ''), 10) : 0
  const newId = 'HDN' + String(lastNum + 1).padStart(6, '0')

  // Insert order
  const { error: oErr } = await supabase.from('distributor_orders').insert({
    id: newId,
    distributor_id: form.distributor_id,
    total,
    debt_amount: form.status === 'Chưa thanh toán' ? total : 0,
    status: form.status,
    ordered_at: new Date().toISOString(),
    staff_id: form.staff_id,
    discount_pct: form.discount_pct,
    discount_confirmed_by: form.discount_confirmed_by,
    discount_confirmed_at: form.discount_confirmed_by ? new Date().toISOString() : null,
    invoice_date: form.invoice_date || null,
    delivery_date: form.delivery_date || null,
    delivery_location: form.delivery_location || null,
    note: form.note || null,
  })
  if (oErr) throw new Error(oErr.message)

  // Insert items
  if (form.items.length > 0) {
    const { error: iErr } = await supabase.from('distributor_order_items').insert(
      form.items.map(item => ({ ...item, order_id: newId }))
    )
    if (iErr) throw new Error(iErr.message)
  }

  // Ghi activity_log
  await supabase.from('activity_logs').insert({
    staff_id: form.staff_id,
    action: form.discount_pct > 0 ? 'create_order_with_discount' : 'create_order',
    target_id: newId,
    note: `Tạo đơn ${newId} cho NPP ${form.distributor_id}${form.discount_pct > 0 ? ` - Chiết khấu ${form.discount_pct}%` : ''}`,
  })

  // Cập nhật total_buy của distributor
  await supabase.rpc('increment_distributor_total', {
    dist_id: form.distributor_id,
    amount: total
  }).maybeSingle()

  revalidatePath('/nha-phan-phoi')
  return newId
}