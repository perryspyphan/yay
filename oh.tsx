

/*'use client'

import { JSX } from 'react'
// ============================================================
// Dashboard.tsx - Viết lại từ Figma CSS, KHÔNG cần import SVG
// Đặt vào: src/presentation/components/dashboard/Dashboard.tsx
// ============================================================

import { MonthlyRevenueSection } from './MonthlyRevenueSection'
import { RecentActivitiesSection } from './RecentActivitiesSection'
import { SalesChannelsSection } from './SalesChannelsSection'
import { SalesPerformanceSection } from './SalesPerformanceSection'

const navItems = [
  { label: 'Tổng quan', href: '#' },
  { label: 'Hàng hóa', href: '#' },
  { label: 'Giao dịch', href: '#' },
  { label: 'Đối tác', href: '#' },
  { label: 'Nhân viên', href: '#' },
  { label: 'Sổ quỹ', href: '#' },
  { label: 'Báo cáo', href: '#' },
]

const statCards = [
  {
    label: '6 hóa đơn',
    value: '$12,750',
    iconBg: 'bg-[#FFF5D9]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm0 2c-5.33 0-8 2.686-8 4v1h16v-1c0-1.314-2.67-4-8-4z" fill="#FFBB38"/>
      </svg>
    ),
  },
  {
    label: 'Đơn online',
    value: '$3,460',
    iconBg: 'bg-[#FFE0EB]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" fill="#FF82AC"/>
      </svg>
    ),
  },
  {
    label: 'Sắp hết hạn',
    value: '9',
    iconBg: 'bg-[#DCFAF8]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#16DBCC"/>
      </svg>
    ),
  },
]

export const Dashboard = (): JSX.Element => {
  return (
    <div className="relative min-h-screen bg-[#F5F7FA] font-['Inter',sans-serif]">

      {/* ── Top bar (xanh đậm) ── */}
      <div className="w-full h-8 bg-[#253980] flex items-center px-6 justify-between">
        <span className="text-white text-sm font-medium tracking-tight font-['Montserrat',sans-serif]">
          DGFarm Admin
        </span>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 bg-[#1a2d6b] hover:bg-[#162560] px-3 py-0.5 rounded-full text-white text-sm font-medium font-['Montserrat',sans-serif] transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v2H3V3zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
            </svg>
            Bán online
          </button>
          <button className="flex items-center gap-1.5 bg-[#1a2d6b] hover:bg-[#162560] px-3 py-0.5 rounded-full text-white text-sm font-medium font-['Montserrat',sans-serif] transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            Tại quầy
          </button>
          <span className="text-white text-sm font-medium font-['Montserrat',sans-serif]">Admin</span>
        </div>
      </div>

      {/* ── Header trắng + Logo + Nav ── */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#253980] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[#253980] text-xl font-black font-['Montserrat',sans-serif]">DGFarm</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 text-[#253980] text-sm font-medium font-['Montserrat',sans-serif] tracking-tight hover:text-[#1a2d6b] transition-colors"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L9 5L5 9" stroke="#253980" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-3 py-1.5">
            <svg className="w-4 h-4 text-[#718EBF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Tìm kiếm..." className="bg-transparent text-sm text-[#718EBF] outline-none w-28"/>
          </div>
        </div>
      </div>

      {/* ── Đường kẻ xanh ── */}
      <div className="w-full h-px bg-[#253980]" />

      {/* ── Main content ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">

        {/* Tiêu đề */}
        <h2 className="text-[#343C6A] text-[22px] font-semibold mb-6">
          Kết quả bán hàng hôm nay
        </h2>

        {/* Stat Cards */}
        <div className="flex gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-[25px] px-8 py-5 flex items-center gap-4 shadow-sm min-w-[220px]">
              <div className={`${card.iconBg} w-14 h-14 rounded-full flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[#718EBF] text-sm">{card.label}</p>
                <p className="text-[#232323] text-2xl font-semibold">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Monthly Revenue - chiếm 2/3 */}
          <div className="col-span-2">
            <MonthlyRevenueSection />
          </div>
          {/* Recent Activities - chiếm 1/3 */}
          <div className="col-span-1">
            <RecentActivitiesSection />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Top sản phẩm - chiếm 2/3 */}
          <div className="col-span-2">
            <SalesPerformanceSection />
          </div>
          {/* Kênh bán hàng - chiếm 1/3 */}
          <div className="col-span-1">
            <SalesChannelsSection />
          </div>
        </div>

      </div>
    </div>
  )
}
*/