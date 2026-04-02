// src/app/(admin)/hang-hoa/page.tsx
import { Suspense } from 'react'
import { getProductsUseCase } from '@/application/use-cases/product/ProductUseCases'
import ProductTable from '@/presentation/components/product/ProductTable'

export const dynamic = 'force-dynamic'

export default async function HangHoaPage() {
  const products = await getProductsUseCase()
  return (
    <Suspense>
      <ProductTable initialProducts={products} />
    </Suspense>
  )
}
