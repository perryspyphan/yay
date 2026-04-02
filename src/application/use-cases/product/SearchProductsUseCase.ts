// src/application/use-cases/product/SearchProductsUseCase.ts
'use server'

import { getProductsUseCase } from './ProductUseCases'

export async function searchProductsUseCase(query: string) {
  if (!query.trim()) return []
  return getProductsUseCase({ search: query.trim() })
}
