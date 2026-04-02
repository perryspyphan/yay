// src/application/dto/CashbookDTO.ts

import type { CashbookKieu, CashbookNhomDoiTuong } from '@/domain/entities/Cashbook'

export interface LapPhieuDTO {
  tai_khoan_quy_id: string
  thoi_gian: string
  loai_thu_chi_id: string
  nhom_doi_tuong: CashbookNhomDoiTuong
  ten_doi_tuong: string | null
  gia_tri: number
  hach_toan_kd: boolean
  ghi_chu: string | null
}

export interface CapNhatPhieuDTO {
  thoi_gian?: string
  ten_doi_tuong?: string | null
  gia_tri?: number
  ghi_chu?: string | null
  hach_toan_kd?: boolean
}

export interface ThemLoaiDTO {
  ten: string
  mo_ta: string | null
  kieu: CashbookKieu
  hach_toan_kd: boolean
}

export interface ThemTaiKhoanDTO {
  ten_tai_khoan: string
  so_tai_khoan: string | null
  ngan_hang: string | null
  chu_tai_khoan: string | null
  loai: 'ngan_hang' | 'vi_dien_tu'
  la_mac_dinh: boolean
  so_du_dau_ky: number
  ghi_chu: string | null
}

export interface CashbookFilterDTO {
  tai_khoan_quy_id?: string
  kieu?: CashbookKieu
  trang_thai?: 'da_thanh_toan' | 'da_huy'
  tu_ngay?: string
  den_ngay?: string
  tu_khoa?: string
  loai_thu_chi_id?: string
  page?: number
  page_size?: number
}
