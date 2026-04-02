import { Suspense } from 'react'
import { LoginForm } from '@/presentation/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Đang tải form đăng nhập...</p>}>
      <LoginForm />
    </Suspense>
  )
}