// src/presentation/components/cart/CartDrawer.tsx
'use client'

import React from 'react'
import { useCart } from '@/presentation/hooks/useCart'

const fmt = (n: number) => n.toLocaleString('vi-VN')

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQty, clear, total } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          zIndex: 900, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>
            Giỏ hàng ({cart.items.length})
          </span>
          <button onClick={closeCart} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <div style={{ fontSize: 14 }}>Giỏ hàng trống</div>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.productId} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: '1px solid #F9FAFB',
              }}>
                {/* Image */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: '#F1F5F9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, overflow: 'hidden',
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📦'
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>{item.productCode}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Qty controls */}
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}
                    >−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}
                    >+</button>
                    <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 600, color: '#006E1C' }}>
                      {fmt(item.unitPrice * item.quantity)} ₫
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 18, alignSelf: 'flex-start', padding: 2 }}
                >×</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>Tổng cộng</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#006E1C' }}>{fmt(total())} ₫</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={clear}
                style={{ flex: 1, height: 42, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >Xóa tất cả</button>
              <button
                style={{ flex: 2, height: 42, border: 'none', borderRadius: 10, background: '#006E1C', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >Tạo đơn hàng →</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
