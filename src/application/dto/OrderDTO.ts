// src/application/dto/OrderDTO.ts

export interface CreateOrderDTO {
  customerId: string
  customerName: string
  items: {
    productCode: string
    productName: string
    quantity: number
    unitPrice: number
    discount: number
  }[]
  note?: string
  channel?: 'online' | 'offline'
}

export interface UpdateOrderStatusDTO {
  orderId: string
  status: 'Đã xác nhận' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy'
  handledBy?: string
  note?: string
}

export interface OrderFiltersDTO {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
}
