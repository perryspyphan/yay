import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IDistributorRepository, DistributorFilters } from '@/domain/repositories/IDistributorRepository'
import type { Distributor, DistributorOrder, DistributorGroup } from '@/domain/entities/Distributor'

export class SupabaseDistributorRepository implements IDistributorRepository {
  async getAll(filters?: DistributorFilters): Promise<Distributor[]> {
    const supabase = await createClient()
    let q = supabase.from('distributors').select('*').order('id')
    if (filters?.group) q = q.eq('group', filters.group)
    if (filters?.status) q = q.eq('status', filters.status)
    if (filters?.minTotal) q = q.gte('total_buy', filters.minTotal)
    if (filters?.maxTotal) q = q.lte('total_buy', filters.maxTotal)
    if (filters?.minDebt) q = q.gte('debt', filters.minDebt)
    if (filters?.maxDebt) q = q.lte('debt', filters.maxDebt)
    if (filters?.dateFrom) q = q.gte('created_at', filters.dateFrom)
    if (filters?.dateTo) q = q.lte('created_at', filters.dateTo)
    if (filters?.search) {
      const s = filters.search
      q = q.or(`id.ilike.%${s}%,name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`)
    }
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getOrdersByDistributor(distributorId: string): Promise<DistributorOrder[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('distributor_orders').select('*')
      .eq('distributor_id', distributorId)
      .order('ordered_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async add(form: { name: string; phone: string; email: string; address: string; tax_code: string; group: DistributorGroup }): Promise<void> {
    const supabase = await createClient()
    const { data: all } = await supabase.from('distributors').select('id').order('id', { ascending: false }).limit(1)
    let nextNum = 1
    if (all && all.length > 0) nextNum = parseInt(all[0].id.replace('NPP', ''), 10) + 1
    const id = 'NPP' + String(nextNum).padStart(3, '0')
    const { error } = await supabase.from('distributors').insert({
      id, name: form.name, phone: form.phone || null,
      email: form.email || null, address: form.address || null,
      tax_code: form.tax_code || null, group: form.group,
      total_buy: 0, debt: 0, status: 'Đã thanh toán',
      created_at: new Date().toISOString().split('T')[0],
    })
    if (error) throw new Error(error.message)
    revalidatePath('/nha-phan-phoi')
  }

  async update(id: string, form: { name: string; phone: string | null; email: string | null; address: string | null; tax_code: string | null; group: DistributorGroup }): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('distributors').update({
      name: form.name, phone: form.phone, email: form.email,
      address: form.address, tax_code: form.tax_code, group: form.group,
    }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/nha-phan-phoi')
  }

  async deleteMany(ids: string[]): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('distributors').delete().in('id', ids)
    if (error) throw new Error(error.message)
    revalidatePath('/nha-phan-phoi')
  }
}