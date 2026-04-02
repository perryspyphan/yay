// src/domain/entities/Cart.ts

export interface CartItem {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  imageUrl?: string
}

export interface Cart {
  customerId: string | null
  items: CartItem[]
  note?: string
  createdAt: Date
}

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}
