// src/domain/value-objects/OrderStatus.ts

export type OrderWorkflowStatus =
  | 'Chờ xác nhận'
  | 'Đã xác nhận'
  | 'Đang giao'
  | 'Hoàn thành'
  | 'Đã hủy'

export const ORDER_STATUS_TRANSITIONS: Record<OrderWorkflowStatus, OrderWorkflowStatus[]> = {
  'Chờ xác nhận': ['Đã xác nhận', 'Đã hủy'],
  'Đã xác nhận':  ['Đang giao',   'Đã hủy'],
  'Đang giao':    ['Hoàn thành',  'Đã hủy'],
  'Hoàn thành':   [],
  'Đã hủy':       [],
}

export function canTransition(from: OrderWorkflowStatus, to: OrderWorkflowStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

export interface StatusStyle {
  background: string
  color: string
  border: string
}

export const STATUS_BADGE_STYLE: Record<OrderWorkflowStatus, StatusStyle> = {
  'Chờ xác nhận': { background: '#fff3cd', color: '#856404',  border: '1px solid #ffc107' },
  'Đã xác nhận':  { background: '#d1ecf1', color: '#0c5460',  border: '1px solid #bee5eb' },
  'Đang giao':    { background: '#d4edda', color: '#155724',  border: '1px solid #c3e6cb' },
  'Hoàn thành':   { background: '#d4edda', color: '#155724',  border: '1px solid #c3e6cb' },
  'Đã hủy':       { background: '#f8d7da', color: '#721c24',  border: '1px solid #f5c6cb' },
}
