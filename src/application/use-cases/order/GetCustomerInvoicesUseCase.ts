'use server'

import { createClient } from '@/infrastructure/supabase/server'
import type { OrderWithItems } from '@/domain/entities/Customer'

export interface Invoice {
  id: string
  customer_id: string
  customer_name: string
  seller: string
  total: number
  workflow_status: 'Hoàn thành' | 'Đã hủy' | 'Từ chối'
  ordered_at: string
}

export async function getCustomerInvoicesUseCase(): Promise<Invoice[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name)')
    .in('workflow_status', ['Hoàn thành', 'Đã hủy', 'Từ chối'])
    .order('ordered_at', { ascending: false })
  if (error) throw new Error(error.message)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((o: any) => ({
    id: o.id,
    customer_id: o.customer_id,
    customer_name: o.customers?.name || o.customer_id,
    seller: o.seller ?? '',
    total: o.total ?? 0,
    workflow_status: o.workflow_status,
    ordered_at: o.ordered_at,
  }))
}

export async function getInvoiceWithItemsUseCase(orderId: string): Promise<OrderWithItems> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()
  if (error) throw new Error(error.message)
  return data
}