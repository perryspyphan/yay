// src/domain/repositories/IUserRepository.ts

import type { User } from '@/domain/entities/User'

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>
  findById(id: string): Promise<User | null>
  updateRole(id: string, role: 'admin' | 'staff'): Promise<void>
}
