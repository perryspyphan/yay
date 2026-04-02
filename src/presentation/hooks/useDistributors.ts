'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import type { Distributor, DistributorOrder, DistributorGroup } from '@/domain/entities/Distributor'
import {
  getOrdersByDistributorUseCase,
  addDistributorUseCase,
  updateDistributorUseCase,
  deleteDistributorsUseCase,
} from '@/application/use-cases/distributor/DistributorUseCases'

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

export function useDistributors(initialDistributors: Distributor[]) {
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

  const dateRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false) }
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

  const selectDate = (opt: string) => {
    const r = getDateRange(opt); setDateFrom(r.from); setDateTo(r.to); setDateLabel(opt); setShowDateDrop(false)
  }

  return {
    distributors, filtered, slice, pages, safePage,
    orders, loadingOrders, selected, expandedId,
    search, setSearch, groupFilter, setGroupFilter, statusFilter, setStatusFilter,
    minTotal, setMinTotal, maxTotal, setMaxTotal,
    minDebt, setMinDebt, maxDebt, setMaxDebt,
    dateFrom, setDateFrom, dateTo, setDateTo,
    dateLabel, setDateLabel, showDateDrop, setShowDateDrop,
    dateRef, DATE_OPTS, selectDate,
    page, setPage,
    showConfirmDelete, setShowConfirmDelete,
    showAddModal, setShowAddModal,
    editDist, setEditDist,
    fName, setFName, fPhone, setFPhone, fEmail, setFEmail,
    fAddress, setFAddress, fTax, setFTax, fGroup, setFGroup,
    toggleExpand, toggleRow, toggleAll,
    doDelete, openAdd, openEdit, doAdd, doEdit,
    isPending,
  }
}