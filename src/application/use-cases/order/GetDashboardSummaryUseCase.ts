import { IOrderRepository } from '@/domain/repositories/IOrderRepository'

export class GetDashboardSummaryUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute() {
    const [todaySummary, monthlyRevenue, topProducts] = await Promise.all([
      this.orderRepo.findTodaySummary(),
      this.orderRepo.findMonthlyRevenue(),
      this.orderRepo.findTopSellingProducts(),
    ])

    return { todaySummary, monthlyRevenue, topProducts }
  }
}