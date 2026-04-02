// src/presentation/hooks/useCustomers.ts
'use client'

import { useState, useTransition } from 'react'
import type { Customer } from '@/domain/entities/Customer'
import {
  addCustomerUseCase,
  updateCustomerUseCase,
  deleteCustomersUseCase,
} from '@/application/use-cases/customer/CustomerUsecase'
import type { AddCustomerDTO, UpdateCustomerDTO } from '@/application/dto/CustomerDTO'

export function useCustomers(initialCustomers: Customer[]) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(form: AddCustomerDTO, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        await addCustomerUseCase(form)
        onSuccess?.()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleUpdate(id: string, form: UpdateCustomerDTO, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        await updateCustomerUseCase(id, form)
        setCustomers(prev =>
          prev.map(c => c.id === id ? { ...c, ...form } : c)
        )
        onSuccess?.()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleDelete(ids: string[], onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        await deleteCustomersUseCase(ids)
        setCustomers(prev => prev.filter(c => !ids.includes(c.id)))
        onSuccess?.()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  return { customers, setCustomers, isPending, error, handleAdd, handleUpdate, handleDelete }
}
