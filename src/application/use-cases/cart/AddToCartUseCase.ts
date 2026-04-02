// src/application/use-cases/cart/AddToCartUseCase.ts
// Cart được quản lý hoàn toàn client-side (Zustand store)
// File này export helper functions dùng trong store

import type { Cart, CartItem } from '@/domain/entities/Cart'
import type { AddToCartDTO } from '@/application/dto/CartDTO'

export function addToCart(cart: Cart, dto: AddToCartDTO): Cart {
  const existing = cart.items.findIndex(i => i.productId === dto.productId)

  if (existing >= 0) {
    // Tăng số lượng nếu đã có
    const items = cart.items.map((item, idx) =>
      idx === existing ? { ...item, quantity: item.quantity + dto.quantity } : item
    )
    return { ...cart, items }
  }

  const newItem: CartItem = {
    productId:   dto.productId,
    productCode: dto.productCode,
    productName: dto.productName,
    quantity:    dto.quantity,
    unitPrice:   dto.unitPrice,
    imageUrl:    dto.imageUrl,
  }
  return { ...cart, items: [...cart.items, newItem] }
}
