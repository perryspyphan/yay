'use client'

import React from 'react'
import type { DistributorOrderWithItems } from '@/domain/entities/Distributor'
import { Overlay } from '@/presentation/components/ui/SharedUI'

const fmt = (n: number) => n.toLocaleString('vi-VN')

const statusBadge = (s: string) => {
  const styles: Record<string, React.CSSProperties> = {
    'Đã thanh toán': { background: '#e6f9f0', color: '#057a55', border: '1px solid #a0dfc4' },
    'Còn thiếu': { background: '#fff1cc', color: '#b45309', border: '1px solid #fcd34d' },
    'Chưa thanh toán': { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
    'Đã hủy': { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' },
  }
  const st = styles[s] || styles['Đã hủy']
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...st }}>{s}</span>
}

interface Props {
  invoice: DistributorOrderWithItems
  onClose: () => void
}

export default function DistributorInvoiceModal({ invoice, onClose }: Props) {
  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.sell_price, 0)
  const discount = Math.round(subtotal * (invoice.discount_pct || 0) / 100)
  const total = subtotal - discount
  const totalQty = invoice.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Overlay>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px 28px 20px',
        width: 760, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.22)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0E176E' }}>
            Hóa đơn {invoice.id}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Thông tin đơn */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 16, padding: '12px 16px', background: '#f7f9fc', borderRadius: 8, fontSize: 13 }}>
          <div><span style={{ color: '#666' }}>📅 Ngày lập: </span><strong>{invoice.invoice_date || new Date(invoice.ordered_at).toLocaleDateString('vi-VN')}</strong></div>
          <div><span style={{ color: '#666' }}>🚚 Ngày giao: </span><strong>{invoice.delivery_date ? new Date(invoice.delivery_date).toLocaleDateString('vi-VN') : '—'}</strong></div>
          <div><span style={{ color: '#666' }}>📍 Địa điểm: </span><strong>{invoice.delivery_location || '—'}</strong></div>
          <div><span style={{ color: '#666' }}>👤 Người lập: </span><strong>{invoice.staff_name || '—'}</strong></div>
          {invoice.note && <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#666' }}>📝 Ghi chú: </span><strong>{invoice.note}</strong></div>}
        </div>

        {/* Thông tin NPP */}
        <div style={{ padding: '12px 16px', background: '#eef2ff', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#253584', marginBottom: 6 }}>🏭 {invoice.distributor.name}</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: '#444' }}>
            <span>📞 {invoice.distributor.phone || '—'}</span>
            <span>📧 {invoice.distributor.email || '—'}</span>
            <span>📍 {invoice.distributor.address || '—'}</span>
            <span>🧾 MST: {invoice.distributor.tax_code || '—'}</span>
          </div>
        </div>

        {/* Bảng hàng hóa */}
        {invoice.items.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13, border: '1px solid #d0e4f0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <thead>
              <tr>
                {['Mã hàng', 'Tên hàng', 'Số lượng', 'Đơn giá', 'Giá bán', 'Thành tiền'].map((hd, i) => (
                  <th key={hd} style={{ background: '#CEE8FF', padding: '10px 12px', textAlign: i >= 2 ? 'right' : 'left', fontWeight: 700 }}>{hd}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid #eef2f7', background: idx % 2 === 0 ? '#fff' : '#f9fbff' }}>
                  <td style={{ padding: '9px 12px', color: '#253584', fontWeight: 600 }}>{item.product_code}</td>
                  <td style={{ padding: '9px 12px' }}>{item.product_name}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(item.sell_price)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.sell_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, color: '#aaa', background: '#f9f9f9', borderRadius: 8, marginBottom: 16 }}>
            Chưa có chi tiết hàng hóa
          </div>
        )}

        {/* Tổng kết */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Trạng thái + discount info */}
          <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 6 }}>Trạng thái: {statusBadge(invoice.status)}</div>
            {invoice.discount_pct > 0 && (
              <div style={{ color: '#666', fontSize: 12 }}>
                Chiết khấu xác nhận bởi: <strong>{invoice.confirmed_by_name || '—'}</strong>
                {invoice.discount_confirmed_at && (
                  <span> lúc {new Date(invoice.discount_confirmed_at).toLocaleString('vi-VN')}</span>
                )}
              </div>
            )}
          </div>

          {/* Bảng tổng */}
          <table style={{ fontSize: 13, minWidth: 280 }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', color: '#555' }}>Tổng số lượng:</td>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{totalQty}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', color: '#555' }}>Tổng tiền hàng:</td>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(subtotal)}</td>
              </tr>
              {invoice.discount_pct > 0 && (
                <tr>
                  <td style={{ padding: '4px 8px', color: '#555' }}>Chiết khấu ({invoice.discount_pct}%):</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600, color: '#e53e3e' }}>- {fmt(discount)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #ddd' }}>
                <td style={{ padding: '8px 8px 4px', fontWeight: 700, fontSize: 15, color: '#0E176E' }}>Cần thanh toán:</td>
                <td style={{ padding: '8px 8px 4px', textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#0E176E' }}>{fmt(total)}</td>
              </tr>
              {invoice.debt_amount > 0 && (
                <tr>
                  <td style={{ padding: '4px 8px', color: '#e53e3e', fontWeight: 600 }}>Còn nợ:</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#e53e3e' }}>{fmt(invoice.debt_amount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Overlay>
  )
}