// src/application/dto/CartDTO.ts

export interface AddToCartDTO {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  imageUrl?: string
}

export interface UpdateCartItemDTO {
  productId: string
  quantity: number   // 0 = xóa
}

export interface CartSummaryDTO {
  itemCount: number
  total: number
  items: {
    productId: string
    productCode: string
    productName: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
}
