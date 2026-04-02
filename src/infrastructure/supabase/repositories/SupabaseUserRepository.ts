// src/infrastructure/supabase/repositories/SupabaseUserRepository.ts

import { createClient } from '@/infrastructure/supabase/server'
import type { IUserRepository } from '@/domain/repositories/IUserRepository'
import type { User } from '@/domain/entities/User'

export class SupabaseUserRepository implements IUserRepository {

  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return {
      id:        user.id,
      email:     user.email ?? '',
      fullName:  user.user_metadata?.full_name ?? null,
      role:      (user.user_metadata?.role as 'admin' | 'staff') ?? 'staff',
      createdAt: user.created_at,
    }
  }

  async findById(id: string): Promise<User | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('nhan_su.accounts')
      .select('id, name, email, role, created_at')
      .eq('auth_id', id)
      .single()
    if (error || !data) return null
    return {
      id,
      email:     data.email,
      fullName:  data.name,
      role:      data.role,
      createdAt: data.created_at,
    }
  }

  async updateRole(id: string, role: 'admin' | 'staff'): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('nhan_su.accounts')
      .update({ role })
      .eq('auth_id', id)
    if (error) throw new Error(error.message)
  }
}
