'use client'
import { useState } from 'react'
import { HarvestManager } from '@/presentation/components/product/harvest/HarvestManager'
import { HarvestReport } from '@/presentation/components/product/harvest/HarvestReport'

export default function ThuHoachPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 24, padding: 24 }}>
      <HarvestManager
        currentUser="Admin"
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
      <div style={{ flex: 1 }}>
        <HarvestReport key={refreshKey} />
      </div>
    </div>
  )
}