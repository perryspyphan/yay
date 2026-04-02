// src/presentation/components/product/ProductGrid.tsx
'use client'

import React, { useState } from 'react'
import type { Product, ProductGroup } from '@/domain/entities/Product'
import ProductCard from './ProductCard'
import ProductDetail from './ProductDetail'

const GROUPS: ProductGroup[] = ['Trái cây', 'Rau củ', 'Thực phẩm', 'Đồ uống', 'Khác']

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch]           = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Filter
  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchGroup = groupFilter === 'all' || p.group === groupFilter
    return matchSearch && matchGroup
  })

  return (
    <div style={{ padding: 20 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên hàng..."
            style={{
              width: '100%', height: 38, border: '1px solid #E5E7EB', borderRadius: 10,
              paddingLeft: 36, paddingRight: 12, fontSize: 14, outline: 'none',
              boxSizing: 'border-box', background: '#fff',
            }}
          />
        </div>

        {/* Group tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...GROUPS].map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: '1px solid',
                borderColor: groupFilter === g ? '#006E1C' : '#E5E7EB',
                background: groupFilter === g ? '#006E1C' : '#fff',
                color: groupFilter === g ? '#fff' : '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {g === 'all' ? 'Tất cả' : g}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 13, color: '#94A3B8', marginLeft: 'auto' }}>
          {filtered.length} sản phẩm
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>Không tìm thấy sản phẩm phù hợp</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
