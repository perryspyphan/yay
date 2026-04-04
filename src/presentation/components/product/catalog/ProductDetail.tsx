// src/presentation/components/product/ProductDetail.tsx
'use client'

import React, { useState } from 'react'
import type { Product } from '@/domain/entities/Product'
import { getStockStatus, stockStatusLabel, stockStatusColor } from '@/domain/services/InventoryService'
import { calcGrossMarginPct } from '@/domain/services/PricingService'
import { Overlay } from '@/presentation/components/ui/SharedUI'
import { useCart } from '@/presentation/hooks/useCart'

const fmt = (n: number) => n.toLocaleString('vi-VN')

interface ProductDetailProps {
  product: Product
  onClose: () => void
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  const { addItem, openCart } = useCart()

  const stockStatus = getStockStatus(product)
  const outOfStock  = stockStatus === 'out_of_stock'
  const margin      = calcGrossMarginPct(product.sell_price, product.cost_price)

  function handleAddToCart() {
    if (outOfStock || qty <= 0) return
    addItem({
      productId:   product.id,
      productCode: product.code,
      productName: product.name,
      quantity:    qty,
      unitPrice:   product.sell_price,
      imageUrl:    product.image_url ?? undefined,
    })
    onClose()
    openCart()
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 2,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  }
  const valueStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 500, color: '#111827',
  }

  return (
    <Overlay>
      <div style={{
        background: '#fff', borderRadius: 20, width: 700, maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.20)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#94A3B8' }}>{product.code}</span>
          <button onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {/* Left: Image */}
          <div style={{
            width: 260, flexShrink: 0, padding: 24,
            background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 16,
            borderRight: '1px solid #F3F4F6',
          }}>
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden',
              background: '#E1EAEC', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 56,
            }}>
              {product.image_url
                ? <img src={product.image_url} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '📦'
              }
            </div>

            {/* Stock indicator */}
            <div style={{
              background: '#fff', borderRadius: 10, padding: '12px 14px',
              border: '1px solid #F1F5F9', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stockStatusColor(stockStatus) }}>
                {product.stock}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                {stockStatusLabel(stockStatus)}
              </div>
              <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
                Min {product.min_stock} – Max {product.max_stock}
              </div>
            </div>

            {/* Attributes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: product.can_sell_direct ? '#16A34A' : '#94A3B8',
                  flexShrink: 0,
                }} />
                <span style={{ color: product.can_sell_direct ? '#2A3437' : '#94A3B8' }}>
                  {product.can_sell_direct ? 'Bán trực tiếp' : 'Không bán trực tiếp'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: product.has_points ? '#16A34A' : '#94A3B8',
                  flexShrink: 0,
                }} />
                <span style={{ color: '#566164' }}>
                  {product.has_points ? 'Có tích điểm' : 'Không tích điểm'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                {product.name}
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                {product.type} · {product.group}
              </div>
            </div>

            {/* Price block */}
            <div style={{
              background: '#F0FDF4', borderRadius: 12, padding: '14px 16px',
              display: 'flex', gap: 24, flexWrap: 'wrap',
            }}>
              <div style={fieldStyle}>
                <div style={labelStyle}>Giá bán</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#006E1C' }}>
                  {fmt(product.sell_price)} ₫
                </div>
              </div>
              <div style={fieldStyle}>
                <div style={labelStyle}>Giá vốn</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#566164' }}>
                  {fmt(product.cost_price)} ₫
                </div>
              </div>
              <div style={fieldStyle}>
                <div style={labelStyle}>Biên lợi nhuận</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: margin >= 20 ? '#16A34A' : '#F59E0B' }}>
                  {margin}%
                </div>
              </div>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              <div style={fieldStyle}>
                <div style={labelStyle}>Thương hiệu</div>
                <div style={valueStyle}>{product.brand ?? <span style={{ color: '#94A3B8' }}>Chưa có</span>}</div>
              </div>
              <div style={fieldStyle}>
                <div style={labelStyle}>Vị trí kho</div>
                <div style={valueStyle}>{product.location ?? <span style={{ color: '#94A3B8' }}>—</span>}</div>
              </div>
              <div style={fieldStyle}>
                <div style={labelStyle}>Nhà cung cấp</div>
                <div style={valueStyle}>{product.supplier_name ?? product.supplier_id ?? <span style={{ color: '#94A3B8' }}>Chưa có</span>}</div>
              </div>
              <div style={fieldStyle}>
                <div style={labelStyle}>Dự kiến đặt hàng</div>
                <div style={{ ...valueStyle, color: '#2563EB' }}>
                  {product.expected_order ?? <span style={{ color: '#94A3B8' }}>—</span>}
                </div>
              </div>
            </div>

            {/* Note */}
            {product.note && (
              <div style={fieldStyle}>
                <div style={labelStyle}>Ghi chú</div>
                <div style={{
                  ...valueStyle, background: '#F8FAFC', borderRadius: 8,
                  padding: '10px 12px', fontSize: 13, color: '#566164',
                }}>
                  {product.note}
                </div>
              </div>
            )}

            {/* Add to cart */}
            {product.can_sell_direct && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 'auto' }}>
                {/* Qty */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width: 36, height: 40, border: 'none', background: '#F8FAFC', cursor: 'pointer', fontSize: 18, color: '#374151' }}>
                    −
                  </button>
                  <span style={{ width: 44, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    style={{ width: 36, height: 40, border: 'none', background: '#F8FAFC', cursor: 'pointer', fontSize: 18, color: '#374151' }}>
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  style={{
                    flex: 1, height: 40, borderRadius: 10, border: 'none',
                    background: outOfStock ? '#E5E7EB' : '#006E1C',
                    color: outOfStock ? '#9CA3AF' : '#fff',
                    fontSize: 14, fontWeight: 700, cursor: outOfStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  {outOfStock ? 'Hết hàng' : `Thêm vào giỏ · ${fmt(product.sell_price * qty)} ₫`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  )
}
