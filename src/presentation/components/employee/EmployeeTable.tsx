'use client'

import React, { useState, useTransition } from 'react'
import type { Employee } from '@/domain/entities/Staff'
import { addEmployeeUseCase, updateEmployeeUseCase, deleteEmployeesUseCase } from '@/application/use-cases/staff/StaffUseCases'
import { Overlay, PgBtn, DeleteBar, ConfirmDeleteModal, btnGreen } from '@/presentation/components/ui/SharedUI'

const rowGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '44px 100px 1fr 140px 120px 1fr 120px 50px',
  padding: '0 14px', alignItems: 'center', fontSize: 13, color: '#000',
}

const positionBadge = (p: string | null) => {
  if (!p) return <span style={{ color: '#aaa' }}>—</span>
  const styles: Record<string, React.CSSProperties> = {
    'Quản lý': { background: '#e6f0ff', color: '#1a56db', border: '1px solid #b3d0ff' },
    'Nhân viên': { background: '#e6f9f0', color: '#057a55', border: '1px solid #a0dfc4' },
    'Xác nhận đơn': { background: '#fff1cc', color: '#b45309', border: '1px solid #fcd34d' },
  }
  const st = styles[p] || { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' }
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', ...st }}>{p}</span>
}

export default function EmployeeTable({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER = 10
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEmp, setEditEmp] = useState<Employee | null>(null)
  const [isPending, startTransition] = useTransition()

  const [fName, setFName] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fBirthday, setFBirthday] = useState('')
  const [fPosition, setFPosition] = useState('')

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    if (!q) return true
    return e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || (e.phone || '').includes(q)
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const safePage = Math.min(page, pages)
  const slice = filtered.slice((safePage - 1) * PER, safePage * PER)

  const toggleRow = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(slice.map(e => e.id)) : new Set())

  const doDelete = () => startTransition(async () => {
    await deleteEmployeesUseCase([...selected])
    setEmployees(p => p.filter(e => !selected.has(e.id)))
    setSelected(new Set()); setShowConfirmDelete(false)
  })

  const openAdd = () => { setFName(''); setFPhone(''); setFBirthday(''); setFPosition(''); setShowAddModal(true) }

  const openEdit = (e: Employee, ev: React.MouseEvent) => {
    ev.stopPropagation()
    setEditEmp(e); setFName(e.name); setFPhone(e.phone || '');
    setFBirthday(e.birthday || ''); setFPosition(e.position || '')
  }

  const doAdd = () => {
    if (!fName) { alert('Vui lòng nhập tên!'); return }
    startTransition(async () => {
      await addEmployeeUseCase({ name: fName, phone: fPhone, birthday: fBirthday, position: fPosition })
      const today = new Date().toISOString().split('T')[0]
      const newId = 'NV' + String(employees.length + 1).padStart(3, '0')
      setEmployees(p => [...p, { id: newId, name: fName, phone: fPhone || null, birthday: fBirthday || null, position: fPosition || null, account_id: null, created_at: today }])
      setShowAddModal(false)
    })
  }

  const doEdit = () => {
    if (!editEmp || !fName) return
    startTransition(async () => {
      await updateEmployeeUseCase(editEmp.id, { name: fName, phone: fPhone, birthday: fBirthday, position: fPosition })
      setEmployees(p => p.map(e => e.id === editEmp!.id ? { ...e, name: fName, phone: fPhone || null, birthday: fBirthday || null, position: fPosition || null } : e))
      setEditEmp(null)
    })
  }

  return (
    <>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', background: '#E5E5E5', paddingLeft: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#000' }}>Nhân viên</span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 400, position: 'relative', height: 38, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Tìm theo mã, tên, số điện thoại..."
              style={{ width: '100%', height: '100%', border: 'none', outline: 'none', fontSize: 13, padding: '0 40px 0 14px', background: 'transparent' }} />
            <span style={{ position: 'absolute', right: 12, color: '#797979', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
          </div>
          <button onClick={openAdd} style={btnGreen}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm nhân viên
          </button>
        </div>

        <div style={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ ...rowGrid, background: '#CEE8FF', height: 44, fontWeight: 700, borderBottom: '1px solid #b8d8f0' }}>
            <div><input type="checkbox" checked={slice.length > 0 && slice.every(e => selected.has(e.id))} onChange={ev => toggleAll(ev.target.checked)} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
            <div>Mã NV</div><div>Tên nhân viên</div><div>Số điện thoại</div>
            <div>Ngày sinh</div><div>Chức vụ</div><div>Ngày tạo</div><div />
          </div>

          {slice.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#aaa', background: '#fff' }}>Chưa có nhân viên nào</div>
          )}

          {slice.map(e => (
            <div key={e.id} style={{ ...rowGrid, height: 46, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <div><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleRow(e.id)} style={{ width: 15, height: 15, accentColor: '#253584', cursor: 'pointer' }} /></div>
              <div style={{ color: '#253584', fontWeight: 700 }}>{e.id}</div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
              <div>{e.phone || '—'}</div>
              <div>{e.birthday ? new Date(e.birthday).toLocaleDateString('vi-VN') : '—'}</div>
              <div>{positionBadge(e.position)}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{e.created_at}</div>
              <div>
                <button onClick={ev => openEdit(e, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f97316' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 14px', background: '#fff', borderTop: '1px solid #eee', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#666', marginRight: 10 }}>Tổng: {filtered.length} nhân viên</span>
            {pages > 1 && (<>
              <PgBtn disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹</PgBtn>
              {Array.from({ length: pages }, (_, i) => <PgBtn key={i} active={i + 1 === safePage} onClick={() => setPage(i + 1)}>{i + 1}</PgBtn>)}
              <PgBtn disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>›</PgBtn>
            </>)}
          </div>
        </div>
      </div>

      <DeleteBar count={selected.size} onDelete={() => setShowConfirmDelete(true)} />
      {showConfirmDelete && <ConfirmDeleteModal count={selected.size} onConfirm={doDelete} onCancel={() => setShowConfirmDelete(false)} isPending={isPending} />}

      {showAddModal && (
        <Overlay>
          <EmployeeForm title="Thêm nhân viên mới"
            name={fName} phone={fPhone} birthday={fBirthday} position={fPosition}
            setName={setFName} setPhone={setFPhone} setBirthday={setFBirthday} setPosition={setFPosition}
            onSave={doAdd} onCancel={() => setShowAddModal(false)} isPending={isPending} />
        </Overlay>
      )}

      {editEmp && (
        <Overlay>
          <EmployeeForm title={`Chỉnh sửa: ${editEmp.id}`}
            name={fName} phone={fPhone} birthday={fBirthday} position={fPosition}
            setName={setFName} setPhone={setFPhone} setBirthday={setFBirthday} setPosition={setFPosition}
            onSave={doEdit} onCancel={() => setEditEmp(null)} isPending={isPending} />
        </Overlay>
      )}
    </>
  )
}

function EmployeeForm({ title, name, phone, birthday, position, setName, setPhone, setBirthday, setPosition, onSave, onCancel, isPending }: {
  title: string; name: string; phone: string; birthday: string; position: string
  setName: (v: string) => void; setPhone: (v: string) => void
  setBirthday: (v: string) => void; setPosition: (v: string) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 13, outline: 'none', color: '#222', background: '#fafafa' }
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '20px 18px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0E176E', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Tên nhân viên *</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên" style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Số điện thoại</div>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập SĐT" style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Ngày sinh</div>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Chức vụ</div>
          <select value={position} onChange={e => setPosition(e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }}>
            <option value="">-- Chọn chức vụ --</option>
            <option value="Quản lý">Quản lý</option>
            <option value="Nhân viên">Nhân viên</option>
            <option value="Xác nhận đơn">Xác nhận đơn</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={onSave} disabled={isPending} style={{ flex: 1, height: 38, background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{isPending ? '...' : 'Lưu'}</button>
        <button onClick={onCancel} style={{ flex: 1, height: 38, background: '#eee', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Hủy</button>
      </div>
    </div>
  )
}