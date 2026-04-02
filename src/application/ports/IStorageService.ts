// src/application/ports/IStorageService.ts

export interface IStorageService {
  /** Upload file và trả về public URL */
  upload(bucket: string, path: string, file: File): Promise<string>
  /** Xóa file theo path */
  remove(bucket: string, path: string): Promise<void>
  /** Lấy public URL */
  getPublicUrl(bucket: string, path: string): string
}
