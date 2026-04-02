// src/application/use-cases/order/GetOrdersUseCase.ts
'use server'

import { getOrderRepository } from '@/infrastructure/container/DIContainer'

export async function getOrdersUseCase() {
  return getOrderRepository().findAll()
}
