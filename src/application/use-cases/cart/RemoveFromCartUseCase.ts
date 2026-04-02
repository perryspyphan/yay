// src/application/use-cases/cart/RemoveFromCartUseCase.ts

import type { Cart } from '@/domain/entities/Cart'

export function removeFromCart(cart: Cart, productId: string): Cart {
  return { ...cart, items: cart.items.filter(i => i.productId !== productId) }
}

export function updateCartQty(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity <= 0) return removeFromCart(cart, productId)
  return {
    ...cart,
    items: cart.items.map(i => i.productId === productId ? { ...i, quantity } : i),
  }
}

export function clearCart(cart: Cart): Cart {
  return { ...cart, items: [] }
}
