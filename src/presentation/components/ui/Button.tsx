// src/presentation/components/ui/Button.tsx
import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#006E1C', color: '#fff', border: 'none' },
  secondary: { background: '#fff', color: '#49636F', border: '1px solid #e2e8f0' },
  danger:    { background: '#EF4444', color: '#fff', border: 'none' },
  ghost:     { background: 'transparent', color: '#49636F', border: 'none' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 30, padding: '0 12px', fontSize: 12, borderRadius: 6 },
  md: { height: 36, padding: '0 18px', fontSize: 14, borderRadius: 8 },
  lg: { height: 44, padding: '0 24px', fontSize: 15, borderRadius: 10 },
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  children, variant = 'primary', size = 'md',
  loading, icon, style, disabled, ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1, transition: 'opacity 0.15s',
        ...variantStyles[variant], ...sizeStyles[size], ...style,
      }}
    >
      {icon && !loading && icon}
      {loading && <span style={{ fontSize: 14 }}>⟳</span>}
      {children}
    </button>
  )
}
