'use server'

import { createClient } from '@/infrastructure/supabase/server'
import type { DistributorOrderWithItems } from '@/domain/entities/DistributorOrder'

export interface DistributorInvoice {
  id: string
  distributor_id: string
  distributor_name: string
  subtotal: number
  total: number
  discount_pct: number
  status: 'Hoàn thành' | 'Đã huỷ'
  ordered_at: string
  delivery_date: string | null
  ordered_by: string | null
}

export async function getDistributorInvoicesUseCase(): Promise<DistributorInvoice[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('distributor_orders')
    .select('*, distributors(name)')
    .in('status', ['Hoàn thành', 'Đã huỷ'])
    .order('ordered_at', { ascending: false })
  if (error) throw new Error(error.message)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    distributor_id: row.distributor_id,
    distributor_name: row.distributors?.name ?? row.distributor_id,
    subtotal: row.subtotal ?? row.total ?? 0,
    total: row.total ?? 0,
    discount_pct: row.discount_pct ?? 0,
    status: row.status,
    ordered_at: row.ordered_at,
    delivery_date: row.delivery_date ?? null,
    ordered_by: row.ordered_by ?? null,
  }))
}

export async function getDistributorInvoiceWithItemsUseCase(orderId: string): Promise<DistributorOrderWithItems | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('distributor_orders')
    .select('*, distributors(name, phone, email, address, tax_code), distributor_order_items(*)')
    .eq('id', orderId)
    .single()
  if (error || !data) return null
  return {
    ...data,
    distributor_name: data.distributors?.name ?? '',
    items: data.distributor_order_items ?? [],
  } as DistributorOrderWithItems
}