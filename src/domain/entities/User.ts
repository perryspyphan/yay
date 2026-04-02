// src/domain/entities/User.ts
// Mapping với Supabase Auth user

export interface User {
  id: string          // Supabase auth UUID
  email: string
  fullName: string | null
  role: 'admin' | 'staff'
  createdAt: string
}
