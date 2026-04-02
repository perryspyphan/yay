// src/infrastructure/container/DIContainer.ts

import { SupabaseProductRepository }      from '../supabase/repositories/SupabaseProductRepository'
import { SupabaseOrderRepository }        from '../supabase/repositories/SupabaseOrderRepository'
import { SupabaseCustomerRepository }     from '../supabase/repositories/SupabaseCustomerRepository'
import { SupabaseDistributorRepository }  from '../supabase/repositories/SupabaseDistributorRepository'
import { SupabaseStaffRepository }        from '../supabase/repositories/SupabaseStaffRepository'
import { SupabasePhieuThuChiRepository,
         SupabaseLoaiThuChiRepository,
         SupabaseTaiKhoanQuyRepository }  from '../supabase/repositories/SupabaseCashbookRepository'

import type { ICustomerRepository }       from '@/domain/repositories/ICustomerRepository'
import type { IDistributorRepository }    from '@/domain/repositories/IDistributorRepository'
import type { IStaffRepository }          from '@/domain/repositories/IStaffRepository'
import type { IOrderRepository }          from '@/domain/repositories/IOrderRepository'
import type { IProductRepository }        from '@/domain/repositories/IProductRepository'
import type { IPhieuThuChiRepository,
              ILoaiThuChiRepository,
              ITaiKhoanQuyRepository }    from '@/domain/repositories/ICashbookRepository'

// ── Lazy singletons ────────────────────────────────────────────
let customerRepo:    ICustomerRepository    | null = null
let distributorRepo: IDistributorRepository | null = null
let staffRepo:       IStaffRepository       | null = null
let orderRepo:       IOrderRepository       | null = null
let productRepo:     IProductRepository     | null = null
let phieuRepo:       IPhieuThuChiRepository | null = null
let loaiRepo:        ILoaiThuChiRepository  | null = null
let taiKhoanRepo:    ITaiKhoanQuyRepository | null = null

// ── Existing repos ─────────────────────────────────────────────
export function getCustomerRepository(): ICustomerRepository {
  if (!customerRepo) customerRepo = new SupabaseCustomerRepository()
  return customerRepo
}

export function getDistributorRepository(): IDistributorRepository {
  if (!distributorRepo) distributorRepo = new SupabaseDistributorRepository()
  return distributorRepo
}

export function getStaffRepository(): IStaffRepository {
  if (!staffRepo) staffRepo = new SupabaseStaffRepository()
  return staffRepo
}

export function getOrderRepository(): IOrderRepository {
  if (!orderRepo) orderRepo = new SupabaseOrderRepository()
  return orderRepo
}

export function getProductRepository(): IProductRepository {
  if (!productRepo) productRepo = new SupabaseProductRepository()
  return productRepo
}

// ── Cashbook (Sổ quỹ) ─────────────────────────────────────────
export function getPhieuThuChiRepository(): IPhieuThuChiRepository {
  if (!phieuRepo) phieuRepo = new SupabasePhieuThuChiRepository()
  return phieuRepo
}

export function getLoaiThuChiRepository(): ILoaiThuChiRepository {
  if (!loaiRepo) loaiRepo = new SupabaseLoaiThuChiRepository()
  return loaiRepo
}

export function getTaiKhoanQuyRepository(): ITaiKhoanQuyRepository {
  if (!taiKhoanRepo) taiKhoanRepo = new SupabaseTaiKhoanQuyRepository()
  return taiKhoanRepo
}
