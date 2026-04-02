export type DistributorGroup = 'Nhỏ lẻ' | 'Trung bình' | 'Lớn'

export interface Distributor {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tax_code: string | null
  group: DistributorGroup
  total_buy: number
  debt: number
  status: string
  created_at: string
}

export interface DistributorOrder {
  id: string
  distributor_id: string
  total: number
  debt_amount: number
  status: string
  ordered_at: string
  staff_id: string | null
  discount_pct: number
  discount_confirmed_by: string | null
  discount_confirmed_at: string | null
  invoice_date: string | null
  delivery_date: string | null
  delivery_location: string | null
  note: string | null
  staff_name?: string
  confirmed_by_name?: string
}

export interface DistributorOrderItem {
  id: number
  order_id: string
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  sell_price: number
}

export interface DistributorOrderWithItems extends DistributorOrder {
  distributor: Distributor
  items: DistributorOrderItem[]
}