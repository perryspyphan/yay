// src/presentation/hooks/useCart.ts
'use client'

import { create } from 'zustand'
import type { Cart, CartItem } from '@/domain/entities/Cart'
import { addToCart } from '@/application/use-cases/cart/AddToCartUseCase'
import { removeFromCart, updateCartQty, clearCart } from '@/application/use-cases/cart/RemoveFromCartUseCase'
import { cartTotal, cartItemCount } from '@/domain/entities/Cart'
import type { AddToCartDTO } from '@/application/dto/CartDTO'

interface CartStore {
  cart: Cart
  isOpen: boolean

  // Actions
  openCart:   () => void
  closeCart:  () => void
  addItem:    (dto: AddToCartDTO) => void
  removeItem: (productId: string) => void
  updateQty:  (productId: string, qty: number) => void
  clear:      () => void

  // Derived
  total:     () => number
  itemCount: () => number
}

const initialCart: Cart = { customerId: null, items: [], createdAt: new Date() }

export const useCart = create<CartStore>((set, get) => ({
  cart:   initialCart,
  isOpen: false,

  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (dto) => set(state => ({ cart: addToCart(state.cart, dto) })),

  removeItem: (productId) =>
    set(state => ({ cart: removeFromCart(state.cart, productId) })),

  updateQty: (productId, qty) =>
    set(state => ({ cart: updateCartQty(state.cart, productId, qty) })),

  clear: () => set({ cart: initialCart }),

  total:     () => cartTotal(get().cart),
  itemCount: () => cartItemCount(get().cart),
}))
