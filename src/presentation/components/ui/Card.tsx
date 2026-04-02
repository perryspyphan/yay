// src/presentation/components/ui/Card.tsx
import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  style?: React.CSSProperties
  bodyStyle?: React.CSSProperties
}

export function Card({ children, title, style, bodyStyle }: CardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden', ...style,
    }}>
      {title && (
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid #F3F4F6',
          fontWeight: 700, fontSize: 15, color: '#111827',
        }}>
          {title}
        </div>
      )}
      <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
    </div>
  )
}

export function StatCard({
  label, value, icon, color = '#006E1C', bg = '#d1fae5',
}: {
  label: string; value: string | number
  icon?: React.ReactNode; color?: string; bg?: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      {icon && (
        <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color, fontSize: 20 }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{value}</div>
      </div>
    </div>
  )
}
