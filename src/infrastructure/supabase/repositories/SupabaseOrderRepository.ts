// src/infrastructure/supabase/repositories/SupabaseOrderRepository.ts

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IOrderRepository } from '@/domain/repositories/IOrderRepository'

export class SupabaseOrderRepository implements IOrderRepository {

  async findAll() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('ordered_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }

  async findTodaySummary() {
    const supabase = await createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('orders')
      .select('total, workflow_status')
      .gte('ordered_at', today.toISOString())

    if (error) throw error

    const completed = (data ?? []).filter(o => o.workflow_status === 'Hoàn thành')
    const totalRevenue  = completed.reduce((s, o) => s + Number(o.total), 0)
    const totalOrders   = (data ?? []).length
    const pendingOrders = (data ?? []).filter(o =>
      ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao'].includes(o.workflow_status)
    ).length

    return { totalRevenue, totalOrders, pendingOrders }
  }

  async findMonthlyRevenue() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('total, ordered_at')
      .eq('workflow_status', 'Hoàn thành')
      .order('ordered_at', { ascending: true })

    if (error) throw error

    const map = new Map<string, number>()
    for (const row of data ?? []) {
      const month = new Date(row.ordered_at)
        .toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
      map.set(month, (map.get(month) ?? 0) + Number(row.total))
    }
    return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }))
  }

  async findTopSellingProducts() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('order_items')
      .select('product_name, product_code, quantity')

    if (error) throw error

    const map = new Map<string, { name: string; total: number }>()
    for (const row of data ?? []) {
      const existing = map.get(row.product_code) ?? { name: row.product_name, total: 0 }
      map.set(row.product_code, { ...existing, total: existing.total + Number(row.quantity) })
    }
    return Array.from(map.entries())
      .map(([code, val]) => ({ code, name: val.name, totalSold: val.total }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
  }

  async findLowStockCount(): Promise<number> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, stock, min_stock')
      .gt('min_stock', 0)
    if (error) throw error
    return (data ?? []).filter(p => Number(p.stock) < Number(p.min_stock)).length
  }

  async findRecentActivities() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, staff_id, action, target_id, note, created_at')
      .order('created_at', { ascending: false })
      .limit(6)
    if (error) throw error
    return data ?? []
  }

  async findConflictedOrders(productCode: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .rpc('get_conflicted_orders', { p_product_code: productCode })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async resolveConflict(conflictId: string, resolution: {
    confirmOrderId: string
    cancelOrderIds: string[]
    handledBy: string
    note?: string
  }): Promise<void> {
    const supabase = await createClient()

    await supabase.from('order_conflicts').update({
      status:      'resolved',
      resolution:  'confirmed_high',
      handled_by:  resolution.handledBy,
      note:        resolution.note ?? null,
      resolved_at: new Date().toISOString(),
      resolved_by_priority: true,
    }).eq('id', conflictId)

    await supabase.from('orders')
      .update({ workflow_status: 'Đã xác nhận' })
      .eq('id', resolution.confirmOrderId)

    if (resolution.cancelOrderIds.length > 0) {
      await supabase.from('orders')
        .update({ workflow_status: 'Đã hủy' })
        .in('id', resolution.cancelOrderIds)
    }

    revalidatePath('/giao-dich/dat-hang/khach-hang')
  }
}
