// src/infrastructure/supabase/repositories/SupabaseCashbookRepository.ts

import { createClient } from '@/infrastructure/supabase/server'
import type {
  IPhieuThuChiRepository,
  ILoaiThuChiRepository,
  ITaiKhoanQuyRepository,
  CashbookFilter,
  PagedResult,
} from '@/domain/repositories/ICashbookRepository'
import type {
  PhieuThuChi, LoaiThuChi, TaiKhoanQuy, TongQuyRow, CashbookKieu,
} from '@/domain/entities/Cashbook'

// ── Phiếu Thu Chi ──────────────────────────────────────────────
export class SupabasePhieuThuChiRepository implements IPhieuThuChiRepository {

  async findAll(filter: CashbookFilter): Promise<PagedResult<PhieuThuChi>> {
    const supabase = await createClient()
    const {
      tai_khoan_quy_id, kieu, trang_thai,
      tu_ngay, den_ngay, tu_khoa, loai_thu_chi_id,
      page = 1, page_size = 20,
    } = filter

    let q = supabase
      .from('cashbook_phieu')
      .select('*, loai_thu_chi:cashbook_loai(id,ten,kieu,hach_toan_kd), tai_khoan_quy:cashbook_tai_khoan(id,ten_tai_khoan,loai)', { count: 'exact' })
      .order('thoi_gian', { ascending: false })

    if (tai_khoan_quy_id) q = q.eq('tai_khoan_quy_id', tai_khoan_quy_id)
    if (kieu)             q = q.eq('kieu', kieu)
    if (trang_thai)       q = q.eq('trang_thai', trang_thai)
    if (tu_ngay)          q = q.gte('thoi_gian', tu_ngay)
    if (den_ngay)         q = q.lte('thoi_gian', den_ngay)
    if (loai_thu_chi_id)  q = q.eq('loai_thu_chi_id', loai_thu_chi_id)
    if (tu_khoa) {
      q = q.or(`ma_phieu.ilike.%${tu_khoa}%,ten_doi_tuong.ilike.%${tu_khoa}%,ghi_chu.ilike.%${tu_khoa}%`)
    }

    const from = (page - 1) * page_size
    q = q.range(from, from + page_size - 1)

    const { data, error, count } = await q
    if (error) throw new Error(error.message)

    return { data: (data ?? []) as unknown as PhieuThuChi[], total: count ?? 0, page, page_size }
  }

  async findById(id: string): Promise<PhieuThuChi | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_phieu')
      .select('*, loai_thu_chi:cashbook_loai(*), tai_khoan_quy:cashbook_tai_khoan(*)')
      .eq('id', id)
      .single()
    if (error) return null
    return data as unknown as PhieuThuChi
  }

  async create(payload: Omit<PhieuThuChi, 'id' | 'created_at' | 'updated_at'>): Promise<PhieuThuChi> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_phieu')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as unknown as PhieuThuChi
  }

  async update(id: string, payload: Partial<PhieuThuChi>): Promise<PhieuThuChi> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_phieu')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as unknown as PhieuThuChi
  }

  async huy(id: string): Promise<PhieuThuChi> {
    return this.update(id, { trang_thai: 'da_huy' })
  }

  async genMaPhieu(prefix: string): Promise<string> {
    const supabase = await createClient()
    const { count } = await supabase
      .from('cashbook_phieu')
      .select('*', { count: 'exact', head: true })
      .like('ma_phieu', `${prefix}%`)
    const seq = (count ?? 0) + 1
    return `${prefix}${String(seq).padStart(6, '0')}`
  }
}

// ── Loại Thu Chi ───────────────────────────────────────────────
export class SupabaseLoaiThuChiRepository implements ILoaiThuChiRepository {

  async findAll(kieu?: CashbookKieu): Promise<LoaiThuChi[]> {
    const supabase = await createClient()
    let q = supabase
      .from('cashbook_loai')
      .select('*')
      .order('la_he_thong', { ascending: false })
      .order('ten')
    if (kieu) q = q.eq('kieu', kieu)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as LoaiThuChi[]
  }

  async create(payload: Pick<LoaiThuChi, 'ten' | 'mo_ta' | 'kieu' | 'hach_toan_kd'>): Promise<LoaiThuChi> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_loai')
      .insert({ ...payload, la_he_thong: false })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as LoaiThuChi
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cashbook_loai')
      .delete()
      .eq('id', id)
      .eq('la_he_thong', false)
    if (error) throw new Error(error.message)
  }
}

// ── Tài Khoản Quỹ ──────────────────────────────────────────────
export class SupabaseTaiKhoanQuyRepository implements ITaiKhoanQuyRepository {

  async findAll(): Promise<TaiKhoanQuy[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_tai_khoan')
      .select('*')
      .order('la_mac_dinh', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as TaiKhoanQuy[]
  }

  async findById(id: string): Promise<TaiKhoanQuy | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_tai_khoan')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as TaiKhoanQuy
  }

  async create(payload: Omit<TaiKhoanQuy, 'id' | 'created_at' | 'updated_at'>): Promise<TaiKhoanQuy> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_tai_khoan')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as TaiKhoanQuy
  }

  async update(id: string, payload: Partial<TaiKhoanQuy>): Promise<TaiKhoanQuy> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cashbook_tai_khoan')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as TaiKhoanQuy
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('cashbook_tai_khoan').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async getTongQuy(): Promise<TongQuyRow[]> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('v_cashbook_tong_quy').select('*')
    if (error) throw new Error(error.message)
    return (data ?? []) as TongQuyRow[]
  }
}
