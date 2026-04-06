// src/app/(admin)/hang-hoa/kiem-kho/page.tsx
import { InventoryCheckList } from '@/presentation/components/product/inventory-check/Inventorychecklist'

export const dynamic = 'force-dynamic'

export default function KiemKhoPage() {
  return <InventoryCheckList />
}