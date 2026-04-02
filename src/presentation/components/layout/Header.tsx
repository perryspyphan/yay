'use client'
// ============================================================
//  src/presentation/components/layout/Header.tsx
//
//  Thay đổi so với cũ:
//  1. Nhận prop `role` từ Layout (server component truyền xuống)
//  2. Dùng getNavForRole(role) từ rbac.ts thay vì navItems cứng
//  3. Hiển thị tên + role badge của user đang đăng nhập
//  4. Có nút đăng xuất
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getNavForRole, type Role, type NavItem } from '@/lib/rbac'
import { createClient } from '@/infrastructure/supabase/client'

// ── Badge hiển thị role ──────────────────────────────────────
const ROLE_LABEL: Record<Role, string> = {
  admin:   'Admin',
  manager: 'Quản lý',
  staff:   'Nhân viên',
}

const ROLE_COLOR: Record<Role, { bg: string; color: string }> = {
  admin:   { bg: '#fff1cc', color: '#b45309' },
  manager: { bg: '#e0f2fe', color: '#0369a1' },
  staff:   { bg: '#e6f9f0', color: '#057a55' },
}

interface Props {
  role:      Role
  userName:  string   // tên hiển thị của user đang đăng nhập
}

const CLOSE_DELAY = 150

export default function Header({ role, userName }: Props) {
  const pathname   = usePathname()
  const router     = useRouter()

  // Lấy nav items đã được lọc theo role
  const navItems = getNavForRole(role)

  const [openLabel,    setOpenLabel]    = useState<string | null>(null)
  const [openSubLabel, setOpenSubLabel] = useState<string | null>(null)
  const navRef        = useRef<HTMLDivElement>(null)
  const closeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearClose    = () => { if (closeTimer.current)    clearTimeout(closeTimer.current) }
  const clearSubClose = () => { if (subCloseTimer.current) clearTimeout(subCloseTimer.current) }

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setOpenLabel(null)
      setOpenSubLabel(null)
    }, CLOSE_DELAY)
  }, [])

  const scheduleSubClose = useCallback(() => {
    subCloseTimer.current = setTimeout(() => {
      setOpenSubLabel(null)
    }, CLOSE_DELAY)
  }, [])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null)
        setOpenSubLabel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cleanup timers
  useEffect(() => () => {
    if (closeTimer.current)    clearTimeout(closeTimer.current)
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current)
  }, [])

  const isActive = (item: NavItem): boolean => {
    if (item.children) {
      return item.children.some(c =>
        c.children
          ? c.children.some(gc => pathname.startsWith(gc.href))
          : pathname.startsWith(c.href)
      )
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  // Đăng xuất
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const roleStyle = ROLE_COLOR[role]

  return (
    <>
      {/* Top bar */}
      <div style={{
        height: 40, background: '#1a2560',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', fontSize: 13, color: '#fff',
      }}>
        <span style={{ fontWeight: 700, letterSpacing: 1 }}>DGFarm Admin</span>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Role badge */}
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: roleStyle.bg, color: roleStyle.color,
          }}>
            {ROLE_LABEL[role]}
          </span>

          {/* Tên user */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 26, height: 26, background: '#253584', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, border: '2px solid #4a5db0',
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            {userName}
          </span>

          {/* Nút đăng xuất */}
          <span
            onClick={handleLogout}
            style={{ cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center', gap: 4 }}
            title="Đăng xuất"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div style={{
        height: 56, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#253584', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#253584', letterSpacing: '-0.5px' }}>DGFarm</span>
        </Link>

        {/* Nav — dùng navItems đã lọc theo role */}
        <nav ref={navRef} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map(item => {
            const active = isActive(item)
            const isOpen = openLabel === item.label

            return (
              <div key={item.label} style={{ position: 'relative' }}
                onMouseEnter={() => { clearClose(); if (item.children) setOpenLabel(item.label) }}
                onMouseLeave={() => { if (item.children) scheduleClose() }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                    fontWeight: active ? 700 : 500, fontSize: 14,
                    color: active ? '#253584' : '#444',
                    background: active ? '#eef2ff' : isOpen ? '#f5f7ff' : 'transparent',
                    userSelect: 'none', transition: 'background 0.15s',
                  }}
                  onClick={() => {
                    router.push(item.href)
                    if (!item.children) setOpenLabel(null)
                    setOpenSubLabel(null)
                  }}
                >
                  {item.label}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    style={{
                      transition: 'transform 0.2s',
                      transform: item.children
                        ? (isOpen ? 'rotate(90deg)' : 'rotate(0deg)')
                        : (active ? 'rotate(90deg)' : 'rotate(0deg)'),
                      opacity: 0.6,
                    }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                {/* Dropdown tầng 1 */}
                {item.children && isOpen && (
                  <div
                    style={{
                      position: 'absolute', top: '100%', left: 0,
                      minWidth: 160, background: '#fff',
                      borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      border: '1px solid #e5e7eb', zIndex: 500,
                      marginTop: 2, paddingTop: 4, paddingBottom: 4,
                    }}
                    onMouseEnter={() => { clearClose(); clearSubClose() }}
                    onMouseLeave={() => { scheduleClose() }}
                  >
                    {item.children.map(child => {
                      const childActive = child.children
                        ? child.children.some(gc => pathname.startsWith(gc.href))
                        : pathname.startsWith(child.href)
                      const subOpen = openSubLabel === child.label

                      return (
                        <div key={child.label} style={{ position: 'relative' }}
                          onMouseEnter={() => {
                            clearClose(); clearSubClose()
                            if (child.children) setOpenSubLabel(child.label)
                            else setOpenSubLabel(null)
                          }}
                          onMouseLeave={() => { if (child.children) scheduleSubClose() }}
                        >
                          <div
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              gap: 8, padding: '10px 16px', fontSize: 14,
                              fontWeight: childActive ? 700 : 500,
                              color: childActive ? '#253584' : '#333',
                              background: childActive ? '#eef2ff' : subOpen ? '#f5f7ff' : 'transparent',
                              cursor: 'pointer', whiteSpace: 'nowrap',
                              borderRadius: 4, margin: '0 4px',
                            }}
                            onClick={() => {
                              router.push(child.href)
                              setOpenLabel(null); setOpenSubLabel(null)
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: childActive ? '#253584' : '#ccc', flexShrink: 0 }} />
                              {child.label}
                            </div>
                            {child.children && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity={0.5}>
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            )}
                          </div>

                          {/* Dropdown tầng 2 */}
                          {child.children && subOpen && (
                            <div
                              style={{
                                position: 'absolute', top: -4, left: '100%',
                                minWidth: 160, background: '#fff',
                                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                border: '1px solid #e5e7eb', zIndex: 600,
                                marginLeft: -4, paddingTop: 4, paddingBottom: 4,
                              }}
                              onMouseEnter={() => { clearClose(); clearSubClose() }}
                              onMouseLeave={() => { scheduleSubClose(); scheduleClose() }}
                            >
                              {child.children.map(grandchild => {
                                const gcActive = pathname.startsWith(grandchild.href)
                                return (
                                  <Link
                                    key={grandchild.href}
                                    href={grandchild.href}
                                    onClick={() => { setOpenLabel(null); setOpenSubLabel(null) }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '10px 16px', fontSize: 14,
                                      fontWeight: gcActive ? 700 : 500,
                                      color: gcActive ? '#253584' : '#333',
                                      background: gcActive ? '#eef2ff' : 'transparent',
                                      textDecoration: 'none',
                                      borderRadius: 4, margin: '0 4px',
                                    }}
                                    onMouseEnter={e => { if (!gcActive) (e.currentTarget as HTMLElement).style.background = '#f5f7ff' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = gcActive ? '#eef2ff' : 'transparent' }}
                                  >
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: gcActive ? '#253584' : '#ddd', flexShrink: 0 }} />
                                    {grandchild.label}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ position: 'absolute', left: 10 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Tìm kiếm..."
            style={{
              height: 34, paddingLeft: 32, paddingRight: 12,
              border: '1px solid #e5e7eb', borderRadius: 8,
              fontSize: 13, outline: 'none', color: '#333',
              background: '#f9fafb', width: 180,
            }}
          />
        </div>
      </div>
    </>
  )
}