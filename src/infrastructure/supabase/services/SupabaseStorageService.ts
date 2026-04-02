// src/infrastructure/supabase/services/SupabaseStorageService.ts

import { createClient } from '@/infrastructure/supabase/client'
import type { IStorageService } from '@/application/ports/IStorageService'

export class SupabaseStorageService implements IStorageService {
  private client = createClient()

  async upload(bucket: string, path: string, file: File): Promise<string> {
    const { error } = await this.client.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    return this.getPublicUrl(bucket, path)
  }

  async remove(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([path])
    if (error) throw new Error(error.message)
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
}
