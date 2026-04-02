// src/domain/entities/Cashbook.ts

export type CashbookKieu = 'thu' | 'chi'
export type CashbookTrangThai = 'da_thanh_toan' | 'da_huy'
export type CashbookLoaiTaiKhoan = 'tien_mat' | 'ngan_hang' | 'vi_dien_tu'
export type CashbookNhomDoiTuong = 'khach_hang' | 'nha_cung_cap' | 'nhan_vien' | 'khac'

export interface PhieuThuChi {
  id: string
  ma_phieu: string
  kieu: CashbookKieu
  thoi_gian: string
  loai_thu_chi_id: string | null
  loai_thu_chi?: LoaiThuChi
  tai_khoan_quy_id: string
  tai_khoan_quy?: TaiKhoanQuy
  gia_tri: number
  nhom_doi_tuong: CashbookNhomDoiTuong | null
  ten_doi_tuong: string | null
  doi_tuong_id: string | null
  hach_toan_kd: boolean
  trang_thai: CashbookTrangThai
  ma_chung_tu_goc: string | null
  ghi_chu: string | null
  nguoi_dung_tao: string | null
  nhan_vien_tao: string | null
  chi_nhanh: string | null
  created_at: string
  updated_at: string
}

export interface LoaiThuChi {
  id: string
  ten: string
  mo_ta: string | null
  kieu: CashbookKieu
  hach_toan_kd: boolean
  la_he_thong: boolean
  created_at: string
  updated_at: string
}

export interface TaiKhoanQuy {
  id: string
  ten_tai_khoan: string
  so_tai_khoan: string | null
  ngan_hang: string | null
  chu_tai_khoan: string | null
  loai: CashbookLoaiTaiKhoan
  la_mac_dinh: boolean
  so_du_dau_ky: number
  ghi_chu: string | null
  created_at: string
  updated_at: string
}

export interface TongQuyRow {
  id: string
  ten_tai_khoan: string
  loai: CashbookLoaiTaiKhoan
  so_du_dau_ky: number
  tong_thu: number
  tong_chi: number
  ton_quy: number
}
