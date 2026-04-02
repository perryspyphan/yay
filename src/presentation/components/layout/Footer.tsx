// src/presentation/components/layout/Footer.tsx
import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background: '#fff', borderTop: '1px solid #E5E7EB',
      padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', fontSize: 13, color: '#9CA3AF',
    }}>
      <span>© {new Date().getFullYear()} Golden Farm. Hệ thống quản lý bán hàng.</span>
      <span>v1.0.0</span>
    </footer>
  )
}
