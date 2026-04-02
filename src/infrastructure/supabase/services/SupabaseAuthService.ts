import { createClient } from '../client'

export const SupabaseAuthService = {
  async signUp(email: string, password: string, fullName: string) {
    const client = createClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const client = createClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const client = createClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const client = createClient()
    const { data: { user } } = await client.auth.getUser()
    return user
  }
}