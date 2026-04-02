import type { Product, ProductFilters } from '../entities/Product'

export interface IProductRepository {
  getAll(filters?: ProductFilters): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  add(data: Omit<Product, 'id' | 'code' | 'created_at'>): Promise<void>
  update(id: string, data: Partial<Omit<Product, 'id' | 'code' | 'created_at'>>): Promise<void>
  deleteMany(ids: string[]): Promise<void>
  findTopSelling(): Promise<{ product: Product; totalSold: number }[]>
}