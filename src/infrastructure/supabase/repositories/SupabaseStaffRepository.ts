// src/infrastructure/supabase/repositories/SupabaseStaffRepository.ts

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IStaffRepository } from '@/domain/repositories/IStaffRepository'
import type { Employee, Account } from '@/domain/entities/Staff'
import bcrypt from 'bcryptjs'

export class SupabaseStaffRepository implements IStaffRepository {

  // ── EMPLOYEES ────────────────────────────────────────────────
  async getEmployees(search?: string): Promise<Employee[]> {
    const supabase = await createClient()
    let q = supabase.schema('nhan_su').from('employees').select('*').order('id')
    if (search) q = q.or(`id.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as Employee[]
  }

  async addEmployee(form: { name: string; phone: string; birthday: string; position: string }): Promise<void> {
    const supabase = await createClient()
    const { data: all } = await supabase.schema('nhan_su').from('employees')
      .select('id').order('id', { ascending: false }).limit(1)
    const nextNum = all?.[0]?.id ? parseInt(all[0].id.replace('NV', ''), 10) + 1 : 1
    const id = 'NV' + String(nextNum).padStart(3, '0')
    const { error } = await supabase.schema('nhan_su').from('employees').insert({
      id,
      name:       form.name,
      phone:      form.phone || null,
      birthday:   form.birthday || null,
      position:   form.position || null,
      created_at: new Date().toISOString().split('T')[0],
    })
    if (error) throw new Error(error.message)
    revalidatePath('/nhan-vien')
  }

  async updateEmployee(id: string, form: { name: string; phone: string; birthday: string; position: string }): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.schema('nhan_su').from('employees')
      .update({ name: form.name, phone: form.phone || null, birthday: form.birthday || null, position: form.position || null })
      .eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/nhan-vien')
  }

  async deleteEmployees(ids: string[]): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.schema('nhan_su').from('employees').delete().in('id', ids)
    if (error) throw new Error(error.message)
    revalidatePath('/nhan-vien')
  }

  // ── ACCOUNTS ─────────────────────────────────────────────────
  async getAccounts(search?: string, callerRole?: string): Promise<Account[]> {
    const supabase = await createClient()
    let q = supabase.schema('nhan_su').from('accounts').select('*').order('id')

    // Manager chỉ thấy tài khoản staff
    if (callerRole === 'manager') {
      q = q.eq('role', 'staff')
    }

    if (search) q = q.or(`id.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data, error } = await q
    if (error) throw new Error(error.message)

    const accounts = (data ?? []) as Account[]
    const empIds = accounts.map(a => a.employee_id).filter(Boolean) as string[]
    if (empIds.length > 0) {
      const { data: emps } = await supabase.schema('nhan_su')
        .from('employees').select('id, name').in('id', empIds)
      const empMap = Object.fromEntries((emps ?? []).map(e => [e.id, e.name]))
      return accounts.map(a => ({ ...a, employee_name: a.employee_id ? empMap[a.employee_id] || null : null }))
    }
    return accounts
  }

  async addAccount(form: {
    name: string
    email: string
    role: 'admin' | 'manager' | 'staff'
    employee_id: string
    callerRole?: string   // role của người đang tạo
  }): Promise<void> {
    const supabase = await createClient()

    // ── Phân quyền: manager chỉ tạo được staff ──────────────
    if (form.callerRole === 'manager' && form.role !== 'staff') {
      throw new Error('Quản lý chỉ được tạo tài khoản nhân viên')
    }

    // ── Sinh ID tiếp theo ────────────────────────────────────
    const { data: all } = await supabase.schema('nhan_su').from('accounts')
      .select('id').order('id', { ascending: false }).limit(1)
    const nextNum = all?.[0]?.id ? parseInt(all[0].id.replace('ACC', ''), 10) + 1 : 1
    const id = 'ACC' + String(nextNum).padStart(3, '0')

    // ── Tạo user trong Supabase Auth trước ──────────────────
    // Dùng service role để tạo user không cần xác nhận email
    const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!'
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: form.email,
      password: tempPassword,
      email_confirm: true,       // bỏ qua xác nhận email
    })
    if (authError) throw new Error('Lỗi tạo Auth user: ' + authError.message)

    const auth_id = authData.user?.id ?? null

    // ── Insert vào nhan_su.accounts ──────────────────────────
    const { error } = await supabase.schema('nhan_su').from('accounts').insert({
      id,
      name:        form.name,
      email:       form.email,
      role:        form.role,
      auth_id,
      employee_id: form.employee_id || null,
      created_at:  new Date().toISOString().split('T')[0],
    })
    if (error) {
      // Nếu insert thất bại thì xóa auth user vừa tạo (rollback)
      if (auth_id) await supabase.auth.admin.deleteUser(auth_id)
      throw new Error(error.message)
    }

    // ── Link employee → account ──────────────────────────────
    if (form.employee_id) {
      await supabase.schema('nhan_su').from('employees')
        .update({ account_id: id }).eq('id', form.employee_id)
    }

    revalidatePath('/tai-khoan')
  }

  async updateAccount(id: string, form: {
    name: string
    email: string
    role: 'admin' | 'manager' | 'staff'
    callerRole?: string
  }): Promise<void> {
    const supabase = await createClient()

    // ── Phân quyền: manager không sửa được admin/manager ────
    if (form.callerRole === 'manager') {
      const { data: target } = await supabase.schema('nhan_su').from('accounts')
        .select('role').eq('id', id).single()
      if (target?.role !== 'staff') {
        throw new Error('Quản lý chỉ được chỉnh sửa tài khoản nhân viên')
      }
      if (form.role !== 'staff') {
        throw new Error('Quản lý không được thay đổi role thành admin hoặc quản lý')
      }
    }

    const { error } = await supabase.schema('nhan_su').from('accounts')
      .update({ name: form.name, email: form.email, role: form.role }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/tai-khoan')
  }

  async deleteAccounts(ids: string[], callerRole?: string): Promise<void> {
    const supabase = await createClient()

    // ── Phân quyền: manager chỉ xóa được staff ──────────────
    if (callerRole === 'manager') {
      const { data: targets } = await supabase.schema('nhan_su').from('accounts')
        .select('id, role').in('id', ids)
      const hasNonStaff = (targets ?? []).some(t => t.role !== 'staff')
      if (hasNonStaff) {
        throw new Error('Quản lý chỉ được xóa tài khoản nhân viên')
      }
    }

    // Lấy auth_id để xóa khỏi Supabase Auth luôn
    const { data: accounts } = await supabase.schema('nhan_su').from('accounts')
      .select('id, auth_id').in('id', ids)

    const { error } = await supabase.schema('nhan_su').from('accounts').delete().in('id', ids)
    if (error) throw new Error(error.message)

    // Xóa auth users tương ứng
    for (const acc of accounts ?? []) {
      if (acc.auth_id) {
        await supabase.auth.admin.deleteUser(acc.auth_id)
      }
    }

    revalidatePath('/tai-khoan')
  }

  // ── PIN (bcrypt) ──────────────────────────────────────────────
  async verifyPin(accountId: string, pin: string): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase.schema('nhan_su').from('accounts')
      .select('pin_hash').eq('id', accountId).single()
    if (!data?.pin_hash) return false
    return bcrypt.compare(pin, data.pin_hash)
  }

  async updatePin(accountId: string, pin: string): Promise<void> {
    const supabase = await createClient()
    const pin_hash = await bcrypt.hash(pin, 10)
    const { error } = await supabase.schema('nhan_su').from('accounts')
      .update({ pin_hash }).eq('id', accountId)
    if (error) throw new Error(error.message)
  }
}