// src/application/use-cases/product/ProductUseCases.ts
'use server'

import { getProductRepository } from '@/infrastructure/container/DIContainer'
import type { AddProductDTO, UpdateProductDTO, ProductFiltersDTO } from '@/application/dto/ProductDTO'

// ── Read ────────────────────────────────────────────────────────
export async function getProductsUseCase(filters?: ProductFiltersDTO) {
  return getProductRepository().getAll(filters)
}

export async function getProductByIdUseCase(id: string) {
  return getProductRepository().getById(id)
}

// ── Mutate ──────────────────────────────────────────────────────
export async function addProductUseCase(form: AddProductDTO) {
  if (!form.name?.trim())          throw new Error('Tên hàng không được rỗng')
  if (form.sell_price < 0)         throw new Error('Giá bán không hợp lệ')
  if (form.cost_price < 0)         throw new Error('Giá vốn không hợp lệ')
  if (form.stock < 0)              throw new Error('Tồn kho không hợp lệ')
  if (form.min_stock < 0)          throw new Error('Định mức min không hợp lệ')
  if (form.max_stock < form.min_stock) throw new Error('Định mức max phải ≥ min')

  return getProductRepository().add({
    name:           form.name.trim(),
    group:          form.group,
    type:           form.type,
    sell_price:     form.sell_price,
    cost_price:     form.cost_price,
    stock:          form.stock,
    min_stock:      form.min_stock,
    max_stock:      form.max_stock,
    location:       form.location || null,
    brand:          form.brand || null,
    supplier_id:    form.supplier_id || null,
    supplier_name:  null,
    can_sell_direct: form.can_sell_direct,
    has_points:     form.has_points,
    note:           form.note || null,
    image_url:      form.image_url || null,
    expected_order: form.expected_order ?? null,
  })
}

export async function updateProductUseCase(id: string, form: UpdateProductDTO) {
  if (form.name !== undefined && !form.name?.trim()) throw new Error('Tên hàng không được rỗng')
  const { branch_stock: _, ...safeForm } = form as any
  return getProductRepository().update(id, safeForm)
}

export async function deleteProductsUseCase(ids: string[]) {
  if (ids.length === 0) throw new Error('Chưa chọn hàng hóa')
  return getProductRepository().deleteMany(ids)
}