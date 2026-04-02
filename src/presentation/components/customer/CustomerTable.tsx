'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import type { Customer, Order, OrderWithItems, CustomerTier } from '@/domain/entities/Customer'
import { getOrdersByCustomerUseCase, getOrderWithItemsUseCase } from '@/application/use-cases/customer/CustomerUsecase'
import { addCustomerUseCase, updateCustomerUseCase, deleteCustomersUseCase } from '@/application/use-cases/customer/CustomerUsecase'
import { Overlay, PgBtn, SbCard, DeleteBar, ConfirmDeleteModal, btnGreen, btnIcon } from '@/presentation/components/ui/SharedUI'

const fmt = (n: number) => n.toLocaleString('vi-VN')

const tierBadge = (t: string) => {
  const styles: Record<string, React.CSSProperties> = {
    'Vàng': { background: '#fff3cc', color: '#b07d00', border: '1px solid #f0d060' },
    'Bạc': { background: '#e4e8ef', color: '#3d5a80', border: '1px solid #b0bcd0' },
    'Đồng': { background: '#e8e0d4', color: '#7a5c3a', border: '1px solid #c0a888' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap', ...styles[t],
    }}>{t}</span>
  )
}

const DATE_OPTS = ['Hôm nay', 'Hôm qua', 'Tuần này', 'Tuần trước', 'Tháng này', 'Tháng trước']

function getDateRange(opt: string): { from: string; to: string } {
  const now = new Date()
  const f = (d: Date) => d.toISOString().split('T')[0]
  if (opt === 'Hôm nay') { const s = f(now); return { from: s, to: s } }
  if (opt === 'Hôm qua') { const d = new Date(now); d.setDate(d.getDate() - 1); const s = f(d); return { from: s, to: s } }
  if (opt === 'Tuần này') { const d = new Date(now); d.setDate(d.getDate() - d.getDay() + 1); const e = new Date(d); e.setDate(e.getDate() + 6); return { from: f(d), to: f(e) } }
  if (opt === 'Tuần trước') { const d = new Date(now); d.setDate(d.getDate() - d.getDay() - 6); const e = new Date(d); e.setDate(e.getDate() + 6); return { from: f(d), to: f(e) } }
  if (opt === 'Tháng này') return { from: f(new Date(now.getFullYear(), now.getMonth(), 1)), to: f(new Date(now.getFullYear(), now.getMonth() + 1, 0)) }
  if (opt === 'Tháng trước') return { from: f(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: f(new Date(now.getFullYear(), now.getMonth(), 0)) }
  return { from: '', to: '' }
}

const rowGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '44px repeat(6,1fr) 50px',
  padding: '0 14px', alignItems: 'center', fontSize: 13, color: '#000',
}

// ── DateDropdown nằm NGOÀI CustomerTable ─────────────────────
function DateDropdown({ refEl, label, from, to, show, setShow, setFrom, setTo, setLabel }: {
  refEl: React.RefObject<HTMLDivElement>
  label: string; from: string; to: string; show: boolean
  setShow: (v: boolean) => void
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setLabel: (v: string) => void
}) {
  return (
    <div ref={refEl} style={{ position: 'relative', marginTop: 6 }}>
      <div onClick={() => setShow(!show)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', border: '1.5px solid #d0d7e2', borderRadius: 20, cursor: 'pointer', background: '#f7f9fc', fontSize: 13 }}>
        <span>{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {show && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden', marginTop: 4 }}>
          <div onClick={() => { setFrom(''); setTo(''); setLabel('Toàn thời gian'); setShow(false) }}
            style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f5ff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Toàn thời gian
          </div>
          {DATE_OPTS.map(opt => (
            <div key={opt}
              onClick={() => { const r = getDateRange(opt); setFrom(r.from); setTo(r.to); setLabel(opt); setShow(false) }}
              style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f5ff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {opt}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eee', padding: '8px 14px' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Từ ngày</div>
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setLabel('Lựa chọn khác') }}
              style={{ width: '100%', height: 32, border: '1px solid #ccc', borderRadius: 6, padding: '0 8px', fontSize: 12, outline: 'none' }} />
            <div style={{ fontSize: 12, color: '#888', margin: '6px 0 4px' }}>Đến ngày</div>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setLabel('Lựa chọn khác') }}
              style={{ width: '100%', height: 32, border: '1px solid #ccc', borderRadius: 6, padding: '0 8px', fontSize: 12, outline: 'none' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── CustomerTable ─────────────────────────────────────────────
export default function CustomerTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateLabel, setDateLabel] = useState('Toàn thời gian')
  const [showDateDrop, setShowDateDrop] = useState(false)
  const [bdFrom, setBdFrom] = useState('')
  const [bdTo, setBdTo] = useState('')
  const [bdLabel, setBdLabel] = useState('Toàn thời gian')
  const [showBdDrop, setShowBdDrop] = useState(false)
  const [page, setPage] = useState(1)
  const PER = 8
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Record<string, Order[]>>({})
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<OrderWithItems | null>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [isPending, startTransition] = useTransition()
  const [fName, setFName] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fTier, setFTier] = useState<CustomerTier>('Đồng')

  const dateRef = useRef<HTMLDivElement>(null)
  const bdRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false)
      if (bdRef.current && !bdRef.current.contains(e.target as Node)) setShowBdDrop(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    if (q && !c.id.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q) && !(c.phone || '').includes(q)) return false
    if (tierFilter && c.tier !== tierFilter) return false
    if (minTotal && c.total < Number(minTotal)) return false
    if (maxTotal && c.total > Number(maxTotal)) return false
    if (dateFrom && c.created_at < dateFrom) return false
    if (dateTo && c.created_at > dateTo) return false
    return true
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const safePage = Math.min(page, pages)
  const slice = filtered.slice((safePage - 1) * PER, safePage * PER)

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!orders[id]) {
      setLoadingOrders(id)
      const data = await getOrdersByCustomerUseCase(id)
      setOrders(p => ({ ...p, [id]: data }))
      setLoadingOrders(null)
    }
  }

  const openInvoice = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoadingInvoice(true)
    const data = await getOrderWithItemsUseCase(orderId)
    setInvoice(data)
    setLoadingInvoice(false)
  }

  const toggleRow = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(slice.map(c => c.id)) : new Set())

  const doDelete = () => startTransition(async () => {
    await deleteCustomersUseCase([...selected])
    setCustomers(p => p.filter(c => !selected.has(c.id)))
    setSelected(new Set()); setShowConfirmDelete(false)
  })

  const openAdd = () => { setFName(''); setFPhone(''); setFEmail(''); setFTier('Đồng'); setShowAddModal(true) }

  const openEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditCustomer(c); setFName(c.name); setFPhone(c.phone || ''); setFEmail(c.email || ''); setFTier(c.tier)
  }

  const doAdd = () => {
    if (!fName) { alert('Vui lòng nhập tên!'); return }
    startTransition(async () => {
      await addCustomerUseCase({ name: fName, phone: fPhone, email: fEmail, tier: fTier })
      const today = new Date().toISOString().split('T')[0]
      const newId = 'KH' + String(customers.length + 1).padStart(3, '0')
      setCustomers(p => [{ id: newId, name: fName, phone: fPhone || null, email: fEmail || null, tier: fTier, total: 0, auth_id: null, created_at: today }, ...p])
      setShowAddModal(false)
    })
  }

  const doEdit = () => {
    if (!editCustomer || !fName) return
    startTransition(async () => {
      await updateCustomerUseCase(editCustomer.id, { name: fName, phone: fPhone || null, email: fEmail || null, tier: fTier })
      setCustomers(p => p.map(c => c.id === editCustomer!.id ? { ...c, name: fName, phone: fPhone || null, email: fEmail || null, tier: fTier } : c))
      setEditCustomer(null)
    })
  }

  const exportCSV = () => {
    let csv = '\uFEFFMã KH,Tên KH,Điện thoại,Email,Hạng,Tổng bán (VNĐ),Ngày tạo\n'
    customers.forEach(c => { csv += [c.id, `"${c.name}"`, c.phone || '', c.email || '', c.tier, c.total, c.created_at].join(',') + '\n' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = 'DGFarm_KhachHang.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', background: '#E5E5E5', paddingLeft: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#000' }}>Khách hàng</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 138px)' }}>
        <aside style={{ width: 260, minWidth: 260, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SbCard title="Nhóm khách hàng">
            <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', border: '1.5px solid #d0d7e2', borderRadius: 20, fontSize: 13, padding: '7px 32px 7px 14px', outline: 'none', color: '#222', background: '#f7f9fc', cursor: 'pointer', appearance: 'none', marginTop: 6 }}>
              <option value="">Tất cả nhóm</option>
              <option value="Đồng">Đồng</option>
              <option value="Bạc">Bạc</option>
              <option value="Vàng">Vàng</option>
            </select>
          </SbCard>

          <SbCard title="Ngày tạo">
            <DateDropdown refEl={dateRef} label={dateLabel} from={dateFrom} to={dateTo}
              show={showDateDrop} setShow={setShowDateDrop}
              setFrom={setDateFrom} setTo={setDateTo} setLabel={setDateLabel} />
          </SbCard>

          <SbCard title="Sinh nhật">
            <DateDropdown refEl={bdRef} label={bdLabel} from={bdFrom} to={bdTo}
              show={showBdDrop} setShow={setShowBdDrop}
              setFrom={setBdFrom} setTo={setBdTo} setLabel={setBdLabel} />
          </SbCard>

          <SbCard title="Tổng bán">
            {([['Từ:', minTotal, setMinTotal], ['Đến:', maxTotal, setMaxTotal]] as const).map(([label, val, setter]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span style={{ fontSize: 12, color: '#555', width: 28 }}>{label}</span>
                <input type="number" value={val} onChange={e => { setter(e.target.value); setPage(1) }}
                  style={{ flex: 1, height: 28, border: '1px solid #ccc', borderRadius: 4, fontSize: 12, padding: '0 7px', outline: 'none', textAlign: 'right' }}
                  placeholder={label === 'Đến:' ? 'Tất cả' : '0'} />
              </div>
            ))}
          </SbCard>
        </aside>

        <main style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 400, position: 'relative', height: 38, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Tìm kiếm theo mã, tên, điện thoại..."
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', fontSize: 13, padding: '0 40px 0 14px', background: 'transparent' }} />
              <span style={{ position: 'absolute', right: 12, color: '#797979', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={openAdd} style={btnGreen}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Thêm mới
              </button>
              <button onClick={exportCSV} style={btnIcon} title="Xuất CSV">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </button>
            </div>
          </div>

          <div style={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ ...rowGrid, background: '#CEE8FF', height: 44, fontWeight: 700, borderBottom: '1px solid #b8d8f0' }}>
              <div><input type="checkbox" checked={slice.length > 0 && slice.every(c => selected.has(c.id))} onChange={e => toggleAll(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
              <div>Mã KH</div><div>Tên KH</div><div>Điện thoại</div><div>Hạng</div>
              <div>Tổng bán (VNĐ)</div><div>Ngày tạo</div><div />
            </div>

            {slice.map(c => {
              const isExp = expandedId === c.id
              return (
                <div key={c.id}>
                  <div className={`tbl-row${isExp ? ' expanded' : ''}`}
                    style={{ ...rowGrid, height: 46, background: isExp ? '#BED4CB' : '#fff', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                    onClick={() => toggleExpand(c.id)}>
                    <div><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleRow(c.id)} onClick={e => e.stopPropagation()} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
                    <div style={{ color: '#253584', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.id}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.phone || '-'}</div>
                    <div>{tierBadge(c.tier)}</div>
                    <div>{c.total > 0 ? fmt(c.total) : '-'}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.created_at}</div>
                    <div>
                      <button onClick={e => openEdit(c, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: '#f97316' }} title="Chỉnh sửa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </div>
                  </div>

                  {isExp && (
                    <div style={{ background: '#BED4CB', borderTop: '1px solid #a8ccc4', borderBottom: '2px solid #8ab8b0', padding: '14px 20px 16px' }}>
                      <div style={{ borderBottom: '2px solid #b0ccc8', marginBottom: 12 }}>
                        <span style={{ padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#253584', borderBottom: '2px solid #253584', display: 'inline-block', marginBottom: -2 }}>Lịch sử bán hàng</span>
                      </div>
                      {loadingOrders === c.id ? (
                        <div style={{ textAlign: 'center', padding: 16, color: '#666' }}>Đang tải...</div>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr>{['Mã hóa đơn', 'Thời gian', 'Người bán', 'Tổng cộng', 'Trạng thái'].map(hd => (
                              <th key={hd} style={{ background: '#CEE8FF', padding: '9px 12px', textAlign: hd === 'Tổng cộng' ? 'right' : 'left', fontWeight: 700 }}>{hd}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {(orders[c.id] || []).length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Chưa có lịch sử giao dịch</td></tr>
                            ) : (orders[c.id] || []).map(o => (
                              <tr key={o.id} style={{ borderBottom: '1px solid #d8eae6', background: '#fff' }}>
                                <td style={{ padding: '9px 12px' }}>
                                  <span onClick={e => openInvoice(o.id, e)} style={{ color: '#253584', fontWeight: 600, cursor: 'pointer' }}
                                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>{o.id}</span>
                                </td>
                                <td style={{ padding: '9px 12px' }}>{new Date(o.ordered_at).toLocaleString('vi-VN')}</td>
                                <td style={{ padding: '9px 12px' }}>{o.seller}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(o.total)}</td>
                                <td style={{ padding: '9px 12px', color: '#27ae60', fontWeight: 600 }}>{o.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 14px', background: '#fff', borderTop: '1px solid #eee', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#666', marginRight: 10 }}>Tổng: {filtered.length} khách</span>
              {pages > 1 && (<>
                <PgBtn disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹</PgBtn>
                {Array.from({ length: pages }, (_, i) => <PgBtn key={i} active={i + 1 === safePage} onClick={() => setPage(i + 1)}>{i + 1}</PgBtn>)}
                <PgBtn disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>›</PgBtn>
              </>)}
            </div>
          </div>
        </main>
      </div>

      <DeleteBar count={selected.size} onDelete={() => setShowConfirmDelete(true)} />

      {showConfirmDelete && <ConfirmDeleteModal count={selected.size} onConfirm={doDelete} onCancel={() => setShowConfirmDelete(false)} isPending={isPending} />}

      {showAddModal && (
        <Overlay>
          <CustomerForm title="Thêm khách hàng mới" name={fName} phone={fPhone} email={fEmail} tier={fTier}
            setName={setFName} setPhone={setFPhone} setEmail={setFEmail} setTier={setFTier}
            onSave={doAdd} onCancel={() => setShowAddModal(false)} isPending={isPending} />
        </Overlay>
      )}

      {editCustomer && (
        <Overlay>
          <CustomerForm title={`Chỉnh sửa: ${editCustomer.id}`} name={fName} phone={fPhone} email={fEmail} tier={fTier}
            setName={setFName} setPhone={setFPhone} setEmail={setFEmail} setTier={setFTier}
            onSave={doEdit} onCancel={() => setEditCustomer(null)} isPending={isPending} />
        </Overlay>
      )}

      {(loadingInvoice || invoice) && (
        <Overlay>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 20px', width: 700, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0E176E' }}>{loadingInvoice ? 'Đang tải...' : `Hóa đơn ${invoice?.id}`}</span>
              <button onClick={() => setInvoice(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            {invoice && !loadingInvoice && (
              <>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 14, display: 'flex', gap: 24 }}>
                  <span>🕐 {new Date(invoice.ordered_at).toLocaleString('vi-VN')}</span>
                  <span>👤 Người bán: {invoice.seller}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13, border: '1px solid #d0e4f0', borderRadius: 8, overflow: 'hidden' }}>
                  <thead>
                    <tr>{['Mã hàng', 'Tên hàng', 'Số lượng', 'Đơn giá', 'Giảm giá', 'Giá bán', 'Thành tiền'].map((hd, i) => (
                      <th key={hd} style={{ background: '#CEE8FF', padding: '10px 12px', textAlign: i >= 2 ? 'right' : 'left', fontWeight: 700 }}>{hd}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {invoice.order_items.map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #eef2f7' }}>
                        <td style={{ padding: '9px 12px', color: '#253584', fontWeight: 600 }}>{item.product_code}</td>
                        <td style={{ padding: '9px 12px' }}>{item.product_name}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{item.discount > 0 ? fmt(item.discount) : '-'}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(item.sell_price)}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(item.quantity * item.sell_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <InvoiceSummary items={invoice.order_items} />
              </>
            )}
          </div>
        </Overlay>
      )}
    </>
  )
}

function CustomerForm({ title, name, phone, email, tier, setName, setPhone, setEmail, setTier, onSave, onCancel, isPending }: {
  title: string; name: string; phone: string; email: string; tier: CustomerTier
  setName: (v: string) => void; setPhone: (v: string) => void; setEmail: (v: string) => void; setTier: (v: CustomerTier) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 13, outline: 'none', color: '#222', background: '#fafafa' }
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '20px 18px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0E176E', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {([['Tên khách hàng *', name, setName, 'Nhập tên'], ['Số điện thoại', phone, setPhone, 'Nhập SĐT'], ['Email', email, setEmail, 'Nhập email']] as const).map(([label, val, setter, ph]) => (
          <div key={label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>{label}</div>
            <input value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={inp} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Hạng</div>
          <select value={tier} onChange={e => setTier(e.target.value as CustomerTier)} style={{ ...inp, cursor: 'pointer', appearance: 'none' }}>
            <option value="Đồng">Đồng</option>
            <option value="Bạc">Bạc</option>
            <option value="Vàng">Vàng</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
        <button onClick={onSave} disabled={isPending} style={{ flex: 1, height: 38, background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{isPending ? '...' : 'Lưu'}</button>
        <button onClick={onCancel} style={{ flex: 1, height: 38, background: '#eee', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Hủy</button>
      </div>
    </div>
  )
}

function InvoiceSummary({ items }: { items: { quantity: number; sell_price: number; discount: number; unit_price: number }[] }) {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const totalAmt = items.reduce((s, i) => s + i.quantity * i.sell_price, 0)
  const totalDiscount = items.reduce((s, i) => s + i.quantity * i.discount, 0)
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <table style={{ fontSize: 13, minWidth: 260 }}>
        <tbody>
          <tr><td style={{ padding: '4px 8px', color: '#333' }}>Tổng số lượng:</td><td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{totalQty}</td></tr>
          <tr><td style={{ padding: '4px 8px', color: '#333' }}>Tổng tiền hàng:</td><td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(totalAmt + totalDiscount)}</td></tr>
          <tr><td style={{ padding: '4px 8px', color: '#333' }}>Giảm giá:</td><td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{totalDiscount > 0 ? fmt(totalDiscount) : '-'}</td></tr>
          <tr style={{ borderTop: '1px solid #ddd' }}>
            <td style={{ padding: '8px 8px 4px', fontWeight: 700, fontSize: 14, color: '#0E176E' }}>Khách cần trả:</td>
            <td style={{ padding: '8px 8px 4px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#0E176E' }}>{fmt(totalAmt)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}