'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import type { Distributor, DistributorOrder, DistributorOrderWithItems, DistributorGroup } from '@/domain/entities/Distributor'
import { addDistributorUseCase, updateDistributorUseCase, deleteDistributorsUseCase, getOrdersByDistributorUseCase, getDistributorOrderWithItemsUseCase } from '@/application/use-cases/distributor/DistributorUseCases'
import { Overlay, PgBtn, SbCard, DeleteBar, ConfirmDeleteModal, btnGreen } from '@/presentation/components/ui/SharedUI'
import DistributorInvoiceModal from '@/presentation/components/distributor/DistributorInvoiceModal'

const fmt = (n: number) => n.toLocaleString('vi-VN')

const groupBadge = (g: string) => {
  const styles: Record<string, React.CSSProperties> = {
    'Lớn': { background: '#e6f0ff', color: '#1a56db', border: '1px solid #b3d0ff' },
    'Trung bình': { background: '#e6f9f0', color: '#057a55', border: '1px solid #a0dfc4' },
    'Nhỏ lẻ': { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' },
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', ...styles[g] }}>{g}</span>
}

const statusBadge = (s: string) => {
  const styles: Record<string, React.CSSProperties> = {
    'Đã thanh toán': { background: '#e6f9f0', color: '#057a55', border: '1px solid #a0dfc4' },
    'Còn thiếu': { background: '#fff1cc', color: '#b45309', border: '1px solid #fcd34d' },
    'Chưa thanh toán': { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
    'Đã hủy': { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' },
  }
  const st = styles[s] || styles['Đã hủy']
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', ...st }}>{s}</span>
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
  gridTemplateColumns: '44px 110px 1fr 130px 1fr 110px 150px 130px 50px',
  padding: '0 14px', alignItems: 'center', fontSize: 13, color: '#000',
}

function DateDropdown({ refEl, label, from, to, show, setShow, setFrom, setTo, setLabel }: {
  refEl: React.RefObject<HTMLDivElement>
  label: string; from: string; to: string; show: boolean
  setShow: (v: boolean) => void; setFrom: (v: string) => void
  setTo: (v: string) => void; setLabel: (v: string) => void
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
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Toàn thời gian</div>
          {DATE_OPTS.map(opt => (
            <div key={opt}
              onClick={() => { const r = getDateRange(opt); setFrom(r.from); setTo(r.to); setLabel(opt); setShow(false) }}
              style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f5ff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{opt}</div>
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

export default function DistributorTable({ initialDistributors }: { initialDistributors: Distributor[] }) {
  const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors)
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [minTotal, setMinTotal] = useState(''); const [maxTotal, setMaxTotal] = useState('')
  const [minDebt, setMinDebt] = useState(''); const [maxDebt, setMaxDebt] = useState('')
  const [dateFrom, setDateFrom] = useState(''); const [dateTo, setDateTo] = useState('')
  const [dateLabel, setDateLabel] = useState('Toàn thời gian')
  const [showDateDrop, setShowDateDrop] = useState(false)
  const [page, setPage] = useState(1)
  const PER = 8
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Record<string, DistributorOrder[]>>({})
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editDist, setEditDist] = useState<Distributor | null>(null)
  const [isPending, startTransition] = useTransition()
  const [fName, setFName] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fAddress, setFAddress] = useState('')
  const [fTax, setFTax] = useState('')
  const [fGroup, setFGroup] = useState<DistributorGroup>('Nhỏ lẻ')

  // Invoice modal
  const [invoice, setInvoice] = useState<DistributorOrderWithItems | null>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(false)

  const dateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = distributors.filter(d => {
    const q = search.toLowerCase()
    if (q && !d.id.toLowerCase().includes(q) && !d.name.toLowerCase().includes(q) && !(d.phone || '').includes(q) && !(d.email || '').includes(q)) return false
    if (groupFilter && d.group !== groupFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    if (minTotal && d.total_buy < Number(minTotal)) return false
    if (maxTotal && d.total_buy > Number(maxTotal)) return false
    if (minDebt && d.debt < Number(minDebt)) return false
    if (maxDebt && d.debt > Number(maxDebt)) return false
    if (dateFrom && d.created_at < dateFrom) return false
    if (dateTo && d.created_at > dateTo) return false
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
      const data = await getOrdersByDistributorUseCase(id)
      setOrders(p => ({ ...p, [id]: data }))
      setLoadingOrders(null)
    }
  }

  const openInvoice = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoadingInvoice(true)
    const data = await getDistributorOrderWithItemsUseCase(orderId)
    setInvoice(data)
    setLoadingInvoice(false)
  }

  const toggleRow = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(slice.map(d => d.id)) : new Set())

  const doDelete = () => startTransition(async () => {
    await deleteDistributorsUseCase([...selected])
    setDistributors(p => p.filter(d => !selected.has(d.id)))
    setSelected(new Set()); setShowConfirmDelete(false)
  })

  const openAdd = () => { setFName(''); setFPhone(''); setFEmail(''); setFAddress(''); setFTax(''); setFGroup('Nhỏ lẻ'); setShowAddModal(true) }

  const openEdit = (d: Distributor, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditDist(d); setFName(d.name); setFPhone(d.phone || ''); setFEmail(d.email || '')
    setFAddress(d.address || ''); setFTax(d.tax_code || ''); setFGroup(d.group)
  }

  const doAdd = () => {
    if (!fName) { alert('Vui lòng nhập tên!'); return }
    startTransition(async () => {
      await addDistributorUseCase({ name: fName, phone: fPhone, email: fEmail, address: fAddress, tax_code: fTax, group: fGroup })
      const today = new Date().toISOString().split('T')[0]
      const newId = 'NPP' + String(distributors.length + 1).padStart(3, '0')
      setDistributors(p => [{ id: newId, name: fName, phone: fPhone || null, email: fEmail || null, address: fAddress || null, tax_code: fTax || null, group: fGroup, total_buy: 0, debt: 0, status: 'Đã thanh toán', created_at: today }, ...p])
      setShowAddModal(false)
    })
  }

  const doEdit = () => {
    if (!editDist || !fName) return
    startTransition(async () => {
      await updateDistributorUseCase(editDist.id, { name: fName, phone: fPhone || null, email: fEmail || null, address: fAddress || null, tax_code: fTax || null, group: fGroup })
      setDistributors(p => p.map(d => d.id === editDist!.id ? { ...d, name: fName, phone: fPhone || null, email: fEmail || null, address: fAddress || null, tax_code: fTax || null, group: fGroup } : d))
      setEditDist(null)
    })
  }

  const exportExcel = () => {
    let csv = '\uFEFFMã NPP,Tên NPP,Điện thoại,Email,Nhóm,Tổng bán (VNĐ),Trạng thái,Địa chỉ,Mã số thuế,Ngày tạo\n'
    filtered.forEach(d => {
      csv += [d.id, `"${d.name}"`, d.phone || '', d.email || '', d.group, d.total_buy, d.status, `"${d.address || ''}"`, d.tax_code || '', d.created_at].join(',') + '\n'
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = 'DGFarm_NhaPhanPhoi.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', background: '#E5E5E5', paddingLeft: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#000' }}>Nhà phân phối</span>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 138px)' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 260, minWidth: 260, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SbCard title="Nhóm NPP">
            <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', border: '1.5px solid #d0d7e2', borderRadius: 20, fontSize: 13, padding: '7px 14px', outline: 'none', color: '#222', background: '#f7f9fc', cursor: 'pointer', appearance: 'none', marginTop: 6 }}>
              <option value="">Tất cả nhóm</option>
              <option value="Lớn">Lớn</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Nhỏ lẻ">Nhỏ lẻ</option>
            </select>
          </SbCard>

          <SbCard title="Ngày tạo">
            <DateDropdown refEl={dateRef} label={dateLabel} from={dateFrom} to={dateTo}
              show={showDateDrop} setShow={setShowDateDrop}
              setFrom={setDateFrom} setTo={setDateTo} setLabel={setDateLabel} />
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

          <SbCard title="Nợ hiện tại">
            {([['Từ:', minDebt, setMinDebt], ['Đến:', maxDebt, setMaxDebt]] as const).map(([label, val, setter]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span style={{ fontSize: 12, color: '#555', width: 28 }}>{label}</span>
                <input type="number" value={val} onChange={e => setter(e.target.value)}
                  style={{ flex: 1, height: 28, border: '1px solid #ccc', borderRadius: 4, fontSize: 12, padding: '0 7px', outline: 'none', textAlign: 'right' }}
                  placeholder={label === 'Đến:' ? 'Tất cả' : '0'} />
              </div>
            ))}
          </SbCard>

          <SbCard title="Trạng thái">
            {['Tất cả', 'Đã thanh toán', 'Chưa thanh toán', 'Còn thiếu', 'Đã hủy'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="npp-status" value={s === 'Tất cả' ? '' : s}
                  checked={(s === 'Tất cả' ? '' : s) === statusFilter}
                  onChange={() => setStatusFilter(s === 'Tất cả' ? '' : s)}
                  style={{ accentColor: '#253584' }} />
                {s}
              </label>
            ))}
          </SbCard>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 400, position: 'relative', height: 38, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Tìm theo mã, tên, SĐT, email..."
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', fontSize: 13, padding: '0 40px 0 14px', background: 'transparent' }} />
              <span style={{ position: 'absolute', right: 12, color: '#797979', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={openAdd} style={btnGreen}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Thêm mới
              </button>
              <button onClick={exportExcel}
                style={{ background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 5, height: 38, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Xuất Excel">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>

          <div style={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ ...rowGrid, background: '#CEE8FF', height: 44, fontWeight: 700, borderBottom: '1px solid #b8d8f0' }}>
              <div><input type="checkbox" checked={slice.length > 0 && slice.every(d => selected.has(d.id))} onChange={e => toggleAll(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
              <div>Mã NPP</div><div>Tên NPP</div><div>Điện thoại</div><div>Email</div>
              <div>Nhóm</div><div>Tổng bán (VNĐ)</div><div>Trạng thái</div><div />
            </div>

            {slice.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#aaa', background: '#fff' }}>Chưa có nhà phân phối nào</div>
            )}

            {slice.map(d => {
              const isExp = expandedId === d.id
              return (
                <div key={d.id}>
                  <div className={`tbl-row${isExp ? ' expanded' : ''}`}
                    style={{ ...rowGrid, height: 46, background: isExp ? '#BED4CB' : '#fff', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                    onClick={() => toggleExpand(d.id)}>
                    <div><input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleRow(d.id)} onClick={e => e.stopPropagation()} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
                    <div style={{ color: '#253584', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.id}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.phone || '-'}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email || '-'}</div>
                    <div>{groupBadge(d.group)}</div>
                    <div>{d.total_buy > 0 ? fmt(d.total_buy) : '-'}</div>
                    <div>{statusBadge(d.status)}</div>
                    <div>
                      <button onClick={e => openEdit(d, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f97316' }} title="Chỉnh sửa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </div>
                  </div>

                  {isExp && (
                    <div style={{ background: '#BED4CB', borderTop: '1px solid #a8ccc4', borderBottom: '2px solid #8ab8b0', padding: '14px 20px 16px' }}>
                      <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
                        {([['Địa chỉ', d.address || '—'], ['Mã số thuế', d.tax_code || '—']] as const).map(([k, v]) => (
                          <div key={k}><span style={{ fontSize: 12, color: '#555' }}>{k}: </span><span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span></div>
                        ))}
                      </div>
                      <div style={{ borderBottom: '2px solid #b0ccc8', marginBottom: 12 }}>
                        <span style={{ padding: '7px 18px', fontSize: 13, fontWeight: 600, color: '#253584', borderBottom: '2px solid #253584', display: 'inline-block', marginBottom: -2 }}>Lịch sử đơn hàng</span>
                      </div>
                      {loadingOrders === d.id ? (
                        <div style={{ textAlign: 'center', padding: 16, color: '#666' }}>Đang tải...</div>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr>{['Mã đơn', 'Thời gian', 'Tổng cộng', 'Trạng thái'].map(hd => (
                              <th key={hd} style={{ background: '#CEE8FF', padding: '9px 12px', textAlign: hd === 'Tổng cộng' ? 'right' : 'left', fontWeight: 700 }}>{hd}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {(orders[d.id] || []).length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Chưa có lịch sử đơn hàng</td></tr>
                            ) : (orders[d.id] || []).map(o => (
                              <tr key={o.id} style={{ borderBottom: '1px solid #d8eae6', background: '#fff' }}>
                                <td style={{ padding: '9px 12px' }}>
                                  {/* Bấm vào mã đơn → mở invoice modal */}
                                  <span
                                    onClick={e => openInvoice(o.id, e)}
                                    style={{ color: '#253584', fontWeight: 600, cursor: 'pointer' }}
                                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                  >{o.id}</span>
                                </td>
                                <td style={{ padding: '9px 12px' }}>{new Date(o.ordered_at).toLocaleString('vi-VN')}</td>
                                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmt(o.total)}</td>
                                <td style={{ padding: '9px 12px' }}>{statusBadge(o.status)}</td>
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
              <span style={{ fontSize: 12, color: '#666', marginRight: 10 }}>Tổng: {filtered.length} nhà phân phối</span>
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
          <DistributorForm title="Thêm nhà phân phối mới"
            name={fName} phone={fPhone} email={fEmail} address={fAddress} tax={fTax} group={fGroup}
            setName={setFName} setPhone={setFPhone} setEmail={setFEmail} setAddress={setFAddress} setTax={setFTax} setGroup={setFGroup}
            onSave={doAdd} onCancel={() => setShowAddModal(false)} isPending={isPending} />
        </Overlay>
      )}

      {editDist && (
        <Overlay>
          <DistributorForm title={`Chỉnh sửa: ${editDist.id}`}
            name={fName} phone={fPhone} email={fEmail} address={fAddress} tax={fTax} group={fGroup}
            setName={setFName} setPhone={setFPhone} setEmail={setFEmail} setAddress={setFAddress} setTax={setFTax} setGroup={setFGroup}
            onSave={doEdit} onCancel={() => setEditDist(null)} isPending={isPending} />
        </Overlay>
      )}

      {/* Loading invoice */}
      {loadingInvoice && (
        <Overlay>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#666' }}>
            Đang tải hóa đơn...
          </div>
        </Overlay>
      )}

      {/* Invoice modal */}
      {invoice && !loadingInvoice && (
        <DistributorInvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />
      )}
    </>
  )
}

function DistributorForm({ title, name, phone, email, address, tax, group, setName, setPhone, setEmail, setAddress, setTax, setGroup, onSave, onCancel, isPending }: {
  title: string; name: string; phone: string; email: string; address: string; tax: string; group: DistributorGroup
  setName: (v: string) => void; setPhone: (v: string) => void; setEmail: (v: string) => void
  setAddress: (v: string) => void; setTax: (v: string) => void; setGroup: (v: DistributorGroup) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 13, outline: 'none', color: '#222', background: '#fafafa' }
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '20px 18px', width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0E176E', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {([['Tên NPP *', name, setName, 'Nhập tên'], ['Số điện thoại', phone, setPhone, 'Nhập SĐT'], ['Email', email, setEmail, 'Nhập email'], ['Địa chỉ', address, setAddress, 'Nhập địa chỉ'], ['Mã số thuế', tax, setTax, 'Nhập MST']] as const).map(([l, v, s, p]) => (
          <div key={l}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>{l}</div>
            <input value={v} onChange={e => s(e.target.value)} placeholder={p} style={inp} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Nhóm</div>
          <select value={group} onChange={e => setGroup(e.target.value as DistributorGroup)} style={{ ...inp, cursor: 'pointer', appearance: 'none' }}>
            <option value="Nhỏ lẻ">Nhỏ lẻ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Lớn">Lớn</option>
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