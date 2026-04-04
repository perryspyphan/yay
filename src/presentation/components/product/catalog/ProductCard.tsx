// src/presentation/components/product/ProductCard.tsx
'use client'

import React from 'react'
import type { Product } from '@/domain/entities/Product'
import { getStockStatus, stockStatusColor } from '@/domain/services/InventoryService'
import { useCart } from '@/presentation/hooks/useCart'

const fmt = (n: number) => n.toLocaleString('vi-VN')

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const stockStatus = getStockStatus(product)
  const outOfStock = stockStatus === 'out_of_stock'

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (outOfStock) return
    addItem({
      productId:   product.id,
      productCode: product.code,
      productName: product.name,
      quantity:    1,
      unitPrice:   product.sell_price,
      imageUrl:    product.image_url ?? undefined,
    })
    openCart()
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
        overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Image */}
      <div style={{
        width: '100%', height: 160, background: '#F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 48 }}>📦</span>
        }
        {/* Stock badge */}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#EF4444', color: '#fff', padding: '4px 12px',
              borderRadius: 20, fontSize: 12, fontWeight: 700,
            }}>Hết hàng</span>
          </div>
        )}
        {/* Group badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(255,255,255,0.92)', borderRadius: 20,
          padding: '2px 10px', fontSize: 11, fontWeight: 600, color: '#006E1C',
        }}>
          {product.group}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Code */}
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{product.code}</div>

        {/* Name */}
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#111827',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#006E1C' }}>{fmt(product.sell_price)} ₫</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Vốn: {fmt(product.cost_price)} ₫</div>
          </div>
          {/* Stock */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: stockStatusColor(stockStatus) }}>
              {product.stock}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>tồn kho</div>
          </div>
        </div>

        {/* Add to cart button */}
        {product.can_sell_direct && (
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            style={{
              width: '100%', height: 34, borderRadius: 8, border: 'none',
              background: outOfStock ? '#E5E7EB' : '#006E1C',
              color: outOfStock ? '#9CA3AF' : '#fff',
              fontSize: 13, fontWeight: 600, cursor: outOfStock ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'background 0.15s',
            }}
          >
            {outOfStock ? 'Hết hàng' : '+ Thêm vào giỏ'}
          </button>
        )}
      </div>
    </div>
  )
}
