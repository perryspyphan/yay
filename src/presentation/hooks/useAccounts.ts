'use client'

import { useState, useTransition } from 'react'
import type { Account, Employee } from '@/domain/entities/Staff'
import {
  addAccountUseCase,
  updateAccountUseCase,
  deleteAccountsUseCase,
} from '@/application/use-cases/staff/StaffUseCases'

export function useAccounts(initialAccounts: Account[], employees: Employee[]) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER = 8

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editAcc, setEditAcc] = useState<Account | null>(null)
  const [isPending, startTransition] = useTransition()

  const [fName, setFName] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fRole, setFRole] = useState<'admin' | 'staff'>('staff')
  const [fEmpId, setFEmpId] = useState('')

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase()
    return !q || a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const safePage = Math.min(page, pages)
  const slice = filtered.slice((safePage - 1) * PER, safePage * PER)

  const toggleRow = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = (c: boolean) => setSelected(c ? new Set(slice.map(a => a.id)) : new Set())

  const openAdd = () => { setFName(''); setFEmail(''); setFRole('staff'); setFEmpId(''); setShowAdd(true) }
  const openEdit = (a: Account, ev: React.MouseEvent) => {
    ev.stopPropagation()
    setEditAcc(a); setFName(a.name); setFEmail(a.email); setFRole(a.role); setFEmpId(a.employee_id || '')
  }

  const doAdd = () => {
    if (!fName || !fEmail) { alert('Vui lòng nhập đủ tên và email!'); return }
    startTransition(async () => {
      await addAccountUseCase({ name: fName, email: fEmail, role: fRole, employee_id: fEmpId })
      const today = new Date().toISOString().split('T')[0]
      const id = 'ACC' + String(accounts.length + 1).padStart(3, '0')
      setAccounts(p => [{ id, name: fName, email: fEmail, role: fRole, auth_id: null, employee_id: fEmpId || null, created_at: today }, ...p])
      setShowAdd(false)
    })
  }

  const doEdit = () => {
    if (!editAcc || !fName || !fEmail) return
    startTransition(async () => {
      await updateAccountUseCase(editAcc.id, { name: fName, email: fEmail, role: fRole })
      setAccounts(p => p.map(a => a.id === editAcc!.id ? { ...a, name: fName, email: fEmail, role: fRole } : a))
      setEditAcc(null)
    })
  }

  const doDelete = () => startTransition(async () => {
    await deleteAccountsUseCase([...selected])
    setAccounts(p => p.filter(a => !selected.has(a.id)))
    setSelected(new Set()); setShowConfirm(false)
  })

  const empName = (empId: string | null) => {
    if (!empId) return '—'
    const emp = employees.find(e => e.id === empId)
    return emp ? emp.name : empId
  }

  return {
    accounts, filtered, slice, pages, safePage, employees,
    search, setSearch, page, setPage,
    selected, showConfirm, setShowConfirm,
    showAdd, setShowAdd, editAcc, setEditAcc,
    fName, setFName, fEmail, setFEmail, fRole, setFRole, fEmpId, setFEmpId,
    toggleRow, toggleAll, openAdd, openEdit, doAdd, doEdit, doDelete, empName,
    isPending,
  }
}