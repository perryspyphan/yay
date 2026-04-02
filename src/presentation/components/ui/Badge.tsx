// src/presentation/components/ui/Badge.tsx
import React from 'react'

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange'

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  green:  { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' },
  red:    { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  yellow: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  blue:   { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
  gray:   { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
  orange: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'gray', style }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap', ...variantStyles[variant], ...style,
    }}>
      {children}
    </span>
  )
}
