import React from 'react'

export function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

export function PgBtn({ children, active, disabled, onClick }: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 28, height: 28,
        border: '1px solid #ccc',
        background: active ? '#253584' : '#fff',
        color: active ? '#fff' : '#000',
        borderColor: active ? '#253584' : '#ccc',
        borderRadius: 4, fontSize: 12,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: '0 6px',
      }}
    >
      {children}
    </button>
  )
}

export function SbCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '12px 14px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#000', marginBottom: 8 }}>{title}</div>
      <hr style={{ border: 'none', borderTop: '1px solid #E0E0E0', margin: '0 0 8px' }} />
      {children}
    </div>
  )
}

export function DeleteBar({ count, onDelete }: { count: number; onDelete: () => void }) {
  if (count === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 36, zIndex: 300 }}>
      <button
        onClick={onDelete}
        style={{
          background: '#FF7433', color: '#fff', border: 'none', borderRadius: 7,
          height: 42, padding: '0 24px', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
        }}
      >
        🗑 Xóa đã chọn ({count})
      </button>
    </div>
  )
}

export function ConfirmDeleteModal({ count, onConfirm, onCancel, isPending }: {
  count: number
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <Overlay>
      <div style={{
        width: 300, background: '#fff', borderRadius: 16,
        padding: '24px 20px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: '#222', lineHeight: 1.65, marginBottom: 18 }}>
          Xóa <strong style={{ color: '#253584' }}>{count}</strong> mục đã chọn?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, height: 36, border: 'none', borderRadius: 7, background: '#ADFF66', color: '#2d6a00', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >Hủy</button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            style={{ flex: 1, height: 36, border: 'none', borderRadius: 7, background: '#FF7433', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >{isPending ? '...' : 'Xóa'}</button>
        </div>
      </div>
    </Overlay>
  )
}

export const btnGreen: React.CSSProperties = {
  background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 5,
  height: 38, padding: '0 18px', fontWeight: 700, fontSize: 13,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
}

export const btnIcon: React.CSSProperties = {
  background: '#4BCC3A', color: '#fff', border: 'none', borderRadius: 5,
  height: 38, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}