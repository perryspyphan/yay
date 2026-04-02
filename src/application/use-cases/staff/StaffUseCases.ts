'use server'
// src/application/use-cases/staff/StaffUseCases.ts

import { getStaffRepository } from '@/infrastructure/container/DIContainer'

// ── EMPLOYEES ────────────────────────────────────────────────
export async function getEmployeesUseCase(search?: string) {
  return getStaffRepository().getEmployees(search)
}

export async function addEmployeeUseCase(form: {
  name: string; phone: string; birthday: string; position: string
}) {
  return getStaffRepository().addEmployee(form)
}

export async function updateEmployeeUseCase(id: string, form: {
  name: string; phone: string; birthday: string; position: string
}) {
  return getStaffRepository().updateEmployee(id, form)
}

export async function deleteEmployeesUseCase(ids: string[]) {
  return getStaffRepository().deleteEmployees(ids)
}

// ── ACCOUNTS ─────────────────────────────────────────────────
export async function getAccountsUseCase(search?: string, callerRole?: string) {
  return getStaffRepository().getAccounts(search, callerRole)
}

export async function addAccountUseCase(form: {
  name: string; email: string; role: 'admin' | 'manager' | 'staff'
  employee_id: string; callerRole?: string
}) {
  return getStaffRepository().addAccount(form)
}

export async function updateAccountUseCase(id: string, form: {
  name: string; email: string; role: 'admin' | 'manager' | 'staff'
  callerRole?: string
}) {
  return getStaffRepository().updateAccount(id, form)
}

export async function deleteAccountsUseCase(ids: string[], callerRole?: string) {
  return getStaffRepository().deleteAccounts(ids, callerRole)
}

// ── PIN ──────────────────────────────────────────────────────
export async function verifyPinUseCase(accountId: string, pin: string): Promise<boolean> {
  return getStaffRepository().verifyPin(accountId, pin)
}

export async function updatePinUseCase(accountId: string, pinHash: string): Promise<void> {
  return getStaffRepository().updatePin(accountId, pinHash)
}