// src/app/api/dashboard-summary/route.ts
import { NextResponse } from 'next/server'
import { getOrderRepository } from '@/infrastructure/container/DIContainer'

export async function GET() {
  try {
    const orderRepo = getOrderRepository()
    const [todaySummary, monthlyRevenue, topProducts, lowStockCount, recentActivities] = await Promise.all([
      orderRepo.findTodaySummary(),
      orderRepo.findMonthlyRevenue(),
      orderRepo.findTopSellingProducts(),
      orderRepo.findLowStockCount(),
      orderRepo.findRecentActivities(),
    ])
    return NextResponse.json({ todaySummary, monthlyRevenue, topProducts, lowStockCount, recentActivities })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
