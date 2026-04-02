'use client'

import React, { useState } from 'react'
import type { Distributor, DistributorOrderItem } from '@/domain/entities/Distributor'
import { createDistributorOrderUseCase, verifyStaffPinUseCase } from '@/application/use-cases/distributor/DistributorUseCases'
import { Overlay } from '@/presentation/components/ui/SharedUI'

const fmt = (n: number) => n.toLocaleString('vi-VN')

interface Props {
  distributors: Distributor[]
  staffId: string // ID của staff đang đăng nhập
  onClose: () => void
  onCreated: (orderId: string) => void
}

interface ItemRow {
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  sell_price: number
}

const emptyItem = (): ItemRow => ({
  product_code: '', product_name: '', quantity: 1, unit_price: 0, sell_price: 0
})

export default function CreateDistributorOrderModal({ distributors, staffId, onClose, onCreated }: Props) {
  const [distId, setDistId] = useState('')
  const [items, setItems] = useState<ItemRow[]>([emptyItem()])
  const [discountPct, setDiscountPct] = useState(0)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('Chưa thanh toán')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  // PIN state
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [discountConfirmedBy, setDiscountConfirmedBy] = useState<string | null>(null)

  const subtotal = items.reduce((s, i) => s + i.quantity * i.sell_price, 0)
  const discount = Math.round(subtotal * discountPct / 100)
  const total = subtotal - discount

  const updateItem = (idx: number, field: keyof ItemRow, val: string | number) => {
    setItems(p => p.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      // Auto fill sell_price = unit_price nếu chưa nhập
      if (field === 'unit_price' && updated.sell_price === 0) {
        updated.sell_price = Number(val)
      }
      return updated
    }))
  }

  const handleDiscountChange = (val: number) => {
    setDiscountPct(val)
    if (val > 0) {
      setDiscountConfirmedBy(null) // reset xác nhận khi thay đổi
    }
  }

  const handleVerifyPin = async () => {
    if (!pin) { setPinError('Vui lòng nhập PIN'); return }
    setPinLoading(true)
    setPinError('')
    try {
      const ok = await verifyStaffPinUseCase(staffId, pin)
      if (ok) {
        setDiscountConfirmedBy(staffId)
        setShowPinModal(false)
        setPin('')
      } else {
        setPinError('PIN không đúng, vui lòng thử lại')
      }
    } catch {
      setPinError('Lỗi xác minh PIN')
    }
    setPinLoading(false)
  }

  const handleSubmit = async () => {
    if (!distId) { setError('Vui lòng chọn nhà phân phối'); return }
    if (items.some(i => !i.product_code || !i.product_name || i.quantity <= 0)) {
      setError('Vui lòng điền đầy đủ thông tin hàng hóa'); return
    }
    if (discountPct > 0 && !discountConfirmedBy) {
      setError('Chiết khấu > 0 cần xác nhận bằng PIN'); return
    }
    setError('')
    setIsPending(true)
    try {
      const id = await createDistributorOrderUseCase({
        distributor_id: distId,
        items,
        discount_pct: discountPct,
        discount_confirmed_by: discountConfirmedBy,
        staff_id: staffId,
        invoice_date: invoiceDate,
        delivery_date: deliveryDate,
        delivery_location: deliveryLocation,
        note,
        status,
      })
      onCreated(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    }
    setIsPending(false)
  }

  const inp: React.CSSProperties = {
    height: 34, padding: '0 10px', border: '1.5px solid #ddd',
    borderRadius: 7, fontSize: 13, outline: 'none', background: '#fafafa', width: '100%'
  }

  return (
    <Overlay>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px 24px 20px',
        width: 820, maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.22)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0E176E' }}>Tạo đơn hàng NPP mới</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Row 1: NPP + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Nhà phân phối *</div>
            <select value={distId} onChange={e => setDistId(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
              <option value="">-- Chọn NPP --</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>{d.id} — {d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Trạng thái thanh toán</div>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
              <option value="Chưa thanh toán">Chưa thanh toán</option>
              <option value="Còn thiếu">Còn thiếu</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
            </select>
          </div>
        </div>

        {/* Row 2: Ngày */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Ngày lập hóa đơn</div>
            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Ngày giao hàng</div>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Địa điểm giao</div>
            <input type="text" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} placeholder="Nhập địa điểm" style={inp} />
          </div>
        </div>

        {/* Bảng hàng hóa */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#253584', marginBottom: 6 }}>Danh sách hàng hóa</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#CEE8FF' }}>
                {['Mã hàng', 'Tên hàng', 'Số lượng', 'Đơn giá', 'Giá bán', 'Thành tiền', ''].map(h => (
                  <th key={h} style={{ padding: '8px 8px', textAlign: h === 'Thành tiền' || h === 'Số lượng' || h === 'Đơn giá' || h === 'Giá bán' ? 'right' : 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '4px 4px' }}>
                    <input value={item.product_code} onChange={e => updateItem(idx, 'product_code', e.target.value)}
                      placeholder="SP000001" style={{ ...inp, width: 90 }} />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)}
                      placeholder="Tên hàng" style={{ ...inp }} />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input type="number" value={item.quantity} min={1}
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                      style={{ ...inp, width: 70, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input type="number" value={item.unit_price} min={0}
                      onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                      style={{ ...inp, width: 110, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input type="number" value={item.sell_price} min={0}
                      onChange={e => updateItem(idx, 'sell_price', Number(e.target.value))}
                      style={{ ...inp, width: 110, textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {fmt(item.quantity * item.sell_price)}
                  </td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}>
                    {items.length > 1 && (
                      <button onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setItems(p => [...p, emptyItem()])}
            style={{ marginTop: 8, background: '#f0f5ff', border: '1px dashed #4a7fc1', borderRadius: 6, padding: '6px 16px', fontSize: 12, color: '#253584', cursor: 'pointer', fontWeight: 600 }}>
            + Thêm hàng hóa
          </button>
        </div>

        {/* Chiết khấu + Ghi chú */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>
              Chiết khấu (%)
              {discountPct > 0 && discountConfirmedBy && (
                <span style={{ marginLeft: 8, color: '#057a55', fontSize: 11 }}>✅ Đã xác nhận PIN</span>
              )}
              {discountPct > 0 && !discountConfirmedBy && (
                <span style={{ marginLeft: 8, color: '#e53e3e', fontSize: 11 }}>⚠️ Cần xác nhận PIN</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={discountPct} min={0} max={100}
                onChange={e => handleDiscountChange(Number(e.target.value))}
                style={{ ...inp, flex: 1 }} />
              {discountPct > 0 && !discountConfirmedBy && (
                <button onClick={() => setShowPinModal(true)}
                  style={{ background: '#253584', color: '#fff', border: 'none', borderRadius: 7, padding: '0 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Nhập PIN
                </button>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Ghi chú</div>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng" style={inp} />
          </div>
        </div>

        {/* Tổng kết */}
        <div style={{ background: '#f7f9fc', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 12px', color: '#555' }}>Tổng tiền hàng:</td>
                  <td style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(subtotal)}</td>
                </tr>
                {discountPct > 0 && (
                  <tr>
                    <td style={{ padding: '3px 12px', color: '#555' }}>Chiết khấu ({discountPct}%):</td>
                    <td style={{ padding: '3px 12px', textAlign: 'right', fontWeight: 600, color: '#e53e3e' }}>- {fmt(discount)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid #ddd' }}>
                  <td style={{ padding: '8px 12px 4px', fontWeight: 700, fontSize: 15, color: '#0E176E' }}>Cần thanh toán:</td>
                  <td style={{ padding: '8px 12px 4px', textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#0E176E' }}>{fmt(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {error && <div style={{ color: '#e53e3e', fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ height: 38, padding: '0 24px', background: '#eee', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            style={{ height: 38, padding: '0 24px', background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {isPending ? 'Đang lưu...' : 'Tạo đơn hàng'}
          </button>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0E176E', marginBottom: 6 }}>Xác nhận chiết khấu</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              Nhập PIN của bạn để xác nhận chiết khấu <strong>{discountPct}%</strong>
            </div>
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
              placeholder="Nhập PIN"
              style={{ width: '100%', height: 40, border: '1.5px solid #ddd', borderRadius: 8, padding: '0 14px', fontSize: 16, outline: 'none', letterSpacing: 6, textAlign: 'center', marginBottom: 8 }}
            />
            {pinError && <div style={{ color: '#e53e3e', fontSize: 12, marginBottom: 8 }}>{pinError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPinModal(false); setPin(''); setPinError('') }}
                style={{ flex: 1, height: 38, background: '#eee', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Hủy
              </button>
              <button onClick={handleVerifyPin} disabled={pinLoading}
                style={{ flex: 1, height: 38, background: '#253584', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {pinLoading ? '...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Overlay>
  )
}