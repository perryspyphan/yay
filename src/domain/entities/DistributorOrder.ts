// Tầng Domain — không phụ thuộc vào bất kỳ framework nào

export type DistributorOrderStatus =
  | 'Chờ giao'
  | 'Đang giao'
  | 'Hoàn thành'
  | 'Đã huỷ'

export interface DistributorOrderItem {
  id?: number
  order_id: string
  product_code: string
  product_name: string
  unit: string
  quantity: number
  unit_price: number
  sell_price: number
}

export interface DistributorOrder {
  id: string                          // 'HDN000025'
  distributor_id: string              // 'NPP001'
  distributor_name?: string           // join từ distributors
  total: number                       // tổng sau chiết khấu
  subtotal: number                    // tổng trước chiết khấu
  discount_pct: number                // % chiết khấu, default 0
  discount_confirmed_by: string | null // tên người áp chiết khấu
  discount_confirmed_at: string | null // thời điểm áp
  status: DistributorOrderStatus
  ordered_at: string
  delivery_date: string | null
  note: string | null
  ordered_by: string | null           // account_id người tạo đơn
}

export interface DistributorOrderWithItems extends DistributorOrder {
  items: DistributorOrderItem[]
}