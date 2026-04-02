export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
export type OrderChannel = 'online' | 'offline'

export interface Order {
  id: string
  userId?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  channel: OrderChannel
  shippingAddress?: string
  createdAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unit: string
}