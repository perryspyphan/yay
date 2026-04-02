// Tầng Infrastructure — cài đặt cụ thể dùng Supabase
// Implements interface từ Domain

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IDistributorOrderRepository, DistributorOrderFilters, CreateDistributorOrderInput } from '@/domain/repositories/IDistributorOrderRepository'
import type { DistributorOrder, DistributorOrderStatus, DistributorOrderWithItems } from '@/domain/entities/DistributorOrder'

// Sinh mã đơn tự động HDN000001, HDN000002...
async function generateOrderId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { data } = await supabase
    .from('distributor_orders')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)

  let nextNum = 1
  if (data && data.length > 0) {
    const last = data[0].id.replace('HDN', '')
    nextNum = parseInt(last, 10) + 1
  }
  return 'HDN' + String(nextNum).padStart(6, '0')
}

export class SupabaseDistributorOrderRepository implements IDistributorOrderRepository {

  // ── Lấy danh sách đơn hàng, có join tên NPP ──
  async getAll(filters?: DistributorOrderFilters): Promise<DistributorOrder[]> {
    const supabase = await createClient()

    // Join với bảng distributors để lấy tên NPP hiển thị trực tiếp
    let q = supabase
      .from('distributor_orders')
      .select(`
        *,
        distributors ( name )
      `)
      .order('ordered_at', { ascending: false })

    if (filters?.status) q = q.eq('status', filters.status)
    if (filters?.dateFrom) q = q.gte('ordered_at', filters.dateFrom)
    if (filters?.dateTo) q = q.lte('ordered_at', filters.dateTo + 'T23:59:59')
    if (filters?.search) {
      const s = filters.search
      q = q.or(`id.ilike.%${s}%,distributor_id.ilike.%${s}%`)
    }

    const { data, error } = await q
    if (error) throw new Error(error.message)

    // Flatten: đưa distributor.name lên thành distributor_name
    return (data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      distributor_name: (row.distributors as { name: string } | null)?.name ?? '',
    })) as DistributorOrder[]
  }

  // ── Lấy 1 đơn kèm danh sách sản phẩm ──
  async getById(id: string): Promise<DistributorOrderWithItems | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('distributor_orders')
      .select(`
        *,
        distributors ( name, phone, email, address, tax_code ),
        distributor_order_items ( * )
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      ...data,
      distributor_name: (data.distributors as { name: string } | null)?.name ?? '',
      items: data.distributor_order_items ?? [],
    } as DistributorOrderWithItems
  }

  // ── Tạo đơn mới: insert vào 2 bảng trong 1 transaction ──
  async create(input: CreateDistributorOrderInput): Promise<string> {
    const supabase = await createClient()
    const id = await generateOrderId(supabase)

    // Tính tổng trước và sau chiết khấu
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )
    const discountAmt = Math.round(subtotal * input.discount_pct / 100)
    const total = subtotal - discountAmt

    // 1. Tạo đơn hàng
    const { error: orderErr } = await supabase
      .from('distributor_orders')
      .insert({
        id,
        distributor_id: input.distributor_id,
        subtotal,
        total,
        discount_pct: input.discount_pct,
        discount_confirmed_by: input.discount_confirmed_by,
        discount_confirmed_at: input.discount_confirmed_at,
        status: 'Chờ giao',
        delivery_date: input.delivery_date,
        note: input.note,
        ordered_by: input.ordered_by,
        ordered_at: new Date().toISOString(),
        // Giữ tương thích với schema cũ
        debt_amount: 0,
      })

    if (orderErr) throw new Error(orderErr.message)

    // 2. Tạo các dòng sản phẩm
    const itemsToInsert = input.items.map(item => ({
      order_id: id,
      product_code: item.product_code,
      product_name: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sell_price: item.sell_price,
    }))

    const { error: itemsErr } = await supabase
      .from('distributor_order_items')
      .insert(itemsToInsert)

    if (itemsErr) throw new Error(itemsErr.message)

    // 3. Cộng dồn total_buy của NPP
    const { data: dist } = await supabase
      .from('distributors')
      .select('total_buy')
      .eq('id', input.distributor_id)
      .single()

    if (dist) {
      await supabase
        .from('distributors')
        .update({ total_buy: (dist.total_buy ?? 0) + total })
        .eq('id', input.distributor_id)
    }

    revalidatePath('/giao-dich/dat-hang/nha-phan-phoi')
    return id
  }

  // ── Cập nhật trạng thái đơn hàng ──
  async updateStatus(id: string, status: DistributorOrderStatus): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('distributor_orders')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/giao-dich/dat-hang/nha-phan-phoi')
  }
}