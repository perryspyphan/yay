'use client'
import React, { useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import Link from 'next/link'

export const RegisterForm = () => {
  const { register, loading, error } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [matchError, setMatchError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMatchError('Mật khẩu không khớp!')
      return
    }
    setMatchError('')
    register(email, password, fullName)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#253980] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[#253980] text-2xl font-black font-['Montserrat',sans-serif]">DGFarm</span>
          </div>
          <h1 className="text-[#343C6A] text-2xl font-semibold">Tạo tài khoản</h1>
          <p className="text-[#718EBF] text-sm mt-1">Đăng ký để bắt đầu sử dụng DGFarm</p>
        </div>

        <div className="bg-white rounded-[25px] p-8 shadow-sm">
          {(error || matchError) && (
            <div className="mb-4 p-3 bg-[#FFE0EB] rounded-xl text-red-600 text-sm text-center">
              {matchError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label className="text-[#343C6A] text-sm font-medium mb-1.5 block">Họ và tên</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" placeholder="Nguyễn Văn A" value={fullName}
                  onChange={e => setFullName(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-[#DFE5EE] rounded-xl text-sm text-[#343C6A] placeholder-[#718EBF] focus:outline-none focus:border-[#253980] transition-colors"/>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[#343C6A] text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" placeholder="email@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-[#DFE5EE] rounded-xl text-sm text-[#343C6A] placeholder-[#718EBF] focus:outline-none focus:border-[#253980] transition-colors"/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[#343C6A] text-sm font-medium mb-1.5 block">Mật khẩu</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" placeholder="Tối thiểu 6 ký tự" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-[#DFE5EE] rounded-xl text-sm text-[#343C6A] placeholder-[#718EBF] focus:outline-none focus:border-[#253980] transition-colors"/>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="text-[#343C6A] text-sm font-medium mb-1.5 block">Xác nhận mật khẩu</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" placeholder="Nhập lại mật khẩu" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-[#DFE5EE] rounded-xl text-sm text-[#343C6A] placeholder-[#718EBF] focus:outline-none focus:border-[#253980] transition-colors"/>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#253980] hover:bg-[#1a2d6b] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-[#718EBF] text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[#253980] font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}