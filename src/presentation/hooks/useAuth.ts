'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await SupabaseAuthService.signIn(email, password)
      router.push('/')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    setError(null)
    try {
      await SupabaseAuthService.signUp(email, password, fullName)
      router.push('/login?registered=true')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await SupabaseAuthService.signOut()
    window.location.replace('/login')
  }

  return { login, register, logout, loading, error }
}