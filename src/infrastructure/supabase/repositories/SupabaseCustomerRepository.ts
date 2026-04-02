// src/infrastructure/supabase/repositories/SupabaseCustomerRepository.ts
// XOÁ customer-repository.impl.ts sau khi dùng file này

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ICustomerRepository, CustomerFilters } from '@/domain/repositories/ICustomerRepository'
import type { Customer, Order, OrderWithItems, CustomerTier } from '@/domain/entities/Customer'
import { calcTier, shouldUpgrade } from '@/domain/value-objects/CustomerTier'

export class SupabaseCustomerRepository implements ICustomerRepository {

  async getAll(filters?: CustomerFilters): Promise<Customer[]> {
    const supabase = await createClient()
    let q = supabase.from('customers').select('*').order('id')

    if (filters?.tier)     q = q.eq('tier', filters.tier)
    if (filters?.minTotal) q = q.gte('total', filters.minTotal)
    if (filters?.maxTotal) q = q.lte('total', filters.maxTotal)
    if (filters?.dateFrom) q = q.gte('created_at', filters.dateFrom)
    if (filters?.dateTo)   q = q.lte('created_at', filters.dateTo)
    if (filters?.search) {
      const s = filters.search
      q = q.or(`id.ilike.%${s}%,name.ilike.%${s}%,phone.ilike.%${s}%`)
    }

    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('ordered_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getOrderWithItems(orderId: string): Promise<OrderWithItems> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async add(form: { name: string; phone: string; email?: string; tier: CustomerTier }): Promise<void> {
    const supabase = await createClient()

    // Sinh ID dạng KH001 – race condition thấp với quy mô nhỏ
    const { data: last } = await supabase
      .from('customers')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
    const nextNum = last?.[0]?.id
      ? parseInt(last[0].id.replace('KH', ''), 10) + 1
      : 1
    const id = 'KH' + String(nextNum).padStart(3, '0')

    const { error } = await supabase.from('customers').insert({
      id,
      name:       form.name,
      phone:      form.phone || null,
      email:      form.email || null,
      tier:       form.tier,
      total:      0,
      created_at: new Date().toISOString().split('T')[0],
    })
    if (error) throw new Error(error.message)
    revalidatePath('/khach-hang')
  }

  async update(
    id: string,
    form: { name: string; phone: string | null; email: string | null; tier: CustomerTier }
  ): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('customers')
      .update({ name: form.name, phone: form.phone, email: form.email, tier: form.tier })
      .eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/khach-hang')
  }

  async deleteMany(ids: string[]): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('customers').delete().in('id', ids)
    if (error) throw new Error(error.message)
    revalidatePath('/khach-hang')
  }

  // Dùng khi cần force sync tier (tier thường do DB trigger tự cập nhật)
  async syncTier(customerId: string): Promise<void> {
    const supabase = await createClient()
    const { data: c } = await supabase
      .from('customers')
      .select('total, tier')
      .eq('id', customerId)
      .single()
    if (!c) return

    const newTier = calcTier(c.total)
    if (shouldUpgrade(c.tier as CustomerTier, newTier)) {
      await supabase.from('customers').update({ tier: newTier }).eq('id', customerId)
    }
  }
}