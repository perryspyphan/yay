// src/application/ports/IAuthService.ts

export interface IAuthService {
  signIn(email: string, password: string): Promise<{ userId: string; email: string }>
  signUp(email: string, password: string, fullName: string): Promise<{ userId: string }>
  signOut(): Promise<void>
  getCurrentUserId(): Promise<string | null>
}
