'use client'
import React, { useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const LoginForm = () => {
  const { login, loading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('') // Quản lý lỗi định dạng email
  const [showPass, setShowPass] = useState(false)
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  // Hàm kiểm tra định dạng email bằng Regex
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Vui lòng nhập email của bạn'
    if (!regex.test(email)) return 'Email không đúng định dạng (Ví dụ: ten@gmail.com)'
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Kiểm tra định dạng trước khi gửi request
    const errorMsg = validateEmail(email)
    if (errorMsg) {
      setEmailError(errorMsg)
      return
    }

    setEmailError('') // Xóa lỗi cũ nếu định dạng đúng
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#253980] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[#253980] text-2xl font-black font-['Montserrat',sans-serif]">DGFarm</span>
          </div>
          <h1 className="text-[#343C6A] text-2xl font-semibold">Đăng nhập</h1>
          <p className="text-[#718EBF] text-sm mt-1">Chào mừng bạn trở lại!</p>
        </div>

        <div className="bg-white rounded-[25px] p-8 shadow-sm">
          {/* Success message */}
          {justRegistered && (
            <div className="mb-4 p-3 bg-[#DCFAF8] rounded-xl text-[#16DBCC] text-sm text-center border border-[#16DBCC]/20">
              ✓ Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.
            </div>
          )}

        {/* Hiển thị lỗi tổng quát từ API (Sai mật khẩu, Email không tồn tại) */}
        {authError && (
          <div className="mb-4 p-3 bg-[#FFE0EB] rounded-xl text-red-600 text-xs text-center border border-red-200">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
              <span>
                {authError === 'Invalid login credentials' 
                  ? 'Email hoặc mật khẩu không chính xác' 
                  : authError}
              </span>
              
            </div>
          </div>
        )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email Field */}
            <div>
              <label className={`text-sm font-medium mb-1.5 block ${emailError ? 'text-red-500' : 'text-[#343C6A]'}`}>
                Email
              </label>
              <div className="relative">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? 'text-red-400' : 'text-[#718EBF]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('') // Xóa lỗi khi người dùng gõ lại
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all outline-none
                    ${emailError 
                      ? 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200' 
                      : 'border-[#DFE5EE] text-[#343C6A] focus:border-[#253980]'
                    }`}
                />
              </div>
              {/* Câu báo lỗi giống Google */}
              {emailError && (
                <div className="flex items-center gap-1 mt-1.5 text-red-500 text-[12px]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                   <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[#343C6A] text-sm font-medium mb-1.5 block">Mật khẩu</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-[#DFE5EE] rounded-xl text-sm text-[#343C6A] focus:outline-none focus:border-[#253980] transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718EBF] hover:text-[#253980]">
                  {showPass ? '👁️' : '👁️‍🗨️'} {/* Bạn có thể giữ lại SVG cũ ở đây */}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#253980] hover:bg-[#1a2d6b] text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 mt-2 active:scale-[0.98]"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-[#718EBF] text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-[#253980] font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}